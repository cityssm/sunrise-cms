import fs from 'node:fs/promises';
import path from 'node:path';
import { debuglog } from 'node:util';
import chokidar from 'chokidar';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from './config.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:helpers:images`);
const cache = {
    burialSiteImages: undefined,
    cemeterySvgs: undefined
};
const burialSiteImagesFolder = path.join(getConfigProperty('settings.customizationsPath'), 'public-internal', 'images', 'burialSites');
const burialSiteImageFileExtensions = ['jpg', 'jpeg', 'png'];
export async function getBurialSiteImages() {
    if (cache.burialSiteImages === undefined) {
        try {
            const files = await fs.readdir(burialSiteImagesFolder);
            const images = [];
            for (const file of files) {
                const lowerCaseFileName = file.toLowerCase();
                for (const fileExtension of burialSiteImageFileExtensions) {
                    if (lowerCaseFileName.endsWith(`.${fileExtension}`)) {
                        images.push(file);
                    }
                }
            }
            cache.burialSiteImages = images;
        }
        catch (error) {
            debug('Error reading burial site images folder:', error);
            cache.burialSiteImages = [];
        }
    }
    return cache.burialSiteImages;
}
function clearCachedBurialSiteImages() {
    debug('Burial site images folder changed.');
    cache.burialSiteImages = undefined;
}
if (getConfigProperty('settings.burialSites.refreshImageChanges')) {
    debug('Burial site images watcher enabled.');
    const burialSitesWatcher = chokidar.watch(burialSiteImagesFolder, {
        ignoreInitial: true,
        persistent: true
    });
    burialSitesWatcher.on('add', clearCachedBurialSiteImages);
    burialSitesWatcher.on('unlink', clearCachedBurialSiteImages);
}
const cemeterySvgsFolder = path.join(getConfigProperty('settings.customizationsPath'), 'public-internal', 'images', 'cemeteries');
const cemeterySvgFileExtensions = ['svg'];
export async function getCemeterySvgs() {
    if (cache.cemeterySvgs === undefined) {
        try {
            const files = await fs.readdir(cemeterySvgsFolder);
            const svgs = [];
            for (const file of files) {
                const lowerCaseFileName = file.toLowerCase();
                for (const fileExtension of cemeterySvgFileExtensions) {
                    if (lowerCaseFileName.endsWith(`.${fileExtension}`)) {
                        svgs.push(file);
                    }
                }
            }
            cache.cemeterySvgs = svgs;
        }
        catch (error) {
            debug('Error reading cemetery SVGs folder:', error);
            cache.cemeterySvgs = [];
        }
    }
    return cache.cemeterySvgs;
}
function clearCachedCemeterySvgs() {
    debug('Cemetery SVGs folder changed.');
    cache.cemeterySvgs = undefined;
}
if (getConfigProperty('settings.cemeteries.refreshImageChanges')) {
    debug('Cemetery SVGs watcher enabled.');
    const cemeteryWatcher = chokidar.watch(cemeterySvgsFolder, {
        ignoreInitial: true,
        persistent: true
    });
    cemeteryWatcher.on('add', clearCachedCemeterySvgs);
    cemeteryWatcher.on('unlink', clearCachedCemeterySvgs);
}
