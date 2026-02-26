import type { Request, Response } from 'express'

import startConsignoCloudWorkflow, {
  type StartConsignoCloudWorkflowForm
} from '../../integrations/consignoCloud/startWorkflow.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoStartConsignoCloudWorkflowResponse =
  { success: true; workflowEditUrl: string; workflowId: string }
  | { errorMessage: string; success: false }

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
      success: false,
    })
  }
}
