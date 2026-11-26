import type { Request, Response } from 'express'

import updateSetting, {
  type UpdateSettingForm
} from '../../database/updateSetting.js'


export type DoUpdateSettingResponse =
  { success: boolean }

export default function handler(
  request: Request<unknown, unknown, UpdateSettingForm>,
  response: Response<DoUpdateSettingResponse>
): void {
  const success = updateSetting(request.body)

  response.json({
    success
  })
}
