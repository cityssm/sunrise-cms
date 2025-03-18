import { type DateString } from '@cityssm/utils-datetime';
import type { PoolConnection } from 'better-sqlite-pool';
export interface AddForm {
    contractId: string | number;
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
    deathAge: string | number;
    deathAgePeriod: string;
    intermentContainerTypeId: string | number;
}
export default function addContractInterment(contractForm: AddForm, user: User, connectedDatabase?: PoolConnection): Promise<number>;
