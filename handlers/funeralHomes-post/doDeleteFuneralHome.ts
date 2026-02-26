import type { Request, Response } from 'express'

import deleteFuneralHome from '../../database/deleteFuneralHome.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteFuneralHomeResponse =
  { success: boolean; errorMessage: string }

export default function handler(
  request: Request<unknown, unknown, { funeralHomeId: number | string }>,
  response: Response<DoDeleteFuneralHomeResponse>
): void {
  const success = deleteFuneralHome(
    request.body.funeralHomeId,
    request.session.user as User
  )

  response.json({
    success,

    errorMessage: success
      ? ''
      : 'Note that funeral homes with current or upcoming funerals cannot be deleted.'
  })
}
