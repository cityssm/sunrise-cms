import type { RequestHandler } from "express";

import { addOccupancyTypeField } from "../../helpers/lotOccupancyDB/addOccupancyTypeField.js";

import { getAllOccupancyTypeFields, getOccupancyTypes } from "../../helpers/functions.cache.js";

export const handler: RequestHandler = async (request, response) => {
    const occupancyTypeFieldId = addOccupancyTypeField(request.body, request.session);

    const occupancyTypes = getOccupancyTypes();
    const allOccupancyTypeFields = getAllOccupancyTypeFields();

    response.json({
        success: true,
        occupancyTypeFieldId,
        occupancyTypes,
        allOccupancyTypeFields
    });
};

export default handler;
