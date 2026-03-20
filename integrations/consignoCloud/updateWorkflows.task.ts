import { ScheduledTask } from '@cityssm/scheduled-task'
import { minutesToMillis } from '@cityssm/to-millis'
import { Range } from 'node-schedule'

import getConsignoCloudContractMetadata from '../../database/getConsignoCloudContractMetadata.js'

import pollWorkflow, { clearApiCache } from './pollWorkflow.js'

const taskName = 'Update Consigno Workflows Task'

const taskUser: User = {
  userName: 'task.updateConsignoWorkflows',
  userProperties: {
    canUpdateCemeteries: false,
    canUpdateContracts: true,
    canUpdateWorkOrders: false,
    isAdmin: false
  },
  userSettings: {}
}

async function updateConsignoWorkflows(): Promise<void> {
  const consignoCloudMetadata = getConsignoCloudContractMetadata()

  for (const [contractId, metadata] of Object.entries(consignoCloudMetadata)) {
    await pollWorkflow(
      {
        contractId,
        metadata
      },
      taskUser
    )
  }

  // Clear the API cache after polling all workflows
  clearApiCache()
}

/* eslint-disable @typescript-eslint/no-magic-numbers */

const scheduledTask = new ScheduledTask(taskName, updateConsignoWorkflows, {
  schedule: {
    hour: new Range(0, 23),
    minute: 0,
    second: 0
  },

  minimumIntervalMillis: minutesToMillis(10),
  startTask: true
})

/* eslint-enable @typescript-eslint/no-magic-numbers */

await scheduledTask.runTask()
