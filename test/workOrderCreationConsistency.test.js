import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

await describe('work order creation consistency', async () => {
  await it('renders milestone data for the standalone new work order flow', () => {
    const handlerSource = readFileSync(
      join(repoRoot, 'handlers/workOrdersGet/new.js'),
      'utf8'
    )

    assert.match(
      handlerSource,
      /getCachedWorkOrderMilestoneTypes/,
      'Standalone new-work-order handler should include cached milestone types'
    )
    assert.match(
      handlerSource,
      /workOrderMilestoneTypes,\s*workOrderStatuses,\s*workOrderTypes/,
      'Standalone new-work-order render should include milestone and status data together'
    )
  })

  await it('passes status data through the contract create modal workflow', () => {
    const contractCreateButton = readFileSync(
      join(repoRoot, 'views/contracts/_viewEdit-workOrders.ejs'),
      'utf8'
    )
    const formTemplate = readFileSync(
      join(repoRoot, 'public/html/contract-createWorkOrder.html'),
      'utf8'
    )
    const modalScript = readFileSync(
      join(repoRoot, 'public/javascripts/contract.editWorkOrders.js'),
      'utf8'
    )

    assert.match(
      contractCreateButton,
      /data-work-order-statuses=/,
      'Contract create button should include status data payload'
    )
    assert.match(
      formTemplate,
      /workOrderCreate--workOrderStatusId/,
      'Create-work-order modal should include status select field'
    )
    assert.match(
      modalScript,
      /dataset\.workOrderStatuses/,
      'Contract modal script should read status options from button data'
    )
    assert.match(
      modalScript,
      /#workOrderCreate--workOrderStatusId/,
      'Contract modal script should populate the created status field'
    )
  })
})
