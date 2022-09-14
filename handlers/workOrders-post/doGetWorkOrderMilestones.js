import { getWorkOrderMilestones } from "../../helpers/lotOccupancyDB/getWorkOrderMilestones.js";
export const handler = async (request, response) => {
    const workOrderMilestones = getWorkOrderMilestones(request.body, {
        includeWorkOrders: true,
        orderBy: "date"
    });
    response.json({
        workOrderMilestones
    });
};
export default handler;
