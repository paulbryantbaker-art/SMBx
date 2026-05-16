import path from 'path';

export function getUploadRoot(): string {
  if (process.env.UPLOAD_PATH) return process.env.UPLOAD_PATH;
  if (process.env.NODE_ENV === 'production') return '/data/uploads';
  return path.resolve(process.cwd(), 'uploads');
}
