import type { Request, Response } from 'express'

import { getCachedSettings } from '../../helpers/cache/settings.cache.js'
import { i18next } from '../../helpers/i18n.helpers.js'

export default function handler(_request: Request, response: Response): void {
  const settings = getCachedSettings()

  response.render('admin/settings', {
    headTitle: i18next.t('admin:settingsManagement', { lng: response.locals.lng }),
    settings
  })
}
