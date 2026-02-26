import type { Request, Response } from 'express';
export type DoGetContractDetailsForConsignoCloudResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    workflowTitle: string;
    consignoCloudPrints: Array<{
        printName: string;
        printTitle: string;
    }>;
    signerFirstName: string;
    signerLastName: string;
    signerEmail: string;
    signerPhone: string;
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
}>, response: Response<DoGetContractDetailsForConsignoCloudResponse>): Promise<void>;
