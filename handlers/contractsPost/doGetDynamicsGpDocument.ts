import type { Request, Response } from 'express'

import { getDynamicsGPDocument } from '../../integrations/dynamicsGp/helpers.js'
import type { DynamicsGPDocument } from '../../integrations/dynamicsGp/types.js'

export type DoGetDynamicsGpDocumentResponse =
  | { success: false }
  | {
      success: true

      dynamicsGpDocument: DynamicsGPDocument
    }

export default async function handler(
  request: Request<unknown, unknown, { externalReceiptNumber: string }>,
  response: Response<DoGetDynamicsGpDocumentResponse>
): Promise<void> {
  const { externalReceiptNumber } = request.body

  const dynamicsGpDocument = await getDynamicsGPDocument(externalReceiptNumber)

  if (dynamicsGpDocument === undefined) {
    response.json({
      success: false
    })
  } else {
    response.json({
      success: true,

      dynamicsGpDocument
    })
  }
}
