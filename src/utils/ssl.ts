import fs from 'fs';

export const loadSSLCertificates = (): { key: Buffer; cert: Buffer; } | {} => {
    if (process.env.NODE_ENV === 'production') {
        try {
            const key = fs.readFileSync('/etc/letsencrypt/live/api.oniooo.com/privkey.pem');
            const cert = fs.readFileSync('/etc/letsencrypt/live/api.oniooo.com/fullchain.pem');
            return { key, cert };
        } catch (err) {
            console.error('Error reading SSL files:', err);
            process.exit(1);
        }
    }
    return {};
};