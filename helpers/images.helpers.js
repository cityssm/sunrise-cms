import fs from 'node:fs/promises';
import path from 'node:path';
import chokidar from 'chokidar';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from './config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:images.helpers`);
/*
 * Burial Site Images
 */
const burialSiteImagesFolder = path.join(getConfigProperty('settings.publicInternalPath'), 'images', 'burialSites');
const burialSiteImageFileExtensions = ['jpg', 'jpeg', 'png'];
let burialSiteImages = [];
export async function getBurialSiteImages() {
    if (burialSiteImages.length === 0) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const files = await fs.readdir(burialSiteImagesFolder);
        const images = [];
        for (const file of files) {
            const lowerCaseFileName = file.toLowerCase();
            for (const fileExtension of burialSiteImageFileExtensions) {
                if (lowerCaseFileName.endsWith(`.${fileExtension}`)) {
                    images.push(file);
                    break;
                }
            }
        }
        burialSiteImages = images;
    }
    return burialSiteImages;
}
function clearCachedBurialSiteImages() {
    debug('Burial site images folder changed.');
    burialSiteImages = [];
}
if (getConfigProperty('settings.burialSites.refreshImageChanges')) {
    debug('Burial site images watcher enabled.');
    const burialSitesWatcher = chokidar.watch(burialSiteImagesFolder, {
        ignoreInitial: true,
        persistent: true
    });
    burialSitesWatcher.on('add', clearCachedBurialSiteImages);
    burialSitesWatcher.on('change', clearCachedBurialSiteImages);
    burialSitesWatcher.on('unlink', clearCachedBurialSiteImages);
}
/*
 * Cemetery SVGs
 */
const cemeterySVGsFolder = path.join(getConfigProperty('settings.publicInternalPath'), 'images', 'cemeteries');
const cemeterySVGFileExtensions = ['svg'];
let cemeterySVGs = [];
export async function getCemeterySVGs() {
    if (cemeterySVGs.length === 0) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const files = await fs.readdir(cemeterySVGsFolder);
        const SVGs = [];
        for (const file of files) {
            const lowerCaseFileName = file.toLowerCase();
            for (const fileExtension of cemeterySVGFileExtensions) {
                if (lowerCaseFileName.endsWith(`.${fileExtension}`)) {
                    SVGs.push(file);
                    break;
                }
            }
        }
        cemeterySVGs = SVGs;
    }
    return cemeterySVGs;
}
function clearCachedCemeterySVGs() {
    debug('Cemetery SVGs folder changed.');
    cemeterySVGs = [];
}
if (getConfigProperty('settings.cemeteries.refreshImageChanges')) {
    debug('Cemetery SVGs watcher enabled.');
    const cemeteryWatcher = chokidar.watch(cemeterySVGsFolder, {
        ignoreInitial: true,
        persistent: true
    });
    cemeteryWatcher.on('add', clearCachedCemeterySVGs);
    cemeteryWatcher.on('change', clearCachedCemeterySVGs);
    cemeteryWatcher.on('unlink', clearCachedCemeterySVGs);
}
