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
      formTemplate,
      /<select\s+id="workOrderCreate--workOrderTypeId"[^>]*>\s*<\/select>/,
      'Create-work-order modal should not include a blank type option'
    )
    assert.match(
      formTemplate,
      /<select\s+id="workOrderCreate--workOrderStatusId"[^>]*>\s*<\/select>/,
      'Create-work-order modal should not include a blank status option'
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
    assert.match(
      modalScript,
      /workOrderTypeSelectElement\.value\s*=\s*workOrderTypes\[0\]\.workOrderTypeId\.toString\(\)/,
      'Contract modal should default the type to the first available option'
    )
    assert.match(
      modalScript,
      /workOrderStatusSelectElement\.value\s*=\s*workOrderStatuses\[0\]\.workOrderStatusId\.toString\(\)/,
      'Contract modal should default the status to the first available option'
    )
  })

  await it('renders the milestones panel for the standalone create work order view', () => {
    const editTemplate = readFileSync(
      join(repoRoot, 'views/workOrders/edit.ejs'),
      'utf8'
    )
    const workOrderEditScript = readFileSync(
      join(repoRoot, 'public/javascripts/workOrder.edit.js'),
      'utf8'
    )

    assert.match(
      editTemplate,
      /id="panel--milestones"/,
      'Standalone work-order edit view should include the milestones panel container'
    )
    assert.match(
      editTemplate,
      /data-work-order-milestone-types=/,
      'Standalone work-order edit view should pass milestone types to the panel'
    )
    assert.match(
      workOrderEditScript,
      /form\s*=\s*["']form--workOrderEdit["']/,
      'Standalone create milestone inputs should belong to the work-order form submission'
    )
  })

  await it('shows contract milestone metadata in work order and print views', () => {
    const workOrderView = readFileSync(
      join(repoRoot, 'views/workOrders/view.ejs'),
      'utf8'
    )
    const workOrderPrint = readFileSync(
      join(repoRoot, 'views/print/pdf/workOrder.ejs'),
      'utf8'
    )

    assert.match(
      workOrderView,
      /directionOfArrival|directionOfArrivalDescription/,
      'Work-order view should include the related contract direction-of-arrival milestone metadata'
    )
    assert.match(
      workOrderView,
      /committalType/,
      'Work-order view should include the related contract committal type milestone metadata'
    )
    assert.match(
      workOrderPrint,
      /Contract Milestones/,
      'Print view should include a contract milestone section between contracts and milestones'
    )
  })
})
