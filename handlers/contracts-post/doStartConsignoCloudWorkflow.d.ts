import type { Request, Response } from 'express';
import { type StartConsignoCloudWorkflowForm } from '../../integrations/consignoCloud/startWorkflow.js';
export type DoStartConsignoCloudWorkflowResponse = {
    success: true;
    workflowEditUrl: string;
    workflowId: string;
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, StartConsignoCloudWorkflowForm>, response: Response<DoStartConsignoCloudWorkflowResponse>): Promise<void>;
