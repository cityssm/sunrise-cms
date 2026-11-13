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

  await it('shows updated contract service and recipient metadata in work order and print views', () => {
    const workOrderView = readFileSync(
      join(repoRoot, 'views/workOrders/view.ejs'),
      'utf8'
    )
    const workOrderPrint = readFileSync(
      join(repoRoot, 'views/print/pdf/workOrder.ejs'),
      'utf8'
    )
    const workOrderEdit = readFileSync(
      join(repoRoot, 'views/workOrders/edit.ejs'),
      'utf8'
    )

    assert.match(
      workOrderView,
      /Service Details/,
      'Work-order view should rename the contract service column to Service Details'
    )
    assert.match(
      workOrderView,
      /Recipient/,
      'Work-order view should rename the contract recipient column to Recipient'
    )
    assert.doesNotMatch(
      workOrderView,
      /Contract Milestones/,
      'Work-order view should no longer include the redundant contract milestone section'
    )
    assert.match(
      workOrderPrint,
      /Service Details/,
      'Print view should include the renamed Service Details column'
    )
    assert.match(
      workOrderPrint,
      /Recipient/,
      'Print view should include the renamed Recipient column'
    )
    assert.doesNotMatch(
      workOrderPrint,
      /Contract Milestones/,
      'Print view should no longer include the redundant contract milestone section'
    )
    assert.doesNotMatch(
      workOrderEdit,
      /panel--contractMilestones/,
      'Edit work-order view should not render the redundant contract milestone panel'
    )
  })
})
