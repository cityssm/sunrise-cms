import startConsignoCloudWorkflow from '../../integrations/consignoCloud/startConsignoCloudWorkflow.js';
export default async function handler(request, response) {
    try {
        const { workflowEditUrl, workflowId } = await startConsignoCloudWorkflow(request.body, request.session.user);
        response.json({
            success: true,
            workflowEditUrl,
            workflowId
        });
    }
    catch (error) {
        response.json({
            success: false,
            errorMessage: error.message
        });
    }
}
