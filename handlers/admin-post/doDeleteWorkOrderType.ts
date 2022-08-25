import type {
    RequestHandler
} from "express";

import {
    deleteWorkOrderType
} from "../../helpers/lotOccupancyDB/deleteWorkOrderType.js";

import {
    getWorkOrderTypes
} from "../../helpers/functions.cache.js";


export const handler: RequestHandler = async (request, response) => {

    const success = deleteWorkOrderType(request.body.workOrderTypeId, request.session);

    const workOrderTypes = getWorkOrderTypes();

    response.json({
        success,
        workOrderTypes
    });
};


export default handler;