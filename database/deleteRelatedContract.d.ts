export interface DeleteRelatedContractForm {
    contractId: number | string;
    relatedContractId: number | string;
}
export default function deleteRelatedContract(relatedContractForm: DeleteRelatedContractForm): boolean;
