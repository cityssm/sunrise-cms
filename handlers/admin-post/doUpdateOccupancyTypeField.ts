import type { Request, Response } from 'express'

import updateOccupancyTypeField, {
  type UpdateOccupancyTypeFieldForm
} from '../../database/updateOccupancyTypeField.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateOccupancyTypeField(
    request.body as UpdateOccupancyTypeFieldForm,
    request.session.user as User
  )

  const occupancyTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success,
    occupancyTypes,
    allContractTypeFields
  })
}
