import {
  type DiamondCashReceipt,
  type DiamondExtendedGPInvoice,
  type GPInvoice,
  DynamicsGP
} from '@cityssm/dynamics-gp'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { DynamicsGPLookup } from '../../types/config.types.js'

import type { DynamicsGPDocument } from './types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:dynamicsGP.helpers:${process.pid}`)

let gp: DynamicsGP

if (getConfigProperty('integrations.dynamicsGP.integrationIsEnabled')) {
  gp = new DynamicsGP(getConfigProperty('integrations.dynamicsGP.mssqlConfig'))
}

export async function getDynamicsGPDocument(
  documentNumber: string
): Promise<DynamicsGPDocument | undefined> {
  if (!getConfigProperty('integrations.dynamicsGP.integrationIsEnabled')) {
    return undefined
  }

  let document: DynamicsGPDocument | undefined

  for (const lookupType of getConfigProperty(
    // eslint-disable-next-line no-secrets/no-secrets
    'integrations.dynamicsGP.lookupOrder'
  )) {
    try {
      document = await _getDynamicsGPDocument(documentNumber, lookupType)
    } catch (error) {
      debug(`Error fetching Dynamics GP document for ${lookupType}:`)
      debug(error)
    }

    if (document !== undefined) {
      break
    }
  }

  return document
}

async function _getDynamicsGPDocument(
  documentNumber: string,
  lookupType: DynamicsGPLookup
): Promise<DynamicsGPDocument | undefined> {
  let document: DynamicsGPDocument | undefined

  switch (lookupType) {
    case 'diamond/cashReceipt': {
      let receipt: DiamondCashReceipt | undefined =
        await gp.getDiamondCashReceiptByDocumentNumber(documentNumber)

      if (receipt !== undefined) {
        receipt = filterCashReceipt(receipt)
      }

      if (receipt !== undefined) {
        document = {
          documentType: 'Cash Receipt',
          documentNumber: receipt.documentNumber.toString(),
          documentDate: receipt.documentDate,
          documentDescription: [
            receipt.description,
            receipt.description2,
            receipt.description3,
            receipt.description4,
            receipt.description5
          ],
          documentTotal: receipt.total
        }
      }

      break
    }
    case 'diamond/extendedInvoice': {
      let invoice =
        await gp.getDiamondExtendedInvoiceByInvoiceNumber(documentNumber)

      if (invoice !== undefined) {
        invoice = filterExtendedInvoice(invoice)
      }

      if (invoice !== undefined) {
        document = {
          documentType: 'Invoice',
          documentNumber: invoice.invoiceNumber,
          documentDate: invoice.documentDate,
          documentDescription: [
            invoice.comment1,
            invoice.comment2,
            invoice.comment3,
            invoice.comment4
          ],
          documentTotal: invoice.documentAmount
        }
      }

      break
    }
    case 'invoice': {
      let invoice = await gp.getInvoiceByInvoiceNumber(documentNumber)

      if (invoice !== undefined) {
        invoice = filterInvoice(invoice)
      }

      if (invoice !== undefined) {
        document = {
          documentType: 'Invoice',
          documentNumber: invoice.invoiceNumber,
          documentDate: invoice.documentDate,
          documentDescription: [
            invoice.comment1,
            invoice.comment2,
            invoice.comment3,
            invoice.comment4
          ],
          documentTotal: invoice.documentAmount
        }
      }

      break
    }
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    // no default
  }

  return document
}

function filterCashReceipt(
  cashReceipt: DiamondCashReceipt
): DiamondCashReceipt | undefined {
  const accountCodes = getConfigProperty('integrations.dynamicsGP.accountCodes')

  if (accountCodes.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    for (const detail of cashReceipt?.details ?? []) {
      if (accountCodes.includes(detail.accountCode)) {
        return cashReceipt
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    for (const distribution of cashReceipt?.distributions ?? []) {
      if (accountCodes.includes(distribution.accountCode)) {
        return cashReceipt
      }
    }

    return undefined
  }

  return cashReceipt
}

function filterExtendedInvoice(
  invoice: DiamondExtendedGPInvoice
): DiamondExtendedGPInvoice | undefined {
  if (filterInvoice(invoice) === undefined) {
    return undefined
  }

  const trialBalanceCodes = getConfigProperty(
    'integrations.dynamicsGP.trialBalanceCodes'
  )

  if (
    trialBalanceCodes.length > 0 &&
    trialBalanceCodes.includes(invoice.trialBalanceCode ?? '')
  ) {
    return invoice
  }

  return undefined
}

function filterInvoice(invoice: GPInvoice): GPInvoice | undefined {
  const itemNumbers = getConfigProperty('integrations.dynamicsGP.itemNumbers')

  for (const itemNumber of itemNumbers) {
    const found = invoice.lineItems.some(
      (itemRecord) => itemRecord.itemNumber === itemNumber
    )

    if (!found) {
      return undefined
    }
  }

  return invoice
}
