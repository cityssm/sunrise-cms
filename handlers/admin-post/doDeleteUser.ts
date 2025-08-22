import type { Request, Response } from 'express'

import deleteLocalUser from '../../database/deleteLocalUser.js'

export default function handler(request: Request, response: Response): void {
  const user = request.session?.user

  if (!user) {
    response.status(403).json({ success: false, message: 'Unauthorized' })
    return
  }

  const { userId } = request.body as { userId: string }

  if (!userId) {
    response.status(400).json({
      success: false,
      message: 'User ID is required'
    })
    return
  }

  try {
    const success = deleteLocalUser(parseInt(userId, 10), user)

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