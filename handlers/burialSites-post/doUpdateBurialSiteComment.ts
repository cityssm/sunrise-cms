import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getBurialSiteComments from '../../database/getBurialSiteComments.js'
import updateBurialSiteComment, {
  type UpdateBurialSiteCommentForm
} from '../../database/updateBurialSiteComment.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { BurialSiteComment } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:burialSites:doUpdateBurialSiteComment`
)

export type DoUpdateBurialSiteCommentResponse =
  | { errorMessage: string; success: false }
  | {
      success: boolean
      burialSiteComments: BurialSiteComment[]
      errorMessage: string
    }

export default function handler(
  request: Request<
    unknown,
    unknown,
    UpdateBurialSiteCommentForm & { burialSiteId: string }
  >,
  response: Response<DoUpdateBurialSiteCommentResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = updateBurialSiteComment(
      request.body,
      request.session.user as User,
      database
    )

    const burialSiteComments = getBurialSiteComments(
      request.body.burialSiteId,
      database
    )

    response.json({
      success,

      burialSiteComments,

      errorMessage: success ? '' : 'Failed to update comment'
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
