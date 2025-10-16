import type { Request, Response } from 'express';
import { type StartConsignoCloudWorkflowForm } from '../../integrations/consignoCloud/startWorkflow.js';
export default function handler(request: Request<unknown, unknown, StartConsignoCloudWorkflowForm>, response: Response): Promise<void>;
