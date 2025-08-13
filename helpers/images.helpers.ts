import fs from 'node:fs/promises'
import path from 'node:path'

import chokidar from 'chokidar'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:helpers:images`)

/*
 * Burial Site Images
 */

const burialSiteImagesFolder = path.join(
  getConfigProperty('settings.customizationsPath'),
  'public-internal',
  'images',
  'burialSites'
)

const burialSiteImageFileExtensions = ['jpg', 'jpeg', 'png']

let burialSiteImages: string[] | undefined

export async function getBurialSiteImages(): Promise<string[]> {
  if (burialSiteImages === undefined) {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const files = await fs.readdir(burialSiteImagesFolder)

      const images: string[] = []

      for (const file of files) {
        const lowerCaseFileName = file.toLowerCase()

        for (const fileExtension of burialSiteImageFileExtensions) {
          if (lowerCaseFileName.endsWith(`.${fileExtension}`)) {
            images.push(file)
            break
          }
        }
      }

      burialSiteImages = images
    } catch (error) {
      debug('Error reading burial site images folder:', error)
      burialSiteImages = []
    }
  }

  return burialSiteImages
}

function clearCachedBurialSiteImages(): void {
  debug('Burial site images folder changed.')
  burialSiteImages = undefined
}

if (getConfigProperty('settings.burialSites.refreshImageChanges')) {
  debug('Burial site images watcher enabled.')

  const burialSitesWatcher = chokidar.watch(burialSiteImagesFolder, {
    ignoreInitial: true,
    persistent: true
  })

  burialSitesWatcher.on('add', clearCachedBurialSiteImages)
  // burialSitesWatcher.on('change', clearCachedBurialSiteImages)
  burialSitesWatcher.on('unlink', clearCachedBurialSiteImages)
}

/*
 * Cemetery SVGs
 */

const cemeterySVGsFolder = path.join(
  getConfigProperty('settings.customizationsPath'),
  'public-internal',
  'images',
  'cemeteries'
)

const cemeterySVGFileExtensions = ['svg']

let cemeterySVGs: string[] | undefined

export async function getCemeterySVGs(): Promise<string[]> {
  if (cemeterySVGs === undefined) {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const files = await fs.readdir(cemeterySVGsFolder)

      const SVGs: string[] = []

      for (const file of files) {
        const lowerCaseFileName = file.toLowerCase()

        for (const fileExtension of cemeterySVGFileExtensions) {
          if (lowerCaseFileName.endsWith(`.${fileExtension}`)) {
            SVGs.push(file)
            break
          }
        }
      }

      cemeterySVGs = SVGs
    } catch (error) {
      debug('Error reading cemetery SVGs folder:', error)
      cemeterySVGs = []
    }
  }

  return cemeterySVGs
}

function clearCachedCemeterySVGs(): void {
  debug('Cemetery SVGs folder changed.')
  cemeterySVGs = undefined
}

if (getConfigProperty('settings.cemeteries.refreshImageChanges')) {
  debug('Cemetery SVGs watcher enabled.')

  const cemeteryWatcher = chokidar.watch(cemeterySVGsFolder, {
    ignoreInitial: true,
    persistent: true
  })

  cemeteryWatcher.on('add', clearCachedCemeterySVGs)
  // cemeteryWatcher.on('change', clearCachedCemeterySVGs)
  cemeteryWatcher.on('unlink', clearCachedCemeterySVGs)
}
