export interface BlobUpload {
  readonly blobName: string;
  readonly content: Uint8Array;
  readonly contentType: string;
  readonly metadata?: Record<string, string>;
}
