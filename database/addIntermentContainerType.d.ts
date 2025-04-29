export interface AddIntermentContainerTypeForm {
    intermentContainerType: string;
    intermentContainerTypeKey?: string;
    isCremationType?: '0' | '1';
    orderNumber?: number | string;
}
export default function addIntermentContainerType(addForm: AddIntermentContainerTypeForm, user: User): number;
