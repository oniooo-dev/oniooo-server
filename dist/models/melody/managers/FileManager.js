"use strict";
/**
 * FileManager Module
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManager = void 0;
const storage_1 = require("@google-cloud/storage");
class FileManager {
    constructor() {
        this.storage = new storage_1.Storage({ keyFilename: "oniuuu.json" }); // Assumes credentials are set in environment variables
        this.bucketName = "melody-files";
    }
    /**
     * Retrieves metadata for a file stored in Google Cloud Storage.
     * @param gsPath The gs:// path to the file.
     * @returns The metadata of the file.
     */
    async getFileMetadata(gsPath) {
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
    async generatePublicUrl(gsPath, expirationTime = '03-09-2491') {
        const filePath = gsPath.replace(`gs://${this.bucketName}/`, '');
        const [url] = await this.storage.bucket(this.bucketName).file(filePath).getSignedUrl({
            action: 'read',
            expires: expirationTime
        });
        return url;
    }
}
exports.FileManager = FileManager;
