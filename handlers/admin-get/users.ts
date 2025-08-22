import type { Request, Response } from 'express'

import getUsers from '../../database/getUsers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(_request: Request, response: Response): void {
  const users = getUsers()

  // Check if there are any users defined in the config file
  const configUsers = {
    canLogin: getConfigProperty('users.canLogin') as string[],
    canUpdate: getConfigProperty('users.canUpdate') as string[],
    canUpdateCemeteries: getConfigProperty('users.canUpdateCemeteries') as string[],
    canUpdateContracts: getConfigProperty('users.canUpdateContracts') as string[],
    canUpdateWorkOrders: getConfigProperty('users.canUpdateWorkOrders') as string[],
    isAdmin: getConfigProperty('users.isAdmin') as string[]
  }

  const hasConfigUsers = Object.values(configUsers).some(userArray => userArray.length > 0)

  response.render('admin-users', {
    headTitle: 'User Management',
    users,
    hasConfigUsers,
    configUsers
  })
}