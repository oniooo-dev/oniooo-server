import mime from 'mime-types';

/**
 * Get the MIME type based on the file extension.
 * @param uri - The URI or file name.
 * @returns The corresponding MIME type or a default if unknown.
 */
export function getMimeType(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();

    // Use mime-types package to get the MIME type
    const mimeType = extension ? mime.lookup(extension) : false;

    if (mimeType) {
        return mimeType;
    }

    // Default MIME type if unknown
    return 'application/octet-stream';
}