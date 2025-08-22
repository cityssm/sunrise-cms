import type { Request, Response } from 'express'

import getUsers from '../../database/getUsers.js'

export default function handler(_request: Request, response: Response): void {
  const users = getUsers()

  response.render('admin-users', {
    headTitle: 'User Management',
    users
  })
}