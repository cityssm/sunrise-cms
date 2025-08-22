import type { Request, Response } from 'express'

import deleteUser from '../../database/deleteUser.js'

export default function handler(request: Request, response: Response): void {
  const { userId } = request.body as { userId: string }

  if (!userId) {
    response.status(400).json({
      success: false,
      message: 'User ID is required'
    })
    return
  }

  try {
    const success = deleteUser(
      Number.parseInt(userId, 10),
      request.session.user as User
    )

    if (success) {
      response.json({
        success: true,
        message: 'User deleted successfully'
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
      message: error instanceof Error ? error.message : 'Failed to delete user'
    })
  }
}
