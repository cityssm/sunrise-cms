import addContractTypePrint from '../../database/addContractTypePrint.js';
import { getCachedContractTypeByContractType } from '../../helpers/cache/contractTypes.cache.js';
export function initializeContractTypePrints(user) {
    const preneedContractTypeId = getCachedContractTypeByContractType('Preneed')?.contractTypeId;
    if (preneedContractTypeId !== undefined) {
        addContractTypePrint({
            contractTypeId: preneedContractTypeId,
            printEJS: 'pdf/ssm.contract'
        }, user);
    }
    const atNeedContractTypeId = getCachedContractTypeByContractType('At Need')?.contractTypeId;
    if (atNeedContractTypeId !== undefined) {
        addContractTypePrint({
            contractTypeId: atNeedContractTypeId,
            printEJS: 'pdf/ssm.contract'
        }, user);
        addContractTypePrint({
            contractTypeId: atNeedContractTypeId,
            printEJS: 'pdf/ssm.contract.burialPermit'
        }, user);
    }
    const permitOnlyContractTypeId = getCachedContractTypeByContractType('Permit Only')?.contractTypeId;
    if (permitOnlyContractTypeId !== undefined) {
        addContractTypePrint({
            contractTypeId: permitOnlyContractTypeId,
            printEJS: 'pdf/ssm.contract.burialPermit'
        }, user);
    }
}
