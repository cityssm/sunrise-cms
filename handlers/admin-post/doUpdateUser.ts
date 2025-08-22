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
        isActive: isActive === '1',

        canUpdateCemeteries: canUpdateCemeteries === '1',
        canUpdateContracts: canUpdateContracts === '1',
        canUpdateWorkOrders: canUpdateWorkOrders === '1',

        isAdmin: isAdmin === '1',
      },
      request.session.user as User
    )

    if (success) {
      response.json({
        success: true,
        message: 'User updated successfully'
      })
    } else {
      response.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
  } catch (error) {
    response.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update user'
    })
  }
}