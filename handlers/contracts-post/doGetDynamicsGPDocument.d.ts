import type { Request, Response } from 'express';
import type { DynamicsGPDocument } from '../../integrations/dynamicsGp/types.js';
export type DoGetDynamicsGPDocumentResponse = {
    success: false;
} | {
    success: true;
    dynamicsGPDocument: DynamicsGPDocument;
};
export default function handler(request: Request<unknown, unknown, {
    externalReceiptNumber: string;
}>, response: Response<DoGetDynamicsGPDocumentResponse>): Promise<void>;
