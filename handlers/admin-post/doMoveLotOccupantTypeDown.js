import { moveRecordDown, moveRecordDownToBottom } from "../../helpers/lotOccupancyDB/moveRecord.js";
import { getLotOccupantTypes } from "../../helpers/functions.cache.js";
export const handler = async (request, response) => {
    const success = request.body.moveToEnd === "1"
        ? moveRecordDownToBottom("LotOccupantTypes", request.body.lotOccupantTypeId)
        : moveRecordDown("LotOccupantTypes", request.body.lotOccupantTypeId);
    const lotOccupantTypes = getLotOccupantTypes();
    response.json({
        success,
        lotOccupantTypes
    });
};
export default handler;
