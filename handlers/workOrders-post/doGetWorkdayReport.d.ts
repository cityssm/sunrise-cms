import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    workdayDateString: DateString;
}>, response: Response): Promise<void>;
