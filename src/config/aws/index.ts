import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

export const s3Client = new S3Client({
    region: process.env.AWS_REGION, // Your AWS Region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,           // Your AWS Access Key ID
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,   // Your AWS Secret Access Key
    },
});