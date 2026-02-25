import type { Request, Response } from 'express'
import { i18next } from '../../helpers/i18n.helpers.js'

export default function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): void {
  let error = request.query.error

  if (error === 'accessDenied') {
    error = 'Access Denied.'
  } else if (error === 'printConfigNotFound') {
    error = 'Print configuration not found.'
  }

  response.render('dashboard/dashboard', {
    headTitle: i18next.t('dashboard:title', { lng: response.locals.lng }),

    error
  })
}
