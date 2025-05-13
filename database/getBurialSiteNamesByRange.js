// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-magic-numbers */
import fillBlockRange, { calculateCartesianProductLength } from '@cityssm/fill-block-range';
import sqlite from 'better-sqlite3';
import cartesianProduct from 'just-cartesian-product';
import { buildBurialSiteName } from '../helpers/burialSites.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import getCemetery from './getCemetery.js';
const segmentCount = 5;
export const burialSiteNameRangeLimit = 1000;
export default function getBurialSiteNamesByRange(rangeForm) {
    const segmentRanges = [];
    try {
        for (let segmentIndex = 1; segmentIndex <= segmentCount; segmentIndex++) {
            segmentRanges.push(['']);
            const segmentFrom = rangeForm[`burialSiteNameSegment${segmentIndex}_from`];
            let segmentTo = rangeForm[`burialSiteNameSegment${segmentIndex}_to`];
            if (segmentFrom === undefined || segmentTo === undefined) {
                continue;
            }
            if (segmentTo === '') {
                segmentTo = segmentFrom;
            }
            const blockRange = fillBlockRange(segmentFrom, segmentTo, {
                limit: burialSiteNameRangeLimit
            });
            if (blockRange.length > 0) {
                segmentRanges[segmentIndex - 1] = blockRange;
            }
        }
    }
    catch {
        return [];
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (calculateCartesianProductLength(segmentRanges) > burialSiteNameRangeLimit) {
        return [];
    }
    const burialSiteNameSegments = cartesianProduct(segmentRanges);
    const results = [];
    const database = sqlite(sunriseDB);
    const cemetery = rangeForm.cemeteryId === ''
        ? undefined
        : getCemetery(rangeForm.cemeteryId, database);
    for (const burialSiteNameSegmentsArray of burialSiteNameSegments) {
        const burialSiteName = buildBurialSiteName(cemetery?.cemeteryKey, {
            burialSiteNameSegment1: burialSiteNameSegmentsArray[0],
            burialSiteNameSegment2: burialSiteNameSegmentsArray[1],
            burialSiteNameSegment3: burialSiteNameSegmentsArray[2],
            burialSiteNameSegment4: burialSiteNameSegmentsArray[3],
            burialSiteNameSegment5: burialSiteNameSegmentsArray[4]
        });
        const burialSiteId = database
            .prepare(`select burialSiteId
          from BurialSites
          where burialSiteName = ?
          and recordDelete_timeMillis is null`)
            .pluck()
            .get(burialSiteName);
        results.push({
            burialSiteId,
            burialSiteName,
            burialSiteNameSegment1: burialSiteNameSegmentsArray[0],
            burialSiteNameSegment2: burialSiteNameSegmentsArray[1],
            burialSiteNameSegment3: burialSiteNameSegmentsArray[2],
            burialSiteNameSegment4: burialSiteNameSegmentsArray[3],
            burialSiteNameSegment5: burialSiteNameSegmentsArray[4]
        });
    }
    database.close();
    return results;
}
