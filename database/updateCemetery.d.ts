import { directionsOfArrival } from '../data/dataLists.js';
export type UpdateCemeteryForm = Partial<Record<`directionOfArrival_${(typeof directionsOfArrival)[number]}`, (typeof directionsOfArrival)[number]>> & Partial<Record<`directionOfArrivalDescription_${(typeof directionsOfArrival)[number]}`, string>> & {
    cemeteryId: string;
    cemeteryDescription: string;
    cemeteryKey: string;
    cemeteryName: string;
    parentCemeteryId: string;
    cemeteryAddress1: string;
    cemeteryAddress2: string;
    cemeteryCity: string;
    cemeteryPostalCode: string;
    cemeteryProvince: string;
    cemeteryPhoneNumber: string;
    cemeteryLatitude: string;
    cemeteryLongitude: string;
    cemeterySvg: string;
};
/**
 * Updates a cemetery in the database.
 * Be sure to rebuild burial site names after updating a cemetery.
 * @param updateForm - The form data from the update cemetery form.
 * @param user - The user who is updating the cemetery.
 * @returns `true` if the cemetery was updated successfully, `false` otherwise.
 */
export default function updateCemetery(updateForm: UpdateCemeteryForm, user: User): boolean;
