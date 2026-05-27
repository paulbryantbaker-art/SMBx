/**
 * Storage Service — S3-backed file storage with local fallback.
 *
 * Upload files to S3 with keys like: deals/{dealId}/{timestamp}_{filename}
 * Download via presigned URLs (60-minute expiry).
 * Falls back to local filesystem when S3 is not configured (dev mode).
 */
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join, resolve } from 'path';
import { getUploadRoot } from './uploadRoot.js';

// ─── Configuration ──────────────────────────────────────────────────

const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_ENDPOINT = process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3;
const S3_FORCE_PATH_STYLE = process.env.S3_FORCE_PATH_STYLE === 'true' || Boolean(S3_ENDPOINT);
const USE_S3 = !!(S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

let s3: S3Client | null = null;

if (USE_S3) {
  s3 = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT || undefined,
    forcePathStyle: S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  console.log(`[storage] S3-compatible storage configured: bucket=${S3_BUCKET}, region=${S3_REGION}, endpoint=${S3_ENDPOINT || 'aws'}`);
} else {
  console.log('[storage] S3 not configured — using local filesystem fallback');
}

function storageScopeToKeyPrefix(scope: number | string): string {
  if (typeof scope === 'number') return `deals/${scope}`;

  const normalized = scope
    .split('/')
    .map(segment => segment.replace(/[^a-zA-Z0-9._=-]/g, '_'))
    .filter(Boolean)
    .join('/');

  return normalized || 'misc';
}

function safeStorageFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_') || 'upload.bin';
}

// ─── Upload ─────────────────────────────────────────────────────────

export async function uploadFile(
  storageScope: number | string,
  filename: string,
  buffer: Buffer,
  contentType?: string,
): Promise<{ key: string; url: string }> {
  const prefix = storageScopeToKeyPrefix(storageScope);
  const safeFilename = `${Date.now()}_${randomUUID()}_${safeStorageFilename(filename)}`;
  const key = `${prefix}/${safeFilename}`;

  if (USE_S3 && s3) {
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      ServerSideEncryption: 'AES256',
    }));

    return { key, url: `s3://${S3_BUCKET}/${key}` };
  }

  // Local fallback
  const LOCAL_ROOT = getUploadRoot();
  const dir = join(LOCAL_ROOT, prefix);
  await mkdir(dir, { recursive: true });
  const localPath = join(dir, safeFilename);
  await writeFile(localPath, buffer);

  return { key, url: localPath };
}

// ─── Download (get buffer) ──────────────────────────────────────────

export async function downloadFile(fileUrl: string): Promise<Buffer> {
  // S3 path
  if (fileUrl.startsWith('s3://') && s3) {
    const withoutProtocol = fileUrl.replace('s3://', '');
    const slashIdx = withoutProtocol.indexOf('/');
    const bucket = withoutProtocol.substring(0, slashIdx);
    const key = withoutProtocol.substring(slashIdx + 1);

    const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  // Local path fallback
  return readFile(fileUrl);
}

// ─── Presigned URL (for browser download) ───────────────────────────

export async function getPresignedDownloadUrl(
  fileUrl: string,
  filename?: string,
  expiresIn = 3600,
): Promise<string> {
  if (fileUrl.startsWith('s3://') && s3) {
    const withoutProtocol = fileUrl.replace('s3://', '');
    const slashIdx = withoutProtocol.indexOf('/');
    const bucket = withoutProtocol.substring(0, slashIdx);
    const key = withoutProtocol.substring(slashIdx + 1);

    return getSignedUrl(s3, new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: filename ? `attachment; filename="${filename}"` : undefined,
    }), { expiresIn });
  }

  // Local: can't generate presigned URL — return a placeholder
  // The caller should serve the file directly in this case
  return fileUrl;
}

// ─── Delete ─────────────────────────────────────────────────────────

export async function deleteFile(fileUrl: string): Promise<void> {
  if (fileUrl.startsWith('s3://') && s3) {
    const withoutProtocol = fileUrl.replace('s3://', '');
    const slashIdx = withoutProtocol.indexOf('/');
    const bucket = withoutProtocol.substring(0, slashIdx);
    const key = withoutProtocol.substring(slashIdx + 1);

    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return;
  }

  // Local: just let it be (don't delete local files by default)
}

// ─── Check if S3 is active ──────────────────────────────────────────

export function isS3Active(): boolean {
  return USE_S3;
}

export function getStorageStatus() {
  const localRoot = getUploadRoot();
  const resolvedLocalRoot = resolve(localRoot);
  const localLooksPersistent = resolvedLocalRoot === '/data/uploads' || resolvedLocalRoot.startsWith('/data/uploads/');

  return {
    provider: USE_S3 ? 's3-compatible' : 'local',
    persistent: USE_S3 || localLooksPersistent,
    bucket: USE_S3 ? S3_BUCKET : null,
    region: USE_S3 ? S3_REGION : null,
    endpoint: USE_S3 ? S3_ENDPOINT || null : null,
    localRoot: USE_S3 ? null : localRoot,
    localLooksPersistent,
  };
}

export function isPersistentStorageConfigured(): boolean {
  return getStorageStatus().persistent;
}
