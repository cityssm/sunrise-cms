import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { getFindAGraveMemorialSearchUrl, getFindAGraveMemorialUrl } from '../helpers/findagrave.helpers.js';
import { partialDateIntegerToString } from '../helpers/partialDate.helpers.js';
export default function getContractInterments(contractId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const interments = database
        .function('userFn_partialDateIntegerToString', partialDateIntegerToString)
        .function('userFn_getFindAGraveMemorialUrl', getFindAGraveMemorialUrl)
        .function('userFn_getFindAGraveMemorialSearchUrl', getFindAGraveMemorialSearchUrl)
        .prepare(`
      SELECT
        ci.contractId,
        ci.intermentNumber,
        ci.deceasedName,
        ci.deceasedAddress1,
        ci.deceasedAddress2,
        ci.deceasedCity,
        ci.deceasedProvince,
        ci.deceasedPostalCode,
        ci.birthDate,
        userFn_partialDateIntegerToString (ci.birthDate) AS birthDateString,
        ci.birthPlace,
        ci.deathDate,
        userFn_partialDateIntegerToString (ci.deathDate) AS deathDateString,
        ci.deathPlace,
        ci.deathAge,
        ci.deathAgePeriod,
        ci.intermentContainerTypeId,
        t.intermentContainerType,
        t.isCremationType,
        ci.intermentDepthId,
        d.intermentDepth,
        ci.findagraveMemorialId,
        userFn_getFindAGraveMemorialUrl (ci.findagraveMemorialId) AS findagraveMemorialUrl,
        userFn_getFindAGraveMemorialSearchUrl (
          cem.findagraveCemeteryId,
          ci.deceasedName,
          ci.birthDate,
          ci.deathDate
        ) AS findagraveMemorialSearchUrl
      FROM
        ContractInterments ci
        LEFT JOIN IntermentContainerTypes t ON ci.intermentContainerTypeId = t.intermentContainerTypeId
        LEFT JOIN IntermentDepths d ON ci.intermentDepthId = d.intermentDepthId
        LEFT JOIN Contracts c ON ci.contractId = c.contractId
        LEFT JOIN BurialSites b ON c.burialSiteId = b.burialSiteId
        LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
      WHERE
        ci.recordDelete_timeMillis IS NULL
        AND ci.contractId = ?
      ORDER BY
        t.orderNumber,
        ci.deceasedName,
        ci.intermentNumber
    `)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return interments;
}
