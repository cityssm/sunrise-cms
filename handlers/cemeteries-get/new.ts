import type { Request, Response } from 'express'

import { getCemeterySVGs } from '../../helpers/cemeteries.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Cemetery } from '../../types/recordTypes.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const cemetery: Cemetery = {
    cemeteryCity: getConfigProperty('settings.cityDefault'),
    cemeteryProvince: getConfigProperty('settings.provinceDefault')
  }

  const cemeterySVGs = await getCemeterySVGs()

  response.render('cemetery-edit', {
    headTitle: "Create a Cemetery",
    isCreate: true,
    cemetery,
    cemeterySVGs
  })
}
