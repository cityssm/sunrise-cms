import type { Request, Response } from 'express'

export default function handler(request: Request, response: Response): void {
  response.render('workOrder-workday', {
    headTitle: 'Workday Report'
  })
}
