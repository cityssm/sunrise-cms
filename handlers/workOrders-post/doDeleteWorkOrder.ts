import type { RequestHandler } from "express";

import { deleteWorkOrder } from "../../helpers/lotOccupancyDB/deleteWorkOrder.js";

export const handler: RequestHandler = async (request, response) => {
    const success = deleteWorkOrder(request.body.workOrderId, request.session);

    response.json({
        success
    });
};

export default handler;
