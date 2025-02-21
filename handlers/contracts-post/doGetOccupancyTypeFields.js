import { getOccupancyTypeById, getAllOccupancyTypeFields } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const allOccupancyTypeFields = await getAllOccupancyTypeFields();
    const result = (await getOccupancyTypeById(Number.parseInt(request.body.occupancyTypeId, 10)));
    const occupancyTypeFields = [...allOccupancyTypeFields];
    occupancyTypeFields.push(...(result.occupancyTypeFields ?? []));
    response.json({
        occupancyTypeFields
    });
}
