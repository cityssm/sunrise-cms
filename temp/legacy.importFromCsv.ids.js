// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-await-expression-member */
import sqlite from 'better-sqlite3';
import { sunriseDB as databasePath } from '../data/databasePaths.js';
import * as cacheFunctions from '../helpers/functions.cache.js';
/*
 * Fee IDs
 */
const feeCache = new Map();
export function getFeeIdByFeeDescription(feeDescription) {
    if (feeCache.keys.length === 0) {
        const database = sqlite(databasePath, {
            readonly: true
        });
        const records = database
            .prepare("select feeId, feeDescription from Fees where feeDescription like 'CMPP_FEE_%'")
            .all();
        for (const record of records) {
            feeCache.set(record.feeDescription, record.feeId);
        }
        database.close();
    }
    return feeCache.get(feeDescription);
}
/*
 * Lot Occupant Type IDs
 */
export const preneedOwnerLotOccupantTypeId = (await cacheFunctions.getBurialSiteOccupantTypeByLotOccupantType('Preneed Owner'))
    .lotOccupantTypeId;
export const funeralDirectorLotOccupantTypeId = (await cacheFunctions.getBurialSiteOccupantTypeByLotOccupantType('Funeral Director')).lotOccupantTypeId;
export const deceasedLotOccupantTypeId = (await cacheFunctions.getBurialSiteOccupantTypeByLotOccupantType('Deceased'))
    .lotOccupantTypeId;
export const purchaserLotOccupantTypeId = (await cacheFunctions.getBurialSiteOccupantTypeByLotOccupantType('Purchaser'))
    .lotOccupantTypeId;
/*
 * Lot Status IDs
 */
export const availableburialSiteStatusId = (await cacheFunctions.getBurialSiteStatusByLotStatus('Available')).burialSiteStatusId;
export const reservedburialSiteStatusId = (await cacheFunctions.getBurialSiteStatusByLotStatus('Reserved')).burialSiteStatusId;
export const takenburialSiteStatusId = (await cacheFunctions.getBurialSiteStatusByLotStatus('Taken')).burialSiteStatusId;
/*
 * Lot Type IDs
 */
const casketburialSiteTypeId = (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Casket Grave')).burialSiteTypeId;
const columbariumburialSiteTypeId = (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Columbarium')).burialSiteTypeId;
const crematoriumburialSiteTypeId = (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Crematorium')).burialSiteTypeId;
const mausoleumburialSiteTypeId = (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Mausoleum')).burialSiteTypeId;
const nicheWallburialSiteTypeId = (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Niche Wall')).burialSiteTypeId;
const urnGardenburialSiteTypeId = (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Urn Garden')).burialSiteTypeId;
export function getburialSiteTypeId(dataRow) {
    switch (dataRow.cemetery) {
        case '00': {
            return crematoriumburialSiteTypeId;
        }
        case 'GC':
        case 'HC': {
            return columbariumburialSiteTypeId;
        }
        case 'MA': {
            return mausoleumburialSiteTypeId;
        }
        case 'MN':
        case 'NW': {
            return nicheWallburialSiteTypeId;
        }
        case 'UG': {
            return urnGardenburialSiteTypeId;
        }
    }
    return casketburialSiteTypeId;
}
/*
 * Occupancy Type IDs
 */
export const preneedContractType = (await cacheFunctions.getContractTypeByContractType('Preneed'));
export const deceasedContractType = (await cacheFunctions.getContractTypeByContractType('Interment'));
export const cremationContractType = (await cacheFunctions.getContractTypeByContractType('Cremation'));
/*
 * Work Order Milestone Type IDs
 */
export const acknowledgedWorkOrderMilestoneTypeId = (await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Acknowledged'))?.workOrderMilestoneTypeId;
export const deathWorkOrderMilestoneTypeId = (await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Death'))?.workOrderMilestoneTypeId;
export const funeralWorkOrderMilestoneTypeId = (await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Funeral'))?.workOrderMilestoneTypeId;
export const cremationWorkOrderMilestoneTypeId = (await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Cremation'))?.workOrderMilestoneTypeId;
export const intermentWorkOrderMilestoneTypeId = (await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Interment'))?.workOrderMilestoneTypeId;
/*
 * Work Order Type IDs
 */
export const workOrderTypeId = 1;
