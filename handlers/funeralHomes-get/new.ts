import type { Request, Response } from 'express'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { FuneralHome } from '../../types/record.types.js'

export default function handler(_request: Request, response: Response): void {
  const funeralHome: FuneralHome = {
    funeralHomeName: '',

    funeralHomeAddress1: '',
    funeralHomeAddress2: '',
    funeralHomeCity: getConfigProperty('settings.cityDefault'),
    funeralHomePostalCode: '',
    funeralHomeProvince: getConfigProperty('settings.provinceDefault'),

    funeralHomePhoneNumber: ''
  }

  response.render('funeralHomes/edit', {
    headTitle: 'Create a Funeral Home',

    funeralHome,
    isCreate: true
  })
}
