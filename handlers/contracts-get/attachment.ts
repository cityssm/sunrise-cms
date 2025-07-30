import path from 'node:path'

import type { Request, Response } from 'express'

import getContractAttachment from '../../database/getContractAttachment.js'

export default function handler(
  request: Request<{ attachmentId: string }>,
  response: Response
): void {
  const contractAttachment = getContractAttachment(request.params.attachmentId)

  if (contractAttachment === undefined) {
    response.status(404).send()

    return
  }

  response.sendFile(
    path.join(contractAttachment.filePath ?? '', contractAttachment.fileName),
    {
      headers: {
        'Content-Disposition': `attachment; filename="${contractAttachment.fileName}"`
      },
      root: process.cwd() // Ensure the path is relative to the current working directory
    }
  )
}
