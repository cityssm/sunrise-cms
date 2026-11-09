import crypto from 'node:crypto';
import fs from 'node:fs';
export function getSessionSecret() {
    const secretFilePath = 'data/session-secret.txt';
    if (!fs.existsSync(secretFilePath)) {
        const secret = crypto.randomBytes(128).toString('hex');
        fs.writeFileSync(secretFilePath, secret);
    }
    return fs.readFileSync(secretFilePath, 'utf8');
}
