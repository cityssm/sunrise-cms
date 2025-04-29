export interface AddForm {
    committalType: string;
    committalTypeKey?: string;
    orderNumber?: number | string;
}
export default function addCommittalType(addForm: AddForm, user: User): number;
