import type { Request, Response } from 'express';
import { type UpdateConsignoCloudUserSettingsForm } from '../../database/updateConsignoCloudUserSettings.js';
export type DoUpdateConsignoCloudUserSettingsResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
};
export default function handler(request: Request<unknown, unknown, UpdateConsignoCloudUserSettingsForm>, response: Response<DoUpdateConsignoCloudUserSettingsResponse>): void;
