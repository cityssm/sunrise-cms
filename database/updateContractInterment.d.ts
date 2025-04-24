import { type DateString } from '@cityssm/utils-datetime';
export interface UpdateForm {
    contractId: number | string;
    intermentNumber: number | string;
    deceasedName: string;
    deceasedAddress1: string;
    deceasedAddress2: string;
    deceasedCity: string;
    deceasedPostalCode: string;
    deceasedProvince: string;
    birthDateString: '' | DateString;
    birthPlace: string;
    deathDateString: '' | DateString;
    deathPlace: string;
    deathAge: string;
    deathAgePeriod: string;
    intermentContainerTypeId: number | string;
}
export default function updateContractInterment(contractForm: UpdateForm, user: User): boolean;
