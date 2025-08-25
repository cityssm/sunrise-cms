import assert from 'node:assert'
import { after, describe, it } from 'node:test'

import addWorkOrder from '../database/addWorkOrder.js'
import getWorkOrders from '../database/getWorkOrders.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { closePdfPuppeteer, generatePdf } from '../helpers/pdf.helpers.js'
import {
  type PrintConfigWithPath,
  getPrintConfig
} from '../helpers/print.helpers.js'

const testWorkOrderForm = {
  workOrderDescription: 'Test PDF Generation with Reliability Improvements',
  workOrderTypeId: 1
}

const testUser = {
  userName: 'testuser',
  canLogin: true,
  canUpdate: ['workOrders'],
  isAdmin: false
}

await describe('PDF Generation Reliability Test', async () => {
  after(() => {
    void closePdfPuppeteer()
  })

  await it('should handle PDF generation with improved error handling', async () => {
    // Create a test work order
    console.log('Creating test work order...')
    const workOrderId = addWorkOrder(testWorkOrderForm, testUser)
    console.log('Created work order ID:', workOrderId)

    // Verify work order was created
    const workOrders = await getWorkOrders(
      {},
      {
        limit: 1,
        offset: 0
      }
    )

    assert.ok(workOrders.count > 0, 'Expected at least one work order')
    console.log('Found', workOrders.count, 'work orders')

    // Get the print configuration
    const workOrderPrints = getConfigProperty('settings.workOrders.prints')
    console.log('Available print configs:', workOrderPrints)

    let pdfPrintConfig: PrintConfigWithPath | undefined

    for (const printName of workOrderPrints) {
      const printConfig = getPrintConfig(printName)

      if (printConfig !== undefined && Object.hasOwn(printConfig, 'path')) {
        pdfPrintConfig = printConfig as PrintConfigWithPath
        break
      }
    }

    assert.ok(
      pdfPrintConfig !== undefined,
      'Expected a valid PDF print configuration'
    )

    console.log('Using print config:', pdfPrintConfig.title)

    // Test PDF generation with retry logic
    console.log('Testing PDF generation with improved error handling...')
    
    try {
      // Test the new configuration settings
      const maxRetries = getConfigProperty('settings.printPdf.maxRetries', 3)
      const proactiveInstallation = getConfigProperty('settings.printPdf.proactiveInstallation', true)
      
      console.log('Max retries configured:', maxRetries)
      console.log('Proactive installation enabled:', proactiveInstallation)
      
      const pdf = await generatePdf(pdfPrintConfig, { workOrderId })
      console.log('PDF generated successfully, size:', pdf.length, 'bytes')
      
      // Verify it's a valid PDF (basic check)
      assert.ok(pdf.length > 0, 'Expected PDF to have content')
      
      // Check PDF header (basic validation)
      const pdfHeader = new TextDecoder().decode(pdf.slice(0, 5))
      assert.ok(pdfHeader === '%PDF-', 'Expected valid PDF header')
      
      console.log('✓ PDF generation test passed with reliability improvements')
      
    } catch (error) {
      console.error('PDF generation failed:', (error as Error).message)
      
      // With our improvements, we expect better error messages
      if ((error as Error).message.includes('after') && (error as Error).message.includes('attempts')) {
        console.log('✓ Error message includes retry information - improvement working')
      }
      
      throw error
    }
  })
})