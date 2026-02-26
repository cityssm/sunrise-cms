import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getBurialSiteComments from '../../database/getBurialSiteComments.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { BurialSiteComment } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:burialSites:doDeleteBurialSiteComment`
)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteBurialSiteCommentResponse =
  { success: boolean; burialSiteComments: BurialSiteComment[] }
  | { errorMessage: string; success: false }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteCommentId: string; burialSiteId: string }
  >,
  response: Response<DoDeleteBurialSiteCommentResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteRecord(
      'BurialSiteComments',
      request.body.burialSiteCommentId,
      request.session.user as User,
      database
    )

    const burialSiteComments = getBurialSiteComments(request.body.burialSiteId, database)

    response.json({
      success,

      burialSiteComments
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
