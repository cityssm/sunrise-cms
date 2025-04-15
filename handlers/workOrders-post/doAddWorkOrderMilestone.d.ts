import type { Request, Response } from 'express';
import { type AddWorkOrderMilestoneForm } from '../../database/addWorkOrderMilestone.js';
export default function handler(request: Request<unknown, unknown, AddWorkOrderMilestoneForm>, response: Response): Promise<void>;
