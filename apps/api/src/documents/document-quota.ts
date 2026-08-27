import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';

/** Max size for a single uploaded file (10 MiB). */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** Max total storage per employee across all onboarding cases (100 MiB). */
export const MAX_EMPLOYEE_BYTES = 100 * 1024 * 1024;

export function assertFileSize(sizeBytes: number): void {
  if (!Number.isInteger(sizeBytes) || sizeBytes < 1) {
    throw new BadRequestException('sizeBytes must be a positive integer');
  }
  if (sizeBytes > MAX_FILE_BYTES) {
    throw new PayloadTooLargeException(
      `File exceeds maximum size of ${MAX_FILE_BYTES} bytes (10 MB)`,
    );
  }
}

export function assertEmployeeQuota(usedBytes: number, incomingBytes: number): void {
  const total = usedBytes + incomingBytes;
  if (total > MAX_EMPLOYEE_BYTES) {
    throw new PayloadTooLargeException(
      `Employee storage quota exceeded (${MAX_EMPLOYEE_BYTES} bytes / 100 MB). ` +
        `Used ${usedBytes} bytes; this upload needs ${incomingBytes} bytes.`,
    );
  }
}
