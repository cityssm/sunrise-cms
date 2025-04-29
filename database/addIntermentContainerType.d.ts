export interface AddForm {
    intermentContainerType: string;
    intermentContainerTypeKey?: string;
    isCremationType: '0' | '1';
    orderNumber?: number | string;
}
export default function addIntermentContainerType(addForm: AddForm, user: User): number;
