"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMimeType = getMimeType;
exports.convertToGsUri = convertToGsUri;
function getMimeType(uri) {
    const extension = uri.split('.').pop();
    console.log(extension);
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'pdf':
            return 'application/pdf';
        case 'txt':
            return 'text/plain';
        default:
            return 'application/octet-stream'; // Default MIME type if unknown
    }
}
function convertToGsUri(httpsUrl) {
    const matches = httpsUrl.match(/https:\/\/storage.googleapis.com\/([^\/]+)\/(.+)/);
    if (matches) {
        return `gs://${matches[1]}/${matches[2].split('?')[0]}`; // Remove URL parameters
    }
    return null; // or throw an error
}
