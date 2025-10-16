import sqlite from 'better-sqlite3';
import { type BurialSiteFieldsForm } from './addOrUpdateBurialSiteFields.js';
export interface AddBurialSiteForm extends BurialSiteFieldsForm {
    burialSiteNameSegment1?: string;
    burialSiteNameSegment2?: string;
    burialSiteNameSegment3?: string;
    burialSiteNameSegment4?: string;
    burialSiteNameSegment5?: string;
    burialSiteStatusId: number | string;
    burialSiteTypeId: number | string;
    bodyCapacity?: number | string;
    crematedCapacity?: number | string;
    burialSiteImage?: string;
    cemeteryId: number | string;
    cemeterySvgId?: string;
    burialSiteLatitude?: string;
    burialSiteLongitude?: string;
}
/**
 * Creates a new burial site.
 * @param burialSiteForm - The new burial site's information
 * @param user - The user making the request
 * @param connectedDatabase - An optional database connection
 * @returns The new burial site's id.
 * @throws If an active burial site with the same name already exists.
 */
export default function addBurialSite(burialSiteForm: AddBurialSiteForm, user: User, connectedDatabase?: sqlite.Database): {
    burialSiteId: number;
    burialSiteName: string;
};
