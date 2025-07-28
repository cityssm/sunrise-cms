import type { Request, Response } from 'express';
import { type UpdateConsignoCloudUserSettingsForm } from '../../database/updateConsignoCloudUserSettings.js';
export default function handler(request: Request<unknown, unknown, UpdateConsignoCloudUserSettingsForm>, response: Response): void;
