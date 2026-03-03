import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Instantiating the S3 Client for Cloudflare R2 or direct S3
export const s3Client = new S3Client({
    region: process.env.STORAGE_REGION || "auto",
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY || "",
        secretAccessKey: process.env.STORAGE_SECRET_KEY || "",
    },
});

export const BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || "hablock-images";

// Function: Generates a presigned URL that clients can use to directly PUT an image file
export async function generateUploadUrl(key: string, contentType: string = "image/jpeg") {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    try {
        // URL expires in 300 seconds (5 minutes)
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        return signedUrl;
    } catch (err) {
        console.error("Error generating presigned URL", err);
        throw new Error("Could not generate upload URL");
    }
}

// Function: Constructs the public read URL for an uploaded file
export function getPublicUrl(key: string) {
    const publicDomain = process.env.STORAGE_PUBLIC_DOMAIN;
    if (publicDomain) {
        return `${publicDomain}/${key}`;
    }
    return `https://${BUCKET_NAME}.s3.${process.env.STORAGE_REGION || "auto"}.amazonaws.com/${key}`;
}
