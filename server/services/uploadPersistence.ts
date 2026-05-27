import { createHash } from 'crypto';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { extname, join } from 'path';
import { extractFromDocument, type ExtractedFinancials } from './documentExtractor.js';
import { getStorageStatus, uploadFile } from './storageService.js';

interface UploadedBufferFile {
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
}

export interface PersistedUploadInfo {
  originalName: string;
  storedName: string;
  storageKey: string;
  storageUrl: string;
  storageProvider: string;
  size: number;
  mimeType: string;
  contentHash: string;
}

export async function persistUploadedFile(
  storageScope: number | string,
  file: UploadedBufferFile,
): Promise<PersistedUploadInfo> {
  const { key, url } = await uploadFile(storageScope, file.originalname, file.buffer, file.mimetype);
  const storageStatus = getStorageStatus();

  return {
    originalName: file.originalname,
    storedName: key,
    storageKey: key,
    storageUrl: url,
    storageProvider: storageStatus.provider,
    size: file.size,
    mimeType: file.mimetype,
    contentHash: createHash('sha256').update(file.buffer).digest('hex'),
  };
}

export async function extractFinancialsFromUploadBuffer(
  file: UploadedBufferFile,
): Promise<ExtractedFinancials> {
  const dir = await mkdtemp(join(tmpdir(), 'smbx-upload-'));
  const ext = extname(file.originalname).toLowerCase() || '.bin';
  const tempPath = join(dir, `source${ext}`);

  try {
    await writeFile(tempPath, file.buffer);
    return await extractFromDocument(tempPath, file.originalname);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
