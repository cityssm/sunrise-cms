import fs from 'node:fs/promises'
import path from 'node:path'

import { getConfigProperty } from './config.helpers.js'

let burialSiteImages: string[] | undefined

export async function getBurialSiteImages(): Promise<string[]> {
  if (burialSiteImages === undefined) {
    const files = await fs.readdir(
      path.join(
        getConfigProperty('settings.publicInternalPath'),
        'images',
        'burialSites'
      )
    )

    const images: string[] = []

    for (const file of files) {
      const lowerCaseFileName = file.toLowerCase()
      if (
        lowerCaseFileName.endsWith('.jpg') ||
        lowerCaseFileName.endsWith('.jpeg') ||
        lowerCaseFileName.endsWith('.png')
      ) {
        images.push(file)
      }
    }

    burialSiteImages = images
  }

  return burialSiteImages
}

let cemeterySVGs: string[] | undefined

export async function getCemeterySVGs(): Promise<string[]> {
  if (cemeterySVGs === undefined) {
    const files = await fs.readdir(path.join(
      getConfigProperty('settings.publicInternalPath'),
      'images',
      'cemeteries'
    ))

    const SVGs: string[] = []

    for (const file of files) {
      if (file.toLowerCase().endsWith('.svg')) {
        SVGs.push(file)
      }
    }

    cemeterySVGs = SVGs
  }

  return cemeterySVGs
}
