import type { Request, Response } from 'express'

export default function handler(_request: Request, response: Response): void {
  response.render('dashboard/userSettings', {
    headTitle: 'User Settings'
  })
}
