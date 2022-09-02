import type { RequestHandler } from "express";

import { moveFeeUp } from "../../helpers/lotOccupancyDB/moveFeeUp.js";

import { getFeeCategories } from "../../helpers/lotOccupancyDB/getFeeCategories.js";

export const handler: RequestHandler = async (request, response) => {
    const success = moveFeeUp(request.body.feeId);

    const feeCategories = getFeeCategories(
        {},
        {
            includeFees: true
        }
    );

    response.json({
        success,
        feeCategories
    });
};

export default handler;
