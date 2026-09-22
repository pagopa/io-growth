import { z } from "zod";

export const blobStorageConfigSchema = z.object({
  clientId: z.string().min(1).optional(),
  connectionString: z.string().min(1).optional(),
  endpoint: z.url(),
});

export type BlobStorageConfig = z.infer<typeof blobStorageConfigSchema>;
