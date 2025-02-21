import type { Request, Response } from 'express'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getMapSVGs } from '../../helpers/functions.map.js'
import type { MapRecord } from '../../types/recordTypes.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const map: MapRecord = {
    mapCity: getConfigProperty('settings.map.mapCityDefault'),
    mapProvince: getConfigProperty('settings.map.mapProvinceDefault')
  }

  const mapSVGs = await getMapSVGs()

  response.render('map-edit', {
    headTitle: `${getConfigProperty('aliases.map')} Create`,
    isCreate: true,
    map,
    mapSVGs
  })
}
