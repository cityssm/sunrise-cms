import fs from 'node:fs/promises'

let cemeterySVGs: string[] | undefined

export async function getCemeterySVGs(): Promise<string[]> {
  if (cemeterySVGs === undefined) {
    const files = await fs.readdir('./public/images/cemeteries/')

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
