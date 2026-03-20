import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getBurialSiteFields(burialSiteId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const burialSiteFields = database
        .prepare(/* sql */ `
      SELECT
        l.burialSiteId,
        l.burialSiteTypeFieldId,
        l.fieldValue,
        f.burialSiteTypeField,
        f.fieldType,
        f.fieldValues,
        f.isRequired,
        f.pattern,
        f.minLength,
        f.maxLength,
        f.orderNumber,
        t.orderNumber AS burialSiteTypeOrderNumber
      FROM
        BurialSiteFields l
        LEFT JOIN BurialSiteTypeFields f ON l.burialSiteTypeFieldId = f.burialSiteTypeFieldId
        LEFT JOIN BurialSiteTypes t ON f.burialSiteTypeId = t.burialSiteTypeId
      WHERE
        l.recordDelete_timeMillis IS NULL
        AND l.burialSiteId = ?
      UNION
      SELECT
        ? AS burialSiteId,
        f.burialSiteTypeFieldId,
        '' AS fieldValue,
        f.burialSiteTypeField,
        f.fieldType,
        f.fieldValues,
        f.isRequired,
        f.pattern,
        f.minLength,
        f.maxLength,
        f.orderNumber,
        t.orderNumber AS burialSiteTypeOrderNumber
      FROM
        BurialSiteTypeFields f
        LEFT JOIN BurialSiteTypes t ON f.burialSiteTypeId = t.burialSiteTypeId
      WHERE
        f.recordDelete_timeMillis IS NULL
        AND (
          f.burialSiteTypeId IS NULL
          OR f.burialSiteTypeId IN (
            SELECT
              burialSiteTypeId
            FROM
              BurialSites
            WHERE
              burialSiteId = ?
          )
        )
        AND f.burialSiteTypeFieldId NOT IN (
          SELECT
            burialSiteTypeFieldId
          FROM
            BurialSiteFields
          WHERE
            burialSiteId = ?
            AND recordDelete_timeMillis IS NULL
        )
      ORDER BY
        burialSiteTypeOrderNumber,
        f.orderNumber,
        f.burialSiteTypeField
    `)
        .all(burialSiteId, burialSiteId, burialSiteId, burialSiteId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return burialSiteFields;
}
