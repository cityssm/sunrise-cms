import addIntermentContainerType from '../../database/addIntermentContainerType.js';
import getIntermentContainerTypes from '../../database/getIntermentContainerTypes.js';
let intermentContainerTypes = getIntermentContainerTypes();
export function getIntermentContainerTypeIdByKey(intermentContainerTypeKey, user) {
    const intermentContainerType = intermentContainerTypes.find((intermentContainerType) => intermentContainerType.intermentContainerTypeKey ===
        intermentContainerTypeKey);
    if (intermentContainerType === undefined) {
        const intermentContainerTypeId = addIntermentContainerType({
            intermentContainerTypeKey,
            intermentContainerType: intermentContainerTypeKey
        }, user);
        intermentContainerTypes = getIntermentContainerTypes();
        return intermentContainerTypeId;
    }
    return intermentContainerType.intermentContainerTypeId;
}
