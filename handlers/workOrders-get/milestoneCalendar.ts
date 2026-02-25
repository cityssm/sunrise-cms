import type { Request, Response } from 'express'
import { i18next } from '../../helpers/i18n.helpers.js'

export default function handler(request: Request, response: Response): void {
  response.render('workOrders/milestoneCalendar', {
    headTitle: i18next.t('workOrders:milestoneCalendar', { lng: response.locals.lng })
  })
}

