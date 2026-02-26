import type { Request, Response } from 'express';
import { type AddForm } from '../../database/addFuneralHome.js';
export type DoCreateFuneralHomeResponse = {
    success: true;
    funeralHomeId: number;
};
export default function handler(request: Request<unknown, unknown, AddForm>, response: Response<DoCreateFuneralHomeResponse>): void;
