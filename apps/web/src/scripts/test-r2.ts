import "dotenv/config";

import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { SignatureV4 } from "@aws-sdk/signature-v4";

import { createHash, createHmac } from "node:crypto";

const accountId = process.env.R2_ACCOUNT_ID!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
const bucket = process.env.R2_BUCKET_NAME!;

async function main() {
  const key = `test/test-final-${Date.now()}.txt`;
  const body = Buffer.from("");
  const bodyHash = createHash("sha256").update(body).digest("hex");

  const region = "auto";
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const path = `/${bucket}/${key}`;

  // Compute signing key
  const ymd = "20260720";
  const kSecret = `AWS4${secretAccessKey}`;
  const kDate = createHmac("sha256", kSecret).update(ymd).digest();
  const kRegion = createHmac("sha256", kDate).update(region).digest();
  const kService = createHmac("sha256", kRegion).update("s3").digest();
  const signingKey = createHmac("sha256", kService).update("aws4_request").digest();

  console.log("signingKey (hex):", signingKey.toString("hex"));

  // Use SDK to sign the request
  console.log("\n=== SDK SignatureV4 ===\n");

  const signer = new SignatureV4({
    region,
    service: "s3",
    sha256: Sha256,
    credentials: { accessKeyId, secretAccessKey },
  });

  const req = new HttpRequest({
    method: "PUT",
    protocol: "https:",
    hostname: host,
    path: path,
    headers: {
      host: host,
      "x-amz-content-sha256": bodyHash,
    },
    body,
  });

  const signed = await signer.sign(req);
  console.log("Auth:", signed.headers.authorization);

  const res = await fetch(`https://${host}${path}`, {
    method: "PUT",
    headers: signed.headers as Record<string, string>,
    body: Buffer.from(""),
  });

  console.log("Status:", res.status, res.statusText);
  const text = await res.text();
  console.log("Body:", text.slice(0, 500));

  if (res.ok) {
    console.log("\n✅ FINALMENTE FUNCIONO!");
  }
}

main();
