import type { Request, Response } from 'express'

import startConsignoCloudWorkflow, {
  type StartConsignoCloudWorkflowForm
} from '../../integrations/consignoCloud/startWorkflow.js'

export default async function handler(
  request: Request<unknown, unknown, StartConsignoCloudWorkflowForm>,
  response: Response
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
      success: false,
    })
  }
}
