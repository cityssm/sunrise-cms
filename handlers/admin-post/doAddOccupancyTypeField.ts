import type { Request, Response } from 'express'

import addOccupancyTypeField, {
  type AddOccupancyTypeFieldForm
} from '../../database/addOccupancyTypeField.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const contractTypeFieldId = await addOccupancyTypeField(
    request.body as AddOccupancyTypeFieldForm,
    request.session.user as User
  )

  const occupancyTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success: true,
    contractTypeFieldId,
    occupancyTypes,
    allContractTypeFields
  })
}
