import { dateToInteger, dateToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getBurialSite from '../../database/getBurialSite.js';
import getBurialSiteDirectionsOfArrival, { defaultDirectionsOfArrival } from '../../database/getBurialSiteDirectionsOfArrival.js';
import getCemeteries from '../../database/getCemeteries.js';
import getFuneralHomes from '../../database/getFuneralHomes.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js';
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js';
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:new`);
export default async function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const startDate = new Date();
        const contract = {
            isPreneed: false,
            contractStartDate: dateToInteger(startDate),
            contractStartDateString: dateToString(startDate),
            purchaserCity: getCachedSettingValue('defaults.city'),
            purchaserProvince: getCachedSettingValue('defaults.province')
        };
        if (request.query.burialSiteId !== undefined) {
            const burialSite = await getBurialSite(request.query.burialSiteId, false, database);
            if (burialSite !== undefined) {
                contract.burialSiteId = burialSite.burialSiteId;
                contract.burialSiteName = burialSite.burialSiteName;
                contract.cemeteryId = burialSite.cemeteryId ?? undefined;
                contract.cemeteryName = burialSite.cemeteryName ?? '';
            }
        }
        /*
         * Contract Drop Lists
         */
        const contractTypes = getCachedContractTypes();
        const funeralHomes = getFuneralHomes(database);
        const committalTypes = getCachedCommittalTypes();
        const intermentContainerTypes = getCachedIntermentContainerTypes();
        /*
         * Burial Site Drop Lists
         */
        const burialSiteStatuses = getCachedBurialSiteStatuses();
        const burialSiteTypes = getCachedBurialSiteTypes();
        const cemeteries = getCemeteries({}, database);
        const burialSiteDirectionsOfArrival = contract.burialSiteId === undefined || contract.burialSiteId === null
            ? defaultDirectionsOfArrival
            : getBurialSiteDirectionsOfArrival(contract.burialSiteId, database);
        response.render('contracts/edit', {
            headTitle: 'Create a New Contract',
            contract,
            committalTypes,
            contractTypes,
            funeralHomes,
            intermentContainerTypes,
            burialSiteStatuses,
            burialSiteTypes,
            cemeteries,
            burialSiteDirectionsOfArrival,
            funeralDirectorNames: [],
            isCreate: true
        });
    }
    catch (error) {
        debug(error);
        response
            .status(500)
            .json({ errorMessage: 'Database error', success: false });
    }
    finally {
        database?.close();
    }
}
