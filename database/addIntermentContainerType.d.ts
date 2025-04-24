export interface AddForm {
    intermentContainerType: string;
    intermentContainerTypeKey?: string;
    isCremationType?: string;
    orderNumber?: number;
}
export default function addIntermentContainerType(addForm: AddForm, user: User): number;
