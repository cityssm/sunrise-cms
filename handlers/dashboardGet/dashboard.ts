import type { Request, Response } from 'express'

import { getUnprocessedOrderFormCount } from '../../database/getOrderForms.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { i18next } from '../../helpers/i18n.helpers.js'

export default function handler(request: Request, response: Response): void {
  let error = request.query.error

  if (error === 'accessDenied') {
    error = 'Access Denied.'
  } else if (error === 'printConfigNotFound') {
    error = 'Print configuration not found.'
  }

  const unprocessedOrderFormCount = getConfigProperty(
    'integrations.portal.integrationIsEnabled'
  )
    ? getUnprocessedOrderFormCount()
    : 0

  response.render('dashboard/dashboard', {
    headTitle: i18next.t('dashboard.title', { lng: response.locals.lng }),

    error,
    unprocessedOrderFormCount
  })
}
