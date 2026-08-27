export interface StoredObject {
  bucket: string;
  objectKey: string;
  uploadUrl: string;
  method: 'PUT' | 'POST';
}

export interface StoragePort {
  createUpload(input: {
    objectKey: string;
    contentType: string;
    documentId: string;
  }): Promise<StoredObject>;
  createDownloadUrl?(objectKey: string): Promise<string>;
  readObject?(bucket: string, objectKey: string): Promise<Buffer>;
  saveLocal?(documentId: string, buffer: Buffer, contentType: string): Promise<void>;
  deleteObject(bucket: string, objectKey: string): Promise<void>;
}

export const STORAGE_PORT = Symbol('STORAGE_PORT');
