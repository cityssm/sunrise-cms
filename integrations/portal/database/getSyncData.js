import sqlite from 'better-sqlite3';
import { sunriseDB } from '../../../helpers/database.helpers.js';
export default function getSyncData() {
    const database = sqlite(sunriseDB, { readonly: true });
    const burialSiteTypes = database
        .prepare(`
      SELECT
        burialSiteTypeId,
        burialSiteType
      FROM
        BurialSiteTypes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        burialSiteType
    `)
        .all();
    const cemeteries = database
        .prepare(`
      SELECT
        cemeteryId,
        cemeteryKey,
        cemeteryName,
        cemeteryAddress1,
        cemeteryAddress2,
        cemeteryCity,
        cemeteryPostalCode,
        cemeteryProvince
      FROM
        Cemeteries
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        cemeteryName
    `)
        .all();
    const committalTypes = database
        .prepare(`
      SELECT
        committalTypeId,
        committalType
      FROM
        CommittalTypes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        committalType
    `)
        .all();
    const contractTypes = database
        .prepare(`
      SELECT
        contractTypeId,
        contractType
      FROM
        ContractTypes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        contractType
    `)
        .all();
    const funeralHomes = database
        .prepare(`
      SELECT
        funeralHomeId,
        funeralHomeName,
        funeralHomeAddress1,
        funeralHomeAddress2,
        funeralHomeCity,
        funeralHomePostalCode,
        funeralHomeProvince
      FROM
        FuneralHomes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        funeralHomeName
    `)
        .all();
    const intermentContainerTypes = database
        .prepare(`
      SELECT
        intermentContainerTypeId,
        intermentContainerType
      FROM
        IntermentContainerTypes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        intermentContainerType
    `)
        .all();
    const intermentDepths = database
        .prepare(`
      SELECT
        intermentDepthId,
        intermentDepth
      FROM
        IntermentDepths
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        intermentDepth
    `)
        .all();
    const serviceTypes = database
        .prepare(`
      SELECT
        serviceTypeId,
        serviceType
      FROM
        ServiceTypes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        serviceType
    `)
        .all();
    database.close();
    return {
        burialSiteTypes,
        cemeteries,
        committalTypes,
        contractTypes,
        funeralHomes,
        intermentContainerTypes,
        intermentDepths,
        serviceTypes
    };
}
