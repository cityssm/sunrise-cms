import type { Request, Response } from 'express'

import getLocalUsers from '../../database/getLocalUsers.js'

export default function handler(_request: Request, response: Response): void {
  const users = getLocalUsers()

  response.render('admin-users', {
    headTitle: 'User Management',
    users
  })
}