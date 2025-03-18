import addIntermentContainerType from '../../database/addIntermentContainerType.js';
import getIntermentContainerTypes from '../../database/getIntermentContainerTypes.js';
let intermentContainerTypes = await getIntermentContainerTypes();
export async function getIntermentContainerTypeIdByKey(intermentContainerTypeKey, user) {
    const intermentContainerType = intermentContainerTypes.find((intermentContainerType) => intermentContainerType.intermentContainerTypeKey ===
        intermentContainerTypeKey);
    if (intermentContainerType === undefined) {
        const intermentContainerTypeId = await addIntermentContainerType({
            intermentContainerTypeKey,
            intermentContainerType: intermentContainerTypeKey
        }, user);
        intermentContainerTypes = await getIntermentContainerTypes();
        return intermentContainerTypeId;
    }
    return intermentContainerType.intermentContainerTypeId;
}
