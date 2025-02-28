import { dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getContracts from '../../database/getContracts.js'
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js'
import { getWorkOrders } from '../../database/getWorkOrders.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const currentDateString = dateToString(new Date())

  const workOrderMilestones = await getWorkOrderMilestones(
    {
      workOrderMilestoneDateFilter: 'date',
      workOrderMilestoneDateString: currentDateString
    },
    {
      orderBy: 'completion',
      includeWorkOrders: true
    }
  )

  const workOrderResults = await getWorkOrders(
    {
      workOrderOpenDateString: currentDateString
    },
    {
      limit: 1, // only using the count
      offset: 0
    }
  )

  const contractResults = await getContracts(
    {
      contractStartDateString: currentDateString
    },
    {
      limit: 1, // only using the count
      offset: 0,
      includeFees: false,
      includeInterments: false,
      includeTransactions: false
    }
  )

  response.render('dashboard', {
    headTitle: 'Dashboard',
    workOrderMilestones,
    workOrderCount: workOrderResults.count,
    contractCount: contractResults.count
  })
}
