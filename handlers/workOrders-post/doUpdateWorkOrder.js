import { updateWorkOrder } from "../../helpers/lotOccupancyDB/updateWorkOrder.js";
export const handler = async (request, response) => {
    const success = updateWorkOrder(request.body, request.session);
    response.json({
        success,
        workOrderId: request.body.workOrderId
    });
};
export default handler;
