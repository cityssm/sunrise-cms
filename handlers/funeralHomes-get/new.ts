import type { Request, Response } from 'express'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { FuneralHome } from '../../types/record.types.js'

export default function handler(_request: Request, response: Response): void {
  const funeralHome: FuneralHome = {
    funeralHomeCity: getConfigProperty('settings.cityDefault'),
    funeralHomeProvince: getConfigProperty('settings.provinceDefault')
  }

  response.render('funeralHome-edit', {
    headTitle: 'Create a Funeral Home',

    funeralHome,
    isCreate: true
  })
}
