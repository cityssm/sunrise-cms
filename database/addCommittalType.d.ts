export interface AddForm {
    committalType: string;
    committalTypeKey?: string;
    orderNumber?: number;
}
export default function addCommittalType(addForm: AddForm, user: User): Promise<number>;
