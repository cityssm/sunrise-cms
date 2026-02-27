import type { Request, Response } from 'express';
import { type StartConsignoCloudWorkflowForm } from '../../integrations/consignoCloud/startWorkflow.js';
export type DoStartConsignoCloudWorkflowResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    workflowEditUrl: string;
    workflowId: string;
};
export default function handler(request: Request<unknown, unknown, StartConsignoCloudWorkflowForm>, response: Response<DoStartConsignoCloudWorkflowResponse>): Promise<void>;
