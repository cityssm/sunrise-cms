import type { Request, Response } from 'express';
import { type UpdateWorkOrderForm } from '../../database/updateWorkOrder.js';
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderForm>, response: Response): void;
