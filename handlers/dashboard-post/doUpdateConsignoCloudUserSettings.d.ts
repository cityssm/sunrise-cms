import type { Request, Response } from 'express';
import { type UpdateConsignoCloudUserSettingsForm } from '../../database/updateConsignoCloudUserSettings.js';
export type DoUpdateConsignoCloudUserSettingsResponse = {
    success: boolean;
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, UpdateConsignoCloudUserSettingsForm>, response: Response<DoUpdateConsignoCloudUserSettingsResponse>): void;
