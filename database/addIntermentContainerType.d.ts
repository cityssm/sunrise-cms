export interface AddForm {
    intermentContainerType: string;
    isCremationType?: string;
    orderNumber?: number;
}
export default function addIntermentContainerType(addForm: AddForm, user: User): Promise<number>;
