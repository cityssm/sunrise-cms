import type { Request, Response } from 'express';
import { type UpdateSettingForm } from '../../database/updateSetting.js';
export default function handler(request: Request<unknown, unknown, UpdateSettingForm>, response: Response): void;
