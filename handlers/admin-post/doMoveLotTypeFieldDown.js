import { moveLotTypeFieldDown } from "../../helpers/lotOccupancyDB/moveLotTypeFieldDown.js";
import { getLotTypes } from "../../helpers/functions.cache.js";
export const handler = async (request, response) => {
    const success = moveLotTypeFieldDown(request.body.lotTypeFieldId);
    const lotTypes = getLotTypes();
    response.json({
        success,
        lotTypes
    });
};
export default handler;
