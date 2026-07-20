import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getR2() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Faltan variables de entorno R2 (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME)",
    );
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  client.middlewareStack.add(
    (next) => async (args) => {
      const req = args.request as { query?: Record<string, string> } | undefined;
      if (req?.query?.["x-id"]) {
        delete req.query["x-id"];
      }
      return next(args);
    },
    { step: "build", priority: "high" },
  );

  return { client, bucketName: bucket };
}

let r2: ReturnType<typeof getR2> | null = null;

function ensureR2() {
  if (!r2) r2 = getR2();
  return r2;
}

export async function uploadToR2(key: string, buffer: Buffer, contentType: string) {
  const { client, bucketName } = ensureR2();
  await client.send(new PutObjectCommand({ Bucket: bucketName, Key: key, Body: buffer, ContentType: contentType }));
}

export async function deleteFromR2(key: string) {
  const { client, bucketName } = ensureR2();
  await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
}

export async function getPresignedUrl(key: string) {
  const { client, bucketName } = ensureR2();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucketName, Key: key }), { expiresIn: 3600 });
}
