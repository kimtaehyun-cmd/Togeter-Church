import path from 'path';

export const PUBLIC_UPLOAD_URL_PREFIX = '/uploads';

export function getUploadsRootDir() {
  return path.join(process.cwd(), 'public', 'uploads');
}

export function ensurePathInsideDirectory(rootDir: string, targetPath: string) {
  const normalizedRoot = path.resolve(rootDir);
  const normalizedTarget = path.resolve(targetPath);

  if (
    normalizedTarget !== normalizedRoot &&
    !normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`)
  ) {
    throw new Error('안전하지 않은 파일 경로가 감지되었습니다.');
  }

  return normalizedTarget;
}

export function toPublicUploadUrl(filePath: string) {
  const uploadsRootDir = getUploadsRootDir();
  const normalizedFilePath = ensurePathInsideDirectory(uploadsRootDir, filePath);
  const relativePath = path.relative(uploadsRootDir, normalizedFilePath);

  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('공개 업로드 경로를 생성할 수 없습니다.');
  }

  return `${PUBLIC_UPLOAD_URL_PREFIX}/${relativePath.split(path.sep).join('/')}`;
}

export function resolvePublicUploadPath(uploadUrl: string) {
  if (!uploadUrl.startsWith(`${PUBLIC_UPLOAD_URL_PREFIX}/`)) {
    return null;
  }

  const pathname = uploadUrl.split('?')[0];
  const relativeSegments = pathname
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .slice(1);
  const targetPath = path.join(getUploadsRootDir(), ...relativeSegments);

  return ensurePathInsideDirectory(getUploadsRootDir(), targetPath);
}
