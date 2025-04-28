import type { Request, Response } from 'express'

import getBurialSiteDirectionsOfArrival, {
  defaultDirectionsOfArrival
} from '../../database/getBurialSiteDirectionsOfArrival.js'

export default function handler(
  request: Request<unknown, unknown, { burialSiteId: string }>,
  response: Response
): void {
  const directionsOfArrival =
    request.body.burialSiteId === ''
      ? defaultDirectionsOfArrival
      : getBurialSiteDirectionsOfArrival(request.body.burialSiteId)

  response.json({
    directionsOfArrival
  })
}
