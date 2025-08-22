import type { Request, Response } from 'express'

import addLocalUser from '../../database/addLocalUser.js'

export default function handler(request: Request, response: Response): void {
  const user = request.session?.user

  if (!user) {
    response.status(403).json({ success: false, message: 'Unauthorized' })
    return
  }

  const {
    userName,
    displayName,
    canLogin = '0',
    canUpdate = '0',
    canUpdateCemeteries = '0',
    canUpdateContracts = '0',
    canUpdateWorkOrders = '0',
    isAdmin = '0'
  } = request.body as {
    userName: string
    displayName?: string
    canLogin?: string
    canUpdate?: string
    canUpdateCemeteries?: string
    canUpdateContracts?: string
    canUpdateWorkOrders?: string
    isAdmin?: string
  }

  if (!userName) {
    response.status(400).json({
      success: false,
      message: 'Username is required'
    })
    return
  }

  try {
    const userId = addLocalUser(
      {
        userName,
        displayName,
        canLogin: canLogin === '1',
        canUpdate: canUpdate === '1',
        canUpdateCemeteries: canUpdateCemeteries === '1',
        canUpdateContracts: canUpdateContracts === '1',
        canUpdateWorkOrders: canUpdateWorkOrders === '1',
        isAdmin: isAdmin === '1'
      },
      user
    )

    response.json({
      success: true,
      message: 'User created successfully',
      userId
    })
  } catch (error) {
    response.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create user'
    })
  }
}