import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import {
  MAX_EMPLOYEE_BYTES,
  MAX_FILE_BYTES,
  assertEmployeeQuota,
  assertFileSize,
} from './document-quota';

describe('document quota', () => {
  it('rejects non-positive sizeBytes', () => {
    expect(() => assertFileSize(0)).toThrow(BadRequestException);
    expect(() => assertFileSize(-1)).toThrow(BadRequestException);
  });

  it('rejects files over 10 MB', () => {
    expect(() => assertFileSize(MAX_FILE_BYTES + 1)).toThrow(PayloadTooLargeException);
  });

  it('allows files at exactly 10 MB', () => {
    expect(() => assertFileSize(MAX_FILE_BYTES)).not.toThrow();
  });

  it('rejects when employee quota would be exceeded', () => {
    expect(() => assertEmployeeQuota(MAX_EMPLOYEE_BYTES - 1000, 2000)).toThrow(
      PayloadTooLargeException,
    );
  });

  it('allows upload when quota headroom remains', () => {
    expect(() => assertEmployeeQuota(50 * 1024 * 1024, 10 * 1024 * 1024)).not.toThrow();
  });
});
