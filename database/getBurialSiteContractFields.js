import { acquireConnection } from './pool.js';
export default async function getBurialSiteContractField(burialSiteContractId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const fields = database
        .prepare(`select o.burialSiteContractId, o.contractTypeFieldId,
        o.fieldValue, f.contractTypeField, f.fieldType, f.fieldValues,
        f.isRequired, f.pattern, f.minimumLength, f.maximumLength,
        f.orderNumber, t.orderNumber as contractTypeOrderNumber
        from BurialSiteContractFields o
        left join ContractTypeFields f on o.contractTypeFieldId = f.contractTypeFieldId
        left join ContractTypes t on f.contractTypeId = t.contractTypeId
        where o.recordDelete_timeMillis is null
        and o.burialSiteContractId = ?
        
        union
        
        select ? as burialSiteContractId, f.contractTypeFieldId,
        '' as fieldValue, f.contractTypeField, f.fieldType, f.fieldValues,
        f.isRequired, f.pattern, f.minimumLength, f.maximumLength,
        f.orderNumber, t.orderNumber as contractTypeOrderNumber
        from ContractTypeFields f
        left join ContractTypes t on f.contractTypeId = t.contractTypeId
        where f.recordDelete_timeMillis is null and (
          f.contractTypeId is null
          or f.contractTypeId in (select contractTypeId from BurialSiteContracts where burialSiteContractId = ?))
        and f.contractTypeFieldId not in (select contractTypeFieldId from BurialSiteContractFields where burialSiteContractId = ? and recordDelete_timeMillis is null)
        order by contractTypeOrderNumber, f.orderNumber, f.contractTypeField`)
        .all(burialSiteContractId, burialSiteContractId, burialSiteContractId, burialSiteContractId);
    if (connectedDatabase === undefined) {
        database.release();
    }
    return fields;
}
