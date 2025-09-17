import type { Request, Response } from 'express'

import updateUser from '../../database/updateUser.js'

export default function handler(request: Request, response: Response): void {
  const {
    userName,

    canUpdateCemeteries = '0',
    canUpdateContracts = '0',
    canUpdateWorkOrders = '0',
    isAdmin = '0',

    isActive = '0'
  } = request.body as {
    userName: string

    canUpdateCemeteries?: string
    canUpdateContracts?: string
    canUpdateWorkOrders?: string
    isAdmin?: string

    isActive?: string
  }

  try {
    const success = updateUser(
      {
        userName,

        canUpdateCemeteries: canUpdateCemeteries === '1',
        canUpdateContracts: canUpdateContracts === '1',
        canUpdateWorkOrders: canUpdateWorkOrders === '1',

        isAdmin: isAdmin === '1',

        isActive: isActive === '1'
      },
      request.session.user as User
    )

    if (success) {
      response.json({
        message: 'User updated successfully',
        success: true
      })
    } else {
      response.status(404).json({
        message: 'User not found',
        success: false
      })
    }
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to update user',
      success: false
    })
  }
}
