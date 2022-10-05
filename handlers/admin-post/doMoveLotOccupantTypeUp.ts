import type { RequestHandler } from "express";

import {
    moveLotOccupantTypeUp,
    moveLotOccupantTypeUpToTop
} from "../../helpers/lotOccupancyDB/moveLotOccupantTypeUp.js";

import { getLotOccupantTypes } from "../../helpers/functions.cache.js";

export const handler: RequestHandler = async (request, response) => {
    const success =
        request.body.moveToTop === "1"
            ? moveLotOccupantTypeUpToTop(request.body.lotOccupantTypeId)
            : moveLotOccupantTypeUp(request.body.lotOccupantTypeId);

    const lotOccupantTypes = getLotOccupantTypes();

    response.json({
        success,
        lotOccupantTypes
    });
};

export default handler;
