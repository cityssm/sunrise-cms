import type { Request, Response } from 'express'

import addWorkOrderLotOccupancy from '../../database/addWorkOrderLotOccupancy.js'
import getBurialSiteContracts from '../../database/getBurialSiteContracts.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await addWorkOrderLotOccupancy(
    {
      workOrderId: request.body.workOrderId as string,
      burialSiteContractId: request.body.burialSiteContractId as string
    },
    request.session.user as User
  )

  const workOrderLotOccupanciesResults = await getBurialSiteContracts(
    {
      workOrderId: request.body.workOrderId as string
    },
    {
      limit: -1,
      offset: 0,
      includeOccupants: true,
      includeFees: false,
      includeTransactions: false
    }
  )

  response.json({
    success,
    workOrderLotOccupancies: workOrderLotOccupanciesResults.lotOccupancies
  })
}
