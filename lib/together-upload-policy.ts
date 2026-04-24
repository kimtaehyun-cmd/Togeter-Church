export const TOGETHER_MAX_IMAGE_COUNT = 10;
export const TOGETHER_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const TOGETHER_MAX_TOTAL_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const TOGETHER_SERVER_ACTION_BODY_SIZE_LIMIT = '20mb';

export function formatUploadFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(precision)}${units[unitIndex]}`;
}
