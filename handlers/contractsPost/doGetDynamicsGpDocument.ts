import type { Request, Response } from 'express'

import { getDynamicsGpDocument } from '../../integrations/dynamicsGp/helpers.js'
import type { DynamicsGpDocument } from '../../integrations/dynamicsGp/types.js'

export type DoGetDynamicsGpDocumentResponse =
  | { success: false }
  | {
      success: true

      dynamicsGpDocument: DynamicsGpDocument
    }

export default async function handler(
  request: Request<unknown, unknown, { externalReceiptNumber: string }>,
  response: Response<DoGetDynamicsGpDocumentResponse>
): Promise<void> {
  const { externalReceiptNumber } = request.body

  const dynamicsGpDocument = await getDynamicsGpDocument(externalReceiptNumber)

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
