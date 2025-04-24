import { type DateString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface AddForm {
    contractId: number | string;
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
    deathAge: number | string;
    deathAgePeriod: string;
    intermentContainerTypeId: number | string;
}
export default function addContractInterment(contractForm: AddForm, user: User, connectedDatabase?: sqlite.Database): number;
