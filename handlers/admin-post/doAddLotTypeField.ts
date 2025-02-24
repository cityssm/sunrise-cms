import type { Request, Response } from 'express'

import addLotTypeField, {
  type AddLotTypeFieldForm
} from '../../database/addLotTypeField.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lotTypeFieldId = await addLotTypeField(
    request.body as AddLotTypeFieldForm,
    request.session.user as User
  )

  const lotTypes = await getBurialSiteTypes()

  response.json({
    success: true,
    lotTypeFieldId,
    lotTypes
  })
}
