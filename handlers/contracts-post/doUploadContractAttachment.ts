import type { Request, Response } from 'express'

import addContractAttachment from '../../database/addContractAttachment.js'
import getContract from '../../database/getContract.js'
import { writeAttachment } from '../../helpers/attachments.helpers.js'

export interface UploadContractAttachmentForm {
  contractId: string
  attachmentTitle?: string
  attachmentDetails?: string
}

export default async function handler(
  request: Request<unknown, unknown, UploadContractAttachmentForm>,
  response: Response
): Promise<void> {
  const file = (request as Request & { file: Express.Multer.File }).file

  if (file === undefined) {
    response.json({
      success: false,
      errorMessage: 'No file uploaded.'
    })
    return
  }

  const contractId = Number.parseInt(request.body.contractId, 10)

  // Verify contract exists
  const contract = getContract(contractId)
  if (contract === undefined) {
    response.json({
      success: false,
      errorMessage: 'Contract not found.'
    })
    return
  }

  try {
    // Write file to disk
    const { fileName, filePath } = await writeAttachment(
      file.originalname,
      file.buffer
    )

    // Add attachment record to database
    const attachmentId = addContractAttachment(
      {
        contractId,
        attachmentTitle: request.body.attachmentTitle || file.originalname,
        attachmentDetails: request.body.attachmentDetails || '',
        fileName,
        filePath
      },
      request.session.user as User
    )

    response.json({
      success: true,
      attachmentId
    })
  } catch (error) {
    response.json({
      success: false,
      errorMessage: (error as Error).message
    })
  }
}