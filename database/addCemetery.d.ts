import sqlite from 'better-sqlite3';
import { type UpdateCemeteryDirectionsOfArrivalForm } from './updateCemeteryDirectionsOfArrival.js';
export type AddCemeteryForm = UpdateCemeteryDirectionsOfArrivalForm & {
    cemeteryDescription: string;
    cemeteryKey: string;
    cemeteryName: string;
    parentCemeteryId: string;
    cemeteryLatitude: string;
    cemeteryLongitude: string;
    cemeterySvg: string;
    cemeteryAddress1: string;
    cemeteryAddress2: string;
    cemeteryCity: string;
    cemeteryPostalCode: string;
    cemeteryProvince: string;
    cemeteryPhoneNumber: string;
};
export default function addCemetery(addForm: AddCemeteryForm, user: User, connectedDatabase?: sqlite.Database): number;
