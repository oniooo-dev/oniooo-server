/**
 * FileManager Module
*/

import { Storage } from '@google-cloud/storage';

export class FileManager {
    private storage: Storage;
    private bucketName: string;

    constructor() {
        this.storage = new Storage({ keyFilename: "oniuuu.json" });   // Assumes credentials are set in environment variables
        this.bucketName = "melody-files";
    }

    /**
     * Retrieves metadata for a file stored in Google Cloud Storage.
     * @param gsPath The gs:// path to the file.
     * @returns The metadata of the file.
     */
    async getFileMetadata(gsPath: string): Promise<any> {
        const filePath = gsPath.replace(`gs://${this.bucketName}/`, '');
        const [metadata] = await this.storage.bucket(this.bucketName).file(filePath).getMetadata();
        return metadata;
    }

    /**
     * Generates a public URL for a file for direct access.
     * @param gsPath The gs:// path to the file.
     * @param expirationTime The time until the URL expires.
     * @returns A signed URL allowing access to the file.
     */
    async generatePublicUrl(gsPath: string, expirationTime: string = '03-09-2491'): Promise<string> {
        const filePath = gsPath.replace(`gs://${this.bucketName}/`, '');
        const [url] = await this.storage.bucket(this.bucketName).file(filePath).getSignedUrl({
            action: 'read',
            expires: expirationTime
        });
        return url;
    }
}