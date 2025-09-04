import type { Request, Response } from 'express'

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

  response.render('dashboard', {
    headTitle: 'Dashboard',

    error
  })
}
