/* eslint-disable require-atomic-updates */

import fs from 'node:fs/promises'
import path from 'node:path'

import chokidar from 'chokidar'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:helpers:images`)

const cache: {
  burialSiteImages: string[] | undefined
  cemeterySVGs: string[] | undefined
} = {
  burialSiteImages: undefined,
  cemeterySVGs: undefined
}

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

export async function getBurialSiteImages(): Promise<string[]> {
  if (cache.burialSiteImages === undefined) {
    try {
      const files = await fs.readdir(burialSiteImagesFolder)

      const images: string[] = []

      for (const file of files) {
        const lowerCaseFileName = file.toLowerCase()

        for (const fileExtension of burialSiteImageFileExtensions) {
          if (lowerCaseFileName.endsWith(`.${fileExtension}`)) {
            images.push(file)
          }
        }
      }

      cache.burialSiteImages = images
    } catch (error) {
      debug('Error reading burial site images folder:', error)
      cache.burialSiteImages = []
    }
  }

  return cache.burialSiteImages
}

function clearCachedBurialSiteImages(): void {
  debug('Burial site images folder changed.')
  cache.burialSiteImages = undefined
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

export async function getCemeterySVGs(): Promise<string[]> {
  if (cache.cemeterySVGs === undefined) {
    try {
      const files = await fs.readdir(cemeterySVGsFolder)

      const SVGs: string[] = []

      for (const file of files) {
        const lowerCaseFileName = file.toLowerCase()

        for (const fileExtension of cemeterySVGFileExtensions) {
          if (lowerCaseFileName.endsWith(`.${fileExtension}`)) {
            SVGs.push(file)
          }
        }
      }

      cache.cemeterySVGs = SVGs
    } catch (error) {
      debug('Error reading cemetery SVGs folder:', error)
      cache.cemeterySVGs = []
    }
  }

  return cache.cemeterySVGs
}

function clearCachedCemeterySVGs(): void {
  debug('Cemetery SVGs folder changed.')
  cache.cemeterySVGs = undefined
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
