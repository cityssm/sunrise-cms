import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
import { type UpdateWorkOrderMilestoneTimeForm } from '../../database/updateWorkOrderMilestoneTime.js';
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderMilestoneTimeForm & {
    workdayDateString: DateString;
}>, response: Response): Promise<void>;
