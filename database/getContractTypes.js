import getContractTypeFields from './getContractTypeFields.js';
import getContractTypePrints from './getContractTypePrints.js';
import { acquireConnection } from './pool.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default async function getContractTypes() {
    const database = await acquireConnection();
    const contractTypes = database
        .prepare(`select contractTypeId, contractType, orderNumber
        from ContractTypes
        where recordDelete_timeMillis is null
        order by orderNumber, contractType`)
        .all();
    let expectedOrderNumber = -1;
    for (const contractType of contractTypes) {
        expectedOrderNumber += 1;
        if (contractType.orderNumber !== expectedOrderNumber) {
            updateRecordOrderNumber('ContractTypes', contractType.contractTypeId, expectedOrderNumber, database);
            contractType.orderNumber = expectedOrderNumber;
        }
        contractType.contractTypeFields = await getContractTypeFields(contractType.contractTypeId, database);
        contractType.contractTypePrints = await getContractTypePrints(contractType.contractTypeId, database);
    }
    database.release();
    return contractTypes;
}
