import type { Request, Response } from 'express'

import deleteUser from '../../database/deleteUser.js'
import getUsers from '../../database/getUsers.js'

export default function handler(request: Request, response: Response): void {
  const { userId } = request.body as { userId: string }

  if (!userId) {
    response.status(400).json({
      success: false,
      message: 'User name is required'
    })
    return
  }

  try {
    const success = deleteUser(
      userId, // This is actually userName based on the frontend code
      request.session.user as User
    )

    if (success) {
      const users = getUsers()
      response.json({
        success: true,
        message: 'User deleted successfully',
        users
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
