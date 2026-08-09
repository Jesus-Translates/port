import { createHash } from "node:crypto";
import { AwsClient } from "aws4fetch";

/**
 * Audio lives in object storage, not in Postgres.
 *
 * Every clip used to be a base64 column — a third bigger than the mp3 itself,
 * inside the one store whose size is also the backup size, the branch size and
 * the restore time. Listen & Speak alone keeps five ~1.5 MB sessions per
 * learner, so a thousand subscribers is tens of gigabytes of audio sitting in
 * a database that charges like a database.
 *
 * R2 is chosen over the alternatives for one specific reason: no egress fees.
 * These clips are re-downloaded by podcast apps, so egress is the recurring
 * cost, not storage.
 *
 * The seam is deliberately optional. With no credentials the app keeps writing
 * base64 exactly as before, so nothing breaks before the keys land and nothing
 * has to be migrated in a hurry.
 */

const REGION = "auto";

export function blobConfigured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      bucket()
  );
}

function bucket(): string {
  return process.env.R2_BUCKET ?? "portugues-audio";
}

function endpoint(): string {
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
}

function client(): AwsClient {
  return new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: REGION,
  });
}

function urlFor(key: string): string {
  return `${endpoint()}/${bucket()}/${key.replace(/^\/+/, "")}`;
}

/**
 * A stable key for a clip. Content-addressed for the TTS cache so the same
 * phrase never uploads twice; prefixed by kind so a lifecycle rule can expire
 * one class of audio without touching the others.
 */
export function audioKey(kind: "tts" | "ls" | "clip", seed: string): string {
  const hash = createHash("sha1").update(seed).digest("hex").slice(0, 32);
  return `${kind}/${hash}.mp3`;
}

export async function putAudio(
  key: string,
  body: Buffer
): Promise<string | null> {
  if (!blobConfigured()) return null;
  try {
    const res = await client().fetch(urlFor(key), {
      method: "PUT",
      body: new Uint8Array(body),
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(body.length),
      },
    });
    if (!res.ok) {
      console.error(`r2 put failed: ${res.status} ${await res.text().catch(() => "")}`);
      return null;
    }
    return key;
  } catch (err) {
    console.error(`r2 put threw: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

export async function getAudio(key: string): Promise<Buffer | null> {
  if (!blobConfigured()) return null;
  try {
    const res = await client().fetch(urlFor(key));
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function deleteAudio(key: string): Promise<void> {
  if (!blobConfigured()) return;
  try {
    await client().fetch(urlFor(key), { method: "DELETE" });
  } catch {
    // A leaked object costs a fraction of a cent; a thrown delete costs a request.
  }
}

/**
 * A time-limited URL the listener's own device can fetch.
 *
 * This is the point of the exercise for Listen & Speak: a podcast app
 * re-downloading a 1.5 MB session should pull it straight from R2, where
 * egress is free, instead of streaming through a serverless function and
 * being billed as platform bandwidth every time.
 */
export async function presignAudio(
  key: string,
  expiresInSeconds = 6 * 60 * 60
): Promise<string | null> {
  if (!blobConfigured()) return null;
  try {
    const signed = await client().sign(
      new Request(`${urlFor(key)}?X-Amz-Expires=${expiresInSeconds}`),
      { aws: { signQuery: true } }
    );
    return signed.url;
  } catch {
    return null;
  }
}
