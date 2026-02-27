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

export type DoDeleteBurialSiteCommentResponse =
  | { errorMessage: string; success: false }
  | {
      success: true

      burialSiteComments: BurialSiteComment[]
    }

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

    if (!success) {
      response
        .status(400)
        .json({ errorMessage: 'Comment not found', success: false })
      return
    }

    const burialSiteComments = getBurialSiteComments(
      request.body.burialSiteId,
      database
    )

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
