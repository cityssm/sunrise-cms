// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-non-literal-fs-filename */
import fs from 'node:fs/promises';
import path from 'node:path';
import { dateToInteger } from '@cityssm/utils-datetime';
import Debug from 'debug';
import sanitizeFileName from 'sanitize-filename';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from './config.helpers.js';
const rootAttachmentsPath = getConfigProperty('application.attachmentsPath');
const debug = Debug(`${DEBUG_NAMESPACE}:helpers:attachments`);
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
    let uniqueFileName = sanitizeFileName(fileName);
    if (uniqueFileName.length === 0) {
        uniqueFileName = `attachment-${dateToInteger(new Date()).toString()}`;
    }
    const fileExtension = path.extname(fileName);
    const baseFileName = path.basename(fileName, fileExtension);
    let counter = 1;
    while (await fs
        .access(path.join(dateFolder, uniqueFileName))
        .then(() => true)
        .catch(() => false)) {
        uniqueFileName = `${baseFileName} (${counter})${fileExtension}`;
        counter++;
    }
    /*
     * Write the file
     */
    await fs.writeFile(path.join(dateFolder, uniqueFileName), fileData);
    debug(`Attachment written: ${uniqueFileName}`);
    return {
        fileName: uniqueFileName,
        filePath: dateFolder
    };
}
