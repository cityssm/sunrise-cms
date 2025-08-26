// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-non-literal-fs-filename */
import fs from 'node:fs/promises';
import path from 'node:path';
import { getConfigProperty } from './config.helpers.js';
const rootAttachmentsPath = getConfigProperty('application.attachmentsPath');
export async function writeAttachment(fileName, fileData) {
    /*
     * Ensure folder exists
     */
    const currentDate = new Date();
    const dateFolderName = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const dateFolder = path.join(rootAttachmentsPath, dateFolderName);
    await fs.mkdir(dateFolder, {
        recursive: true
    });
    /*
     * Ensure file path is unique
     */
    let uniqueFileName = fileName;
    const fileExtension = path.extname(fileName);
    const baseFileName = path.basename(fileName, fileExtension);
    let counter = 1;
    while (await fs
        .access(path.join(dateFolder, uniqueFileName))
        .then(() => true)
        .catch(() => false)) {
        uniqueFileName = `${baseFileName}-${counter}${fileExtension}`;
        counter++;
    }
    /*
     * Write the file
     */
    await fs.writeFile(path.join(dateFolder, uniqueFileName), fileData);
    return {
        fileName: uniqueFileName,
        filePath: dateFolder
    };
}
