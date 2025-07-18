import type { Request, Response } from 'express'

import { getSettings } from '../../helpers/cache.helpers.js'

export default function handler(_request: Request, response: Response): void {
 const settings = getSettings()

  response.render('admin-settings', {
    headTitle: 'Settings Management',
    settings
  })
}
