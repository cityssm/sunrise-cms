import type { Request, Response } from 'express'
import { parseFullName } from 'parse-full-name'

import getContract from '../../database/getContract.js'
import getContractMetadataByContractId from '../../database/getContractMetadataByContractId.js'
import { getCachedContractTypePrintsById } from '../../helpers/cache/contractTypes.cache.js'
import { getPrintConfig } from '../../helpers/print.helpers.js'

type ResponseData =
  | {
      success: false

      errorMessage: string
    }
  | {
      success: true

      workflowTitle: string

      consignoCloudPrints: Array<{
        printName: string
        printTitle: string
      }>

      signerFirstName: string
      signerLastName: string

      signerEmail: string
      signerPhone: string
    }

export default async function handler(
  request: Request<unknown, unknown, { contractId: string }>,
  response: Response<ResponseData>
): Promise<void> {
  /*
   * Validate Contract
   */

  const contract = await getContract(request.body.contractId)

  if (contract === undefined) {
    response.json({
      success: false,

      errorMessage: 'Contract not found.'
    })

    return
  } else if (
    contract.purchaserEmail === '' ||
    contract.purchaserPhoneNumber === ''
  ) {
    response.json({
      success: false,

      errorMessage:
        'Contract must have a valid purchaser email and phone number.'
    })

    return
  }

  const parsedName = parseFullName(contract.purchaserName)

  let purchaserFirstName = parsedName.first
  let purchaserLastName = parsedName.last

  if (purchaserFirstName === undefined || purchaserLastName === undefined) {
    purchaserFirstName = contract.purchaserName
    purchaserLastName = ''
  }

  let phoneNumber = contract.purchaserPhoneNumber

  // remove any non-numeric characters
  phoneNumber = phoneNumber.replaceAll(/\D/g, '')

  // add a leading plus sign if the phone number is 10 digits
  if (phoneNumber.length === 10) {
    phoneNumber = `+1${phoneNumber}`
  }

  /*
   * Validate Available Prints
   */

  const contractPrints = getCachedContractTypePrintsById(
    contract.contractTypeId
  )

  const consignoCloudPrints: Array<{
    printName: string
    printTitle: string
  }> = []

  for (const printName of contractPrints) {
    const printConfig = getPrintConfig(printName)

    if (printName.startsWith('pdf/') && printConfig?.consignoCloud !== undefined) {
      consignoCloudPrints.push({
        printName,
        printTitle: printConfig.title
      })
    }
  }

  if (consignoCloudPrints.length === 0) {
    response.json({
      success: false,
      errorMessage: 'No prints available for Consigno Cloud.'
    })

    return
  }

  /*
   * Validate Contract Metadata
   */

  const contractMetadata = getContractMetadataByContractId(
    request.body.contractId,
    'consignoCloud.'
  )

  if (Object.keys(contractMetadata).length > 0) {
    response.json({
      success: false,
      errorMessage: 'Contract already has an active Consigno Cloud process.'
    })

    return
  }

  response.json({
    success: true,

    workflowTitle: `Contract #${contract.contractId} - ${contract.contractType} (${contract.purchaserName})`,

    consignoCloudPrints,


    signerFirstName: purchaserFirstName,
    signerLastName: purchaserLastName,

    signerEmail: contract.purchaserEmail,
    signerPhone: phoneNumber
  })
}
