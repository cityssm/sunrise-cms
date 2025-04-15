import type { Request, Response } from 'express';
import { type CloseWorkOrderForm } from '../../database/closeWorkOrder.js';
export default function handler(request: Request<unknown, unknown, CloseWorkOrderForm>, response: Response): Promise<void>;
