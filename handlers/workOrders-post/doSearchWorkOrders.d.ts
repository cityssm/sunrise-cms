import type { Request, Response } from 'express';
import { type GetWorkOrdersFilters, type GetWorkOrdersOptions } from '../../database/getWorkOrders.js';
export default function handler(request: Request<unknown, unknown, GetWorkOrdersFilters & GetWorkOrdersOptions>, response: Response): Promise<void>;
