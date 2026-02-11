import sqlite from 'better-sqlite3'
import type { Request, Response } from 'express'

import deleteUser from '../../database/deleteUser.js'
import getUsers from '../../database/getUsers.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

export default function handler(
  request: Request<unknown, unknown, { userName?: string }>,
  response: Response
): void {
  let userName = request.body.userName ?? ''

  if (typeof userName === 'string') {
    userName = userName.trim()
  }

  if (typeof userName !== 'string' || userName === '') {
    response.status(400).json({
      message: 'User name is required',
      success: false
    })
    return
  }

  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteUser(userName, request.session.user as User, database)

    if (success) {
      const users = getUsers(database)

      response.json({
        message: 'User deleted successfully',
        success: true,
        users
      })
    } else {
      response.status(404).json({
        message: 'User not found',
        success: false
      })
    }
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to delete user',
      success: false
    })
  } finally {
    database?.close()
  }
}
