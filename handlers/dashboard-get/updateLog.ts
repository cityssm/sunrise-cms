import type { Request, Response } from 'express'

export default function handler(_request: Request, response: Response): void {
  response.render('updateLog', {
    headTitle: 'Update Log'
  })
}
