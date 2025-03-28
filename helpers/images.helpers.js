import fs from 'node:fs/promises';
let burialSiteImages;
export async function getBurialSiteImages() {
    if (burialSiteImages === undefined) {
        const files = await fs.readdir('./public-internal/images/burialSites/');
        const images = [];
        for (const file of files) {
            const lowerCaseFileName = file.toLowerCase();
            if (lowerCaseFileName.endsWith('.jpg') ||
                lowerCaseFileName.endsWith('.jpeg') ||
                lowerCaseFileName.endsWith('.png')) {
                images.push(file);
            }
        }
        burialSiteImages = images;
    }
    return burialSiteImages;
}
let cemeterySVGs;
export async function getCemeterySVGs() {
    if (cemeterySVGs === undefined) {
        const files = await fs.readdir('./public-internal/images/cemeteries/');
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
