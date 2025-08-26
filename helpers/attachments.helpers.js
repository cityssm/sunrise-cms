"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-non-literal-fs-filename */
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAttachment = writeAttachment;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const config_helpers_js_1 = require("./config.helpers.js");
const rootAttachmentsPath = (0, config_helpers_js_1.getConfigProperty)('application.attachmentsPath');
async function writeAttachment(fileName, fileData) {
    /*
     * Ensure folder exists
     */
    const currentDate = new Date();
    const dateFolderName = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const dateFolder = node_path_1.default.join(rootAttachmentsPath, dateFolderName);
    await promises_1.default.mkdir(dateFolder, {
        recursive: true
    });
    /*
     * Ensure file path is unique
     */
    let uniqueFileName = fileName;
    const fileExtension = node_path_1.default.extname(fileName);
    const baseFileName = node_path_1.default.basename(fileName, fileExtension);
    let counter = 1;
    while (await promises_1.default
        .access(node_path_1.default.join(dateFolder, uniqueFileName))
        .then(() => true)
        .catch(() => false)) {
        uniqueFileName = `${baseFileName}-${counter}${fileExtension}`;
        counter++;
    }
    /*
     * Write the file
     */
    await promises_1.default.writeFile(node_path_1.default.join(dateFolder, uniqueFileName), fileData);
    return {
        fileName: uniqueFileName,
        filePath: dateFolder
    };
}
