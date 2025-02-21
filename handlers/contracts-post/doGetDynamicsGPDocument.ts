/* eslint-disable unicorn/filename-case */

import type { Request, Response } from 'express'

import { getDynamicsGPDocument } from '../../helpers/functions.dynamicsGP.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const externalReceiptNumber = request.body.externalReceiptNumber

  const dynamicsGPDocument = await getDynamicsGPDocument(externalReceiptNumber)

  if (dynamicsGPDocument === undefined) {
    response.json({
      success: false
    })
  } else {
    response.json({
      success: true,
      dynamicsGPDocument
    })
  }
}

