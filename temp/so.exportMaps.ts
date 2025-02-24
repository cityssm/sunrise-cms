import fs from 'node:fs'

import * as sql from '@cityssm/mssql-multi-pool'
import type * as sqlTypes from 'mssql'

import { soMSSQL } from './config.js'

interface MapLayer {
  cemeteryId: string
  cemeteryName: string
  layerId: string
  layerName: string
  layerImage: string
}

async function importMaps(): Promise<void> {
  let pool: sqlTypes.ConnectionPool | undefined

  try {
    pool = await sql.connect(soMSSQL)

    const result = await pool.query(
      `select m.ID as cemeteryId, m.Name as cemeteryName,
        l.ID as layerId, l.Name as layerName, l.Image as layerImage
        from Legacy_Maps m
        left join Legacy_Layers l on m.ID = l.Map_ID`
    ) as sqlTypes.IResult<MapLayer>

    for (const layer of result.recordset) {
      const imageBuffer = layer.layerImage as unknown as Buffer

      const fileName = `${layer.cemeteryName} - ${layer.layerName} (${layer.cemeteryId}, ${layer.layerId}).wmf`

      fs.writeFile(`./temp/wmf/${fileName}`, imageBuffer, (error) => {
        if (error) {
          console.log(error)
        }
      })
    }
  } catch {
    // ignore
  } finally {
    try {
      if (pool !== undefined) {
        await pool.close()
      }
    } catch {
      // ignore
    }
  }
}

await importMaps()
