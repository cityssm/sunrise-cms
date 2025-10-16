import type { Request, Response } from 'express'

import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js'
import type { FuneralHome } from '../../types/record.types.js'

export default function handler(_request: Request, response: Response): void {
  const funeralHome: FuneralHome = {
    funeralHomeName: '',

    funeralHomeAddress1: '',
    funeralHomeAddress2: '',
    funeralHomeCity: getCachedSettingValue('defaults.city'),
    funeralHomePostalCode: '',
    funeralHomeProvince: getCachedSettingValue('defaults.province'),

    funeralHomePhoneNumber: ''
  }

  response.render('funeralHomes/edit', {
    headTitle: 'Create a Funeral Home',

    funeralHome,
    isCreate: true
  })
}
