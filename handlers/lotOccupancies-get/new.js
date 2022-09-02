import { dateToInteger, dateToString } from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { getOccupancyTypes } from "../../helpers/functions.cache.js";
import { getLot } from "../../helpers/lotOccupancyDB/getLot.js";
import * as configFunctions from "../../helpers/functions.config.js";
export const handler = (request, response) => {
    const startDate = new Date();
    const lotOccupancy = {
        occupancyStartDate: dateToInteger(startDate),
        occupancyStartDateString: dateToString(startDate)
    };
    if (request.query.lotId) {
        const lot = getLot(request.query.lotId);
        lotOccupancy.lotId = lot.lotId;
        lotOccupancy.lotName = lot.lotName;
        lotOccupancy.mapId = lot.mapId;
        lotOccupancy.mapName = lot.mapName;
    }
    const occupancyTypes = getOccupancyTypes();
    return response.render("lotOccupancy-edit", {
        headTitle: "Create a New " +
            configFunctions.getProperty("aliases.lot") +
            " " +
            configFunctions.getProperty("aliases.occupancy") +
            "  Record",
        lotOccupancy,
        occupancyTypes,
        isCreate: true
    });
};
export default handler;
