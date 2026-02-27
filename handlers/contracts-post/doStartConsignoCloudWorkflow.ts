import type { Request, Response } from 'express'

import startConsignoCloudWorkflow, {
  type StartConsignoCloudWorkflowForm
} from '../../integrations/consignoCloud/startWorkflow.js'

export type DoStartConsignoCloudWorkflowResponse =
  | {
      success: false

      errorMessage: string
    }
  | { success: true; workflowEditUrl: string; workflowId: string }

export default async function handler(
  request: Request<unknown, unknown, StartConsignoCloudWorkflowForm>,
  response: Response<DoStartConsignoCloudWorkflowResponse>
): Promise<void> {
  try {
    const { workflowEditUrl, workflowId } = await startConsignoCloudWorkflow(
      request.body,
      request.session.user as User
    )

    response.json({
      success: true,
      workflowEditUrl,
      workflowId
    })
  } catch (error) {
    response.json({
      errorMessage: (error as Error).message,
      success: false
    })
  }
}
