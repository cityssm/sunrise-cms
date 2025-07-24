import type { Request, Response } from 'express'

import { getCachedSettings } from '../../helpers/cache/settings.cache.js'

export default function handler(_request: Request, response: Response): void {
 const settings = getCachedSettings()

  response.render('admin-settings', {
    headTitle: 'Settings Management',
    settings
  })
}
