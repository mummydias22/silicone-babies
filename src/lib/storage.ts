import { S3Client, PutObjectCommand, GetObjectCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export const s3 = new S3Client({
  forcePathStyle: true,
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const Bucket = () => process.env.S3_BUCKET!;

export async function ensureBucket() {
  try { await s3.send(new CreateBucketCommand({ Bucket: Bucket() })); } catch (e) {
    const n = (e as { name?: string }).name;
    if (n !== "BucketAlreadyOwnedByYou" && n !== "BucketAlreadyExists") throw e;
  }
}

// Returns an app URL; images are streamed through /api/img (no permanent public bucket URL).
export async function uploadImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `${randomUUID()}.${ext}`;
  await s3.send(new PutObjectCommand({
    Bucket: Bucket(), Key: key, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type || "image/jpeg",
  }));
  return `/api/img/${key}`;
}

export async function getObject(key: string) {
  return s3.send(new GetObjectCommand({ Bucket: Bucket(), Key: key }));
}
