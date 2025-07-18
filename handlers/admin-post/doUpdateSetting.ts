import type { Request, Response } from 'express'

import updateSetting, {
  type UpdateSettingForm
} from '../../database/updateSetting.js'

export default function handler(
  request: Request<unknown, unknown, UpdateSettingForm>,
  response: Response
): void {
  const success = updateSetting(request.body)

  response.json({
    success
  })
}
