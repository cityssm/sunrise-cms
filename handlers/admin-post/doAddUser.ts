import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addUser from '../../database/addUser.js'
import getUsers from '../../database/getUsers.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddUser`)

export default function handler(request: Request, response: Response): void {
  const {
    userName,

    canUpdateCemeteries = '0',
    canUpdateContracts = '0',
    canUpdateWorkOrders = '0',
    isAdmin = '0'
  } = request.body as {
    userName: string

    canUpdateCemeteries?: string
    canUpdateContracts?: string
    canUpdateWorkOrders?: string
    isAdmin?: string
  }

  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = addUser(
      {
        userName,

        canUpdateCemeteries: canUpdateCemeteries === '1',
        canUpdateContracts: canUpdateContracts === '1',
        canUpdateWorkOrders: canUpdateWorkOrders === '1',
        isAdmin: isAdmin === '1'
      },
      request.session.user as User,
      database
    )

    const users = getUsers(database)

    response.json({
      success,

      users
    })
  } catch (error) {
    debug(error)
    response
      .status(500)
      .json({ errorMessage: 'Database error', success: false })
  } finally {
    database?.close()
  }
}
