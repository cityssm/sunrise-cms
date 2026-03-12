import type { Request, Response } from 'express';
export declare function handler(request: Request<{
    printName: string;
}>, response: Response): Promise<void>;
export default handler;
