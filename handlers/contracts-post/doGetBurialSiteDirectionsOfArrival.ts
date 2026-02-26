import type { Request, Response } from 'express'

import getBurialSiteDirectionsOfArrival, {
  defaultDirectionsOfArrival
} from '../../database/getBurialSiteDirectionsOfArrival.js'
import type { directionsOfArrival } from '../../helpers/dataLists.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetBurialSiteDirectionsOfArrivalResponse =
  { directionsOfArrival: Partial<Record<(typeof directionsOfArrival)[number], string>> }

export default function handler(
  request: Request<unknown, unknown, { burialSiteId: string }>,
  response: Response<DoGetBurialSiteDirectionsOfArrivalResponse>
): void {
  const directionsOfArrival =
    request.body.burialSiteId === ''
      ? defaultDirectionsOfArrival
      : getBurialSiteDirectionsOfArrival(request.body.burialSiteId)

  response.json({
    directionsOfArrival
  })
}
