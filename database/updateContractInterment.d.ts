import { type DateString } from '@cityssm/utils-datetime';
export interface UpdateForm {
    contractId: string | number;
    intermentNumber: string | number;
    deceasedName: string;
    deceasedAddress1: string;
    deceasedAddress2: string;
    deceasedCity: string;
    deceasedProvince: string;
    deceasedPostalCode: string;
    birthDateString: DateString | '';
    birthPlace: string;
    deathDateString: DateString | '';
    deathPlace: string;
    intermentContainerTypeId: string | number;
}
export default function updateContractInterment(contractForm: UpdateForm, user: User): Promise<boolean>;
