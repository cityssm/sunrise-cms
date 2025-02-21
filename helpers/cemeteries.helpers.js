import fs from 'node:fs/promises';
let cemeterySVGs;
export async function getCemeterySVGs() {
    if (cemeterySVGs === undefined) {
        const files = await fs.readdir('./public/images/cemeteries/');
        const SVGs = [];
        for (const file of files) {
            if (file.toLowerCase().endsWith('.svg')) {
                SVGs.push(file);
            }
        }
        cemeterySVGs = SVGs;
    }
    return cemeterySVGs;
}
