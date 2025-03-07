/* eslint-disable max-lines */
import fs from 'node:fs';
import { dateIntegerToString, dateToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import papa from 'papaparse';
import { sunriseDB as databasePath } from '../helpers/database.helpers.js';
import addBurialSite from '../database/addBurialSite.js';
import addContract from '../database/addContract.js';
import addContractComment from '../database/addContractComment.js';
import addContractFee from '../database/addContractFee.js';
import addContractOccupant from '../database/addContractOccupant.js';
import addContractTransaction from '../database/addContractTransaction.js';
import addCemetery from '../database/addCemetery.js';
import addOrUpdateContractField from '../database/addOrUpdateContractField.js';
import addWorkOrder from '../database/addWorkOrder.js';
import addWorkOrderBurialSite from '../database/addWorkOrderBurialSite.js';
import addWorkOrderContract from '../database/addWorkOrderContract.js';
import addWorkOrderMilestone from '../database/addWorkOrderMilestone.js';
import closeWorkOrder from '../database/closeWorkOrder.js';
import getBurialSite from '../database/getBurialSite.js';
import getContracts from '../database/getContracts.js';
import getCemeteryFromDatabase from '../database/getCemetery.js';
import getWorkOrder, { getWorkOrderByWorkOrderNumber } from '../database/getWorkOrder.js';
import reopenWorkOrder from '../database/reopenWorkOrder.js';
import { updateBurialSiteStatus } from '../database/updateBurialSite.js';
import * as importData from './legacy.importFromCsv.data.js';
import * as importIds from './legacy.importFromCsv.ids.js';
const user = {
    userName: 'import.unix',
    userProperties: {
        canUpdate: true,
        isAdmin: false,
        apiKey: ''
    }
};
function purgeTables() {
    console.time('purgeTables');
    const tablesToPurge = [
        'WorkOrderMilestones',
        'WorkOrderComments',
        'WorkOrderBurialSites',
        'WorkOrderContracts',
        'WorkOrders',
        'ContractTransactions',
        'ContractFees',
        'ContractFields',
        'ContractComments',
        'ContractInterments',
        'Contracts',
        'BurialSiteFields',
        'BurialSiteComments',
        'BurialSites'
    ];
    const database = sqlite(databasePath);
    for (const tableName of tablesToPurge) {
        database.prepare(`delete from ${tableName}`).run();
        database
            .prepare('delete from sqlite_sequence where name = ?')
            .run(tableName);
    }
    database.close();
    console.timeEnd('purgeTables');
}
function purgeConfigTables() {
    console.time('purgeConfigTables');
    const database = sqlite(databasePath);
    database.prepare('delete from Cemeteries').run();
    database.prepare("delete from sqlite_sequence where name in ('Cemeteries')").run();
    database.close();
    console.timeEnd('purgeConfigTables');
}
function getCemeteryByDescription(cemeteryDescription) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const cemetery = database
        .prepare('select * from Cemeteries where cemeteryDescription = ?')
        .get(cemeteryDescription);
    database.close();
    return cemetery;
}
function formatDateString(year, month, day) {
    const formattedYear = `0000${year}`.slice(-4);
    const formattedMonth = `00${month}`.slice(-2);
    const formattedDay = `00${day}`.slice(-2);
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
}
function formatTimeString(hour, minute) {
    const formattedHour = `00${hour}`.slice(-2);
    const formattedMinute = `00${minute}`.slice(-2);
    return `${formattedHour}:${formattedMinute}`;
}
const cemeteryToCemeteryName = {
    '00': 'Crematorium',
    GC: 'New Greenwood - Columbarium',
    HC: 'Holy Sepulchre - Columbarium',
    HS: 'Holy Sepulchre',
    MA: 'Holy Sepulchre - Mausoleum',
    NG: 'New Greenwood',
    NW: 'Niche Wall',
    OG: 'Old Greenwood',
    PG: 'Pine Grove',
    UG: 'New Greenwood - Urn Garden',
    WK: 'West Korah'
};
const cemeteryCache = new Map();
async function getCemetery(dataRow) {
    const mapCacheKey = dataRow.cemetery;
    /*
      if (masterRow.CM_CEMETERY === "HS" &&
          (masterRow.CM_BLOCK === "F" || masterRow.CM_BLOCK === "G" || masterRow.CM_BLOCK === "H" || masterRow.CM_BLOCK === "J")) {
          mapCacheKey += "-" + masterRow.CM_BLOCK;
      }
      */
    if (cemeteryCache.has(mapCacheKey)) {
        return cemeteryCache.get(mapCacheKey);
    }
    let cemetery = getCemeteryByDescription(mapCacheKey);
    if (cemetery === undefined) {
        console.log(`Creating cemetery: ${dataRow.cemetery}`);
        const cemeteryId = await addCemetery({
            cemeteryName: cemeteryToCemeteryName[dataRow.cemetery] ?? dataRow.cemetery,
            cemeteryDescription: dataRow.cemetery,
            cemeterySvg: '',
            cemeteryLatitude: '',
            cemeteryLongitude: '',
            cemeteryAddress1: '',
            cemeteryAddress2: '',
            cemeteryCity: 'Sault Ste. Marie',
            cemeteryProvince: 'ON',
            cemeteryPostalCode: '',
            cemeteryPhoneNumber: ''
        }, user);
        cemetery = (await getCemeteryFromDatabase(cemeteryId));
    }
    cemeteryCache.set(mapCacheKey, cemetery);
    return cemetery;
}
async function importFromMasterCSV() {
    console.time('importFromMasterCSV');
    let masterRow;
    const rawData = fs.readFileSync('./temp/CMMASTER.csv').toString();
    const cmmaster = papa.parse(rawData, {
        delimiter: ',',
        header: true,
        skipEmptyLines: true
    });
    for (const parseError of cmmaster.errors) {
        console.log(parseError);
    }
    try {
        for (masterRow of cmmaster.data) {
            const cemetery = await getCemetery({
                cemetery: masterRow.CM_CEMETERY
            });
            const burialSiteTypeId = importIds.getburialSiteTypeId({
                cemetery: masterRow.CM_CEMETERY
            });
            let burialSiteId;
            if (masterRow.CM_CEMETERY !== '00') {
                burialSiteId = await addBurialSite({
                    burialSiteName,
                    burialSiteTypeId,
                    burialSiteStatusId: importIds.availableBurialSiteStatusId,
                    cemeteryId: cemetery.cemeteryId,
                    cemeterySvgId: '',
                    burialSiteLatitude: '',
                    burialSiteLongitude: ''
                }, user);
            }
            let preneedcontractStartDateString;
            let preneedcontractId;
            if (masterRow.CM_PRENEED_OWNER !== '' || masterRow.CM_STATUS === 'P') {
                preneedcontractStartDateString = formatDateString(masterRow.CM_PURCHASE_YR, masterRow.CM_PURCHASE_MON, masterRow.CM_PURCHASE_DAY);
                let contractEndDateString = '';
                if (masterRow.CM_INTERMENT_YR !== '' &&
                    masterRow.CM_INTERMENT_YR !== '0') {
                    contractEndDateString = formatDateString(masterRow.CM_INTERMENT_YR, masterRow.CM_INTERMENT_MON, masterRow.CM_INTERMENT_DAY);
                }
                // if purchase date unavailable
                if (preneedcontractStartDateString === '0000-00-00' &&
                    contractEndDateString !== '') {
                    preneedcontractStartDateString = contractEndDateString;
                }
                // if end date unavailable
                if (preneedcontractStartDateString === '0000-00-00' &&
                    masterRow.CM_DEATH_YR !== '' &&
                    masterRow.CM_DEATH_YR !== '0') {
                    preneedcontractStartDateString = formatDateString(masterRow.CM_DEATH_YR, masterRow.CM_DEATH_MON, masterRow.CM_DEATH_DAY);
                    // if death took place, and there's no preneed end date
                    if (contractEndDateString === '0000-00-00' ||
                        contractEndDateString === '') {
                        contractEndDateString = preneedcontractStartDateString;
                    }
                }
                if (preneedcontractStartDateString === '' ||
                    preneedcontractStartDateString === '0000-00-00') {
                    preneedcontractStartDateString = '0001-01-01';
                }
                preneedcontractId = await addContract({
                    contractTypeId: importIds.preneedContractType.contractTypeId,
                    burialSiteId: burialSiteId ?? '',
                    contractStartDateString: preneedcontractStartDateString,
                    contractEndDateString,
                    contractTypeFieldIds: ''
                }, user);
                const occupantPostalCode = `${masterRow.CM_POST1} ${masterRow.CM_POST2}`.trim();
                await addContractOccupant({
                    contractId: preneedcontractId,
                    lotOccupantTypeId: importIds.preneedOwnerLotOccupantTypeId,
                    occupantName: masterRow.CM_PRENEED_OWNER,
                    occupantFamilyName: '',
                    occupantAddress1: masterRow.CM_ADDRESS,
                    occupantAddress2: '',
                    occupantCity: masterRow.CM_CITY,
                    occupantProvince: masterRow.CM_PROV,
                    occupantPostalCode,
                    occupantPhoneNumber: '',
                    occupantEmailAddress: ''
                }, user);
                if (masterRow.CM_REMARK1 !== '') {
                    await addContractComment({
                        contractId: preneedcontractId,
                        contractCommentDateString: preneedcontractStartDateString,
                        contractCommentTimeString: '00:00',
                        contractComment: masterRow.CM_REMARK1
                    }, user);
                }
                if (masterRow.CM_REMARK2 !== '') {
                    await addContractComment({
                        contractId: preneedcontractId,
                        contractCommentDateString: preneedcontractStartDateString,
                        contractCommentTimeString: '00:00',
                        contractComment: masterRow.CM_REMARK2
                    }, user);
                }
                if (masterRow.CM_WORK_ORDER.trim() !== '') {
                    await addContractComment({
                        contractId: preneedcontractId,
                        contractCommentDateString: preneedcontractStartDateString,
                        contractCommentTimeString: '00:00',
                        contractComment: `Imported Contract #${masterRow.CM_WORK_ORDER}`
                    }, user);
                }
                if (contractEndDateString === '') {
                    await updateBurialSiteStatus(burialSiteId ?? '', importIds.reservedburialSiteStatusId, user);
                }
            }
            let deceasedcontractStartDateString;
            let deceasedcontractId;
            if (masterRow.CM_DECEASED_NAME !== '') {
                deceasedcontractStartDateString = formatDateString(masterRow.CM_INTERMENT_YR, masterRow.CM_INTERMENT_MON, masterRow.CM_INTERMENT_DAY);
                // if interment date unavailable
                if (deceasedcontractStartDateString === '0000-00-00' &&
                    masterRow.CM_DEATH_YR !== '' &&
                    masterRow.CM_DEATH_YR !== '0') {
                    deceasedcontractStartDateString = formatDateString(masterRow.CM_DEATH_YR, masterRow.CM_DEATH_MON, masterRow.CM_DEATH_DAY);
                }
                if (deceasedcontractStartDateString === '' ||
                    deceasedcontractStartDateString === '0000-00-00') {
                    deceasedcontractStartDateString = '0001-01-01';
                }
                const deceasedcontractEndDateString = burialSiteId
                    ? ''
                    : deceasedcontractStartDateString;
                const contractType = burialSiteId
                    ? importIds.deceasedContractType
                    : importIds.cremationContractType;
                deceasedcontractId = await addContract({
                    contractTypeId: contractType.contractTypeId,
                    burialSiteId: burialSiteId ?? '',
                    contractStartDateString: deceasedcontractStartDateString,
                    contractEndDateString: deceasedcontractEndDateString,
                    contractTypeFieldIds: ''
                }, user);
                const deceasedPostalCode = `${masterRow.CM_POST1} ${masterRow.CM_POST2}`.trim();
                await addContractOccupant({
                    contractId: deceasedcontractId,
                    lotOccupantTypeId: importIds.deceasedLotOccupantTypeId,
                    occupantName: masterRow.CM_DECEASED_NAME,
                    occupantFamilyName: '',
                    occupantAddress1: masterRow.CM_ADDRESS,
                    occupantAddress2: '',
                    occupantCity: masterRow.CM_CITY,
                    occupantProvince: masterRow.CM_PROV,
                    occupantPostalCode: deceasedPostalCode,
                    occupantPhoneNumber: '',
                    occupantEmailAddress: ''
                }, user);
                if (masterRow.CM_DEATH_YR !== '') {
                    const contractFieldValue = formatDateString(masterRow.CM_DEATH_YR, masterRow.CM_DEATH_MON, masterRow.CM_DEATH_DAY);
                    await addOrUpdateContractField({
                        contractId: deceasedcontractId,
                        contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Death Date').contractTypeFieldId,
                        contractFieldValue
                    }, user);
                }
                if (masterRow.CM_AGE !== '') {
                    await addOrUpdateContractField({
                        contractId: deceasedcontractId,
                        contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Death Age').contractTypeFieldId,
                        contractFieldValue: masterRow.CM_AGE
                    }, user);
                }
                if (masterRow.CM_PERIOD !== '') {
                    const period = importData.getDeathAgePeriod(masterRow.CM_PERIOD);
                    await addOrUpdateContractField({
                        contractId: deceasedcontractId,
                        contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Death Age Period').contractTypeFieldId,
                        contractFieldValue: period
                    }, user);
                }
                if (masterRow.CM_FUNERAL_HOME !== '') {
                    const funeralHomeOccupant = importData.getFuneralHomeLotOccupancyOccupantData(masterRow.CM_FUNERAL_HOME);
                    await addContractOccupant({
                        contractId: deceasedcontractId,
                        lotOccupantTypeId: funeralHomeOccupant.lotOccupantTypeId ?? '',
                        occupantName: funeralHomeOccupant.occupantName ?? '',
                        occupantFamilyName: '',
                        occupantAddress1: funeralHomeOccupant.occupantAddress1 ?? '',
                        occupantAddress2: funeralHomeOccupant.occupantAddress2 ?? '',
                        occupantCity: funeralHomeOccupant.occupantCity ?? '',
                        occupantProvince: funeralHomeOccupant.occupantProvince ?? '',
                        occupantPostalCode: funeralHomeOccupant.occupantPostalCode ?? '',
                        occupantPhoneNumber: funeralHomeOccupant.occupantPhoneNumber ?? '',
                        occupantEmailAddress: funeralHomeOccupant.occupantEmailAddress ?? ''
                    }, user);
                    /*
                      addOrUpdateContractField(
                        {
                            contractId: deceasedcontractId,
                            contractTypeFieldId: allContractTypeFields.find(
                                (contractTypeField) => {
                                    return contractTypeField.contractTypeField === "Funeral Home";
                                }
                            ).contractTypeFieldId,
                            contractFieldValue: masterRow.CM_FUNERAL_HOME
                        },
                        user
                      );
                    */
                }
                if (masterRow.CM_FUNERAL_YR !== '') {
                    const contractFieldValue = formatDateString(masterRow.CM_FUNERAL_YR, masterRow.CM_FUNERAL_MON, masterRow.CM_FUNERAL_DAY);
                    await addOrUpdateContractField({
                        contractId: deceasedcontractId,
                        contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Funeral Date').contractTypeFieldId,
                        contractFieldValue
                    }, user);
                }
                if (contractType.contractType !== 'Cremation') {
                    if (masterRow.CM_CONTAINER_TYPE !== '') {
                        await addOrUpdateContractField({
                            contractId: deceasedcontractId,
                            contractTypeFieldId: contractType.contractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Container Type').contractTypeFieldId,
                            contractFieldValue: masterRow.CM_CONTAINER_TYPE
                        }, user);
                    }
                    if (masterRow.CM_COMMITTAL_TYPE !== '') {
                        let commitalType = masterRow.CM_COMMITTAL_TYPE;
                        if (commitalType === 'GS') {
                            commitalType = 'Graveside';
                        }
                        await addOrUpdateContractField({
                            contractId: deceasedcontractId,
                            contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Committal Type').contractTypeFieldId,
                            contractFieldValue: commitalType
                        }, user);
                    }
                }
                if (masterRow.CM_REMARK1 !== '') {
                    await addContractComment({
                        contractId: deceasedcontractId,
                        contractCommentDateString: deceasedcontractStartDateString,
                        contractCommentTimeString: '00:00',
                        contractComment: masterRow.CM_REMARK1
                    }, user);
                }
                if (masterRow.CM_REMARK2 !== '') {
                    await addContractComment({
                        contractId: deceasedcontractId,
                        contractCommentDateString: deceasedcontractStartDateString,
                        contractCommentTimeString: '00:00',
                        contractComment: masterRow.CM_REMARK2
                    }, user);
                }
                if (masterRow.CM_WORK_ORDER.trim() !== '') {
                    await addContractComment({
                        contractId: deceasedcontractId,
                        contractCommentDateString: deceasedcontractStartDateString,
                        contractCommentTimeString: '00:00',
                        contractComment: `Imported Contract #${masterRow.CM_WORK_ORDER}`
                    }, user);
                }
                await updateBurialSiteStatus(burialSiteId ?? '', importIds.takenburialSiteStatusId, user);
                if (masterRow.CM_PRENEED_OWNER !== '') {
                    await addContractOccupant({
                        contractId: deceasedcontractId,
                        lotOccupantTypeId: importIds.preneedOwnerLotOccupantTypeId,
                        occupantName: masterRow.CM_PRENEED_OWNER,
                        occupantFamilyName: '',
                        occupantAddress1: '',
                        occupantAddress2: '',
                        occupantCity: '',
                        occupantProvince: '',
                        occupantPostalCode: '',
                        occupantPhoneNumber: '',
                        occupantEmailAddress: ''
                    }, user);
                }
            }
        }
    }
    catch (error) {
        console.error(error);
        console.log(masterRow);
    }
    console.timeEnd('importFromMasterCSV');
}
async function importFromPrepaidCSV() {
    console.time('importFromPrepaidCSV');
    let prepaidRow;
    const rawData = fs.readFileSync('./temp/CMPRPAID.csv').toString();
    const cmprpaid = papa.parse(rawData, {
        delimiter: ',',
        header: true,
        skipEmptyLines: true
    });
    for (const parseError of cmprpaid.errors) {
        console.log(parseError);
    }
    try {
        for (prepaidRow of cmprpaid.data) {
            if (!prepaidRow.CMPP_PREPAID_FOR_NAME) {
                continue;
            }
            let cemetery = prepaidRow.CMPP_CEMETERY;
            if (cemetery === '.m') {
                cemetery = 'HC';
            }
            let lot;
            if (cemetery !== '') {
                const map = await getCemetery({
                    cemetery
                });
                const burialSiteName = importData.buildLotName({
                    cemetery,
                    block: prepaidRow.CMPP_BLOCK,
                    range1: prepaidRow.CMPP_RANGE1,
                    range2: prepaidRow.CMPP_RANGE2,
                    lot1: prepaidRow.CMPP_LOT1,
                    lot2: prepaidRow.CMPP_LOT2,
                    grave1: prepaidRow.CMPP_GRAVE1,
                    grave2: prepaidRow.CMPP_GRAVE2,
                    interment: prepaidRow.CMPP_INTERMENT
                });
                lot = await getBurialSiteByLotName(burialSiteName);
                if (!lot) {
                    const burialSiteTypeId = importIds.getburialSiteTypeId({
                        cemetery
                    });
                    const burialSiteId = await addBurialSite({
                        burialSiteName,
                        burialSiteTypeId,
                        burialSiteStatusId: importIds.reservedburialSiteStatusId,
                        cemeteryId: map.cemeteryId ?? '',
                        mapKey: burialSiteName.includes(',') ? burialSiteName.split(',')[0] : burialSiteName,
                        burialSiteLatitude: '',
                        burialSiteLongitude: ''
                    }, user);
                    lot = await getBurialSite(burialSiteId);
                }
            }
            if (lot &&
                lot.burialSiteStatusId === importIds.availableburialSiteStatusId) {
                await updateBurialSiteStatus(lot.burialSiteId, importIds.reservedburialSiteStatusId, user);
            }
            const contractStartDateString = formatDateString(prepaidRow.CMPP_PURCH_YR, prepaidRow.CMPP_PURCH_MON, prepaidRow.CMPP_PURCH_DAY);
            let contractId;
            if (lot) {
                const possibleLotOccupancies = await getContracts({
                    burialSiteId: lot.burialSiteId,
                    contractTypeId: importIds.preneedContractType.contractTypeId,
                    deceasedName: prepaidRow.CMPP_PREPAID_FOR_NAME,
                    contractStartDateString
                }, {
                    includeOccupants: false,
                    includeFees: false,
                    includeTransactions: false,
                    limit: -1,
                    offset: 0
                });
                if (possibleLotOccupancies.lotOccupancies.length > 0) {
                    contractId =
                        possibleLotOccupancies.lotOccupancies[0].contractId;
                }
            }
            contractId ||= await addContract({
                burialSiteId: lot ? lot.burialSiteId : '',
                contractTypeId: importIds.preneedContractType.contractTypeId,
                contractStartDateString,
                contractEndDateString: ''
            }, user);
            await addContractOccupant({
                contractId,
                lotOccupantTypeId: importIds.preneedOwnerLotOccupantTypeId,
                occupantName: prepaidRow.CMPP_PREPAID_FOR_NAME,
                occupantFamilyName: '',
                occupantAddress1: prepaidRow.CMPP_ADDRESS,
                occupantAddress2: '',
                occupantCity: prepaidRow.CMPP_CITY,
                occupantProvince: prepaidRow.CMPP_PROV.slice(0, 2),
                occupantPostalCode: `${prepaidRow.CMPP_POSTAL1} ${prepaidRow.CMPP_POSTAL2}`,
                occupantPhoneNumber: '',
                occupantEmailAddress: ''
            }, user);
            if (prepaidRow.CMPP_ARRANGED_BY_NAME) {
                await addContractOccupant({
                    contractId,
                    lotOccupantTypeId: importIds.purchaserLotOccupantTypeId,
                    occupantName: prepaidRow.CMPP_ARRANGED_BY_NAME,
                    occupantFamilyName: '',
                    occupantAddress1: '',
                    occupantAddress2: '',
                    occupantCity: '',
                    occupantProvince: '',
                    occupantPostalCode: '',
                    occupantPhoneNumber: '',
                    occupantEmailAddress: ''
                }, user);
            }
            if (prepaidRow.CMPP_FEE_GRAV_SD !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: importIds.getFeeIdByFeeDescription('CMPP_FEE_GRAV_SD'),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_GRAV_SD,
                    taxAmount: prepaidRow.CMPP_GST_GRAV_SD
                }, user);
            }
            if (prepaidRow.CMPP_FEE_GRAV_DD !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: importIds.getFeeIdByFeeDescription('CMPP_FEE_GRAV_DD'),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_GRAV_DD,
                    taxAmount: prepaidRow.CMPP_GST_GRAV_DD
                }, user);
            }
            if (prepaidRow.CMPP_FEE_CHAP_SD !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: importIds.getFeeIdByFeeDescription('CMPP_FEE_CHAP_SD'),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_CHAP_SD,
                    taxAmount: prepaidRow.CMPP_GST_CHAP_SD
                }, user);
            }
            if (prepaidRow.CMPP_FEE_CHAP_DD !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: importIds.getFeeIdByFeeDescription('CMPP_FEE_CHAP_DD'),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_CHAP_DD,
                    taxAmount: prepaidRow.CMPP_GST_CHAP_DD
                }, user);
            }
            if (prepaidRow.CMPP_FEE_ENTOMBMENT !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: importIds.getFeeIdByFeeDescription('CMPP_FEE_ENTOMBMENT'),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_ENTOMBMENT,
                    taxAmount: prepaidRow.CMPP_GST_ENTOMBMENT
                }, user);
            }
            if (prepaidRow.CMPP_FEE_CREM !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: importIds.getFeeIdByFeeDescription('CMPP_FEE_CREM'),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_CREM,
                    taxAmount: prepaidRow.CMPP_GST_CREM
                }, user);
            }
            if (prepaidRow.CMPP_FEE_NICHE !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: importIds.getFeeIdByFeeDescription('CMPP_FEE_NICHE'),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_NICHE,
                    taxAmount: prepaidRow.CMPP_GST_NICHE
                }, user);
            }
            if (prepaidRow.CMPP_FEE_DISINTERMENT !== '0.0' &&
                prepaidRow.CMPP_FEE_DISINTERMENT !== '20202.02') {
                await addContractFee({
                    contractId,
                    feeId: importIds.getFeeIdByFeeDescription('CMPP_FEE_DISINTERMENT'),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_DISINTERMENT,
                    taxAmount: prepaidRow.CMPP_GST_DISINTERMENT
                }, user);
            }
            const transactionAmount = Number.parseFloat(prepaidRow.CMPP_FEE_GRAV_SD) +
                Number.parseFloat(prepaidRow.CMPP_GST_GRAV_SD) +
                Number.parseFloat(prepaidRow.CMPP_FEE_GRAV_DD) +
                Number.parseFloat(prepaidRow.CMPP_GST_GRAV_DD) +
                Number.parseFloat(prepaidRow.CMPP_FEE_CHAP_SD) +
                Number.parseFloat(prepaidRow.CMPP_GST_CHAP_SD) +
                Number.parseFloat(prepaidRow.CMPP_FEE_CHAP_DD) +
                Number.parseFloat(prepaidRow.CMPP_GST_CHAP_DD) +
                Number.parseFloat(prepaidRow.CMPP_FEE_ENTOMBMENT) +
                Number.parseFloat(prepaidRow.CMPP_GST_ENTOMBMENT) +
                Number.parseFloat(prepaidRow.CMPP_FEE_CREM) +
                Number.parseFloat(prepaidRow.CMPP_GST_CREM) +
                Number.parseFloat(prepaidRow.CMPP_FEE_NICHE) +
                Number.parseFloat(prepaidRow.CMPP_GST_NICHE) +
                Number.parseFloat(prepaidRow.CMPP_FEE_DISINTERMENT === '20202.02'
                    ? '0'
                    : prepaidRow.CMPP_FEE_DISINTERMENT) +
                Number.parseFloat(prepaidRow.CMPP_GST_DISINTERMENT === '20202.02'
                    ? '0'
                    : prepaidRow.CMPP_GST_DISINTERMENT);
            await addContractTransaction({
                contractId,
                externalReceiptNumber: '',
                transactionAmount,
                transactionDateString: contractStartDateString,
                transactionNote: `Order Number: ${prepaidRow.CMPP_ORDER_NO}`
            }, user);
            if (prepaidRow.CMPP_REMARK1) {
                await addContractComment({
                    contractId,
                    contractCommentDateString: contractStartDateString,
                    contractComment: prepaidRow.CMPP_REMARK1
                }, user);
            }
            if (prepaidRow.CMPP_REMARK2) {
                await addContractComment({
                    contractId,
                    contractCommentDateString: contractStartDateString,
                    contractComment: prepaidRow.CMPP_REMARK2
                }, user);
            }
        }
    }
    catch (error) {
        console.error(error);
        console.log(prepaidRow);
    }
    console.timeEnd('importFromPrepaidCSV');
}
async function importFromWorkOrderCSV() {
    console.time('importFromWorkOrderCSV');
    let workOrderRow;
    const rawData = fs.readFileSync('./temp/CMWKORDR.csv').toString();
    const cmwkordr = papa.parse(rawData, {
        delimiter: ',',
        header: true,
        skipEmptyLines: true
    });
    for (const parseError of cmwkordr.errors) {
        console.log(parseError);
    }
    const currentDateString = dateToString(new Date());
    try {
        for (workOrderRow of cmwkordr.data) {
            const workOrderNumber = `000000${workOrderRow.WO_WORK_ORDER}`.slice(-6);
            let workOrder = await getWorkOrderByWorkOrderNumber(workOrderNumber);
            const workOrderOpenDateString = dateIntegerToString(Number.parseInt(workOrderRow.WO_INITIATION_DATE, 10));
            if (workOrder) {
                if (workOrder.workOrderCloseDate) {
                    await reopenWorkOrder(workOrder.workOrderId, user);
                    delete workOrder.workOrderCloseDate;
                    delete workOrder.workOrderCloseDateString;
                }
            }
            else {
                const workOrderId = await addWorkOrder({
                    workOrderNumber,
                    workOrderTypeId: importIds.workOrderTypeId,
                    workOrderDescription: `${workOrderRow.WO_REMARK1} ${workOrderRow.WO_REMARK2} ${workOrderRow.WO_REMARK3}`.trim(),
                    workOrderOpenDateString
                }, user);
                workOrder = await getWorkOrder(workOrderId, {
                    includeLotsAndLotOccupancies: true,
                    includeComments: true,
                    includeMilestones: true
                });
            }
            let lot;
            if (workOrderRow.WO_CEMETERY !== '00') {
                const burialSiteName = importData.buildLotName({
                    cemetery: workOrderRow.WO_CEMETERY,
                    block: workOrderRow.WO_BLOCK,
                    range1: workOrderRow.WO_RANGE1,
                    range2: workOrderRow.WO_RANGE2,
                    lot1: workOrderRow.WO_LOT1,
                    lot2: workOrderRow.WO_LOT2,
                    grave1: workOrderRow.WO_GRAVE1,
                    grave2: workOrderRow.WO_GRAVE2,
                    interment: workOrderRow.WO_INTERMENT
                });
                lot = await getBurialSiteByLotName(burialSiteName);
                if (lot) {
                    await updateBurialSiteStatus(lot.burialSiteId, importIds.takenburialSiteStatusId, user);
                }
                else {
                    const map = await getCemetery({ cemetery: workOrderRow.WO_CEMETERY });
                    const burialSiteTypeId = importIds.getburialSiteTypeId({
                        cemetery: workOrderRow.WO_CEMETERY
                    });
                    const burialSiteId = await addBurialSite({
                        cemeteryId: map.cemeteryId,
                        burialSiteName,
                        mapKey: burialSiteName.includes(',') ? burialSiteName.split(',')[0] : burialSiteName,
                        burialSiteStatusId: importIds.takenburialSiteStatusId,
                        burialSiteTypeId,
                        burialSiteLatitude: '',
                        burialSiteLongitude: ''
                    }, user);
                    lot = await getBurialSite(burialSiteId);
                }
                const workOrderContainsLot = workOrder.workOrderLots.find((possibleLot) => (possibleLot.burialSiteId = lot.burialSiteId));
                if (!workOrderContainsLot) {
                    await addWorkOrderBurialSite({
                        workOrderId: workOrder.workOrderId,
                        burialSiteId: lot.burialSiteId
                    }, user);
                    workOrder.workOrderLots.push(lot);
                }
            }
            let contractStartDateString = workOrderOpenDateString;
            if (workOrderRow.WO_INTERMENT_YR) {
                contractStartDateString = formatDateString(workOrderRow.WO_INTERMENT_YR, workOrderRow.WO_INTERMENT_MON, workOrderRow.WO_INTERMENT_DAY);
            }
            const contractType = lot
                ? importIds.deceasedContractType
                : importIds.cremationContractType;
            const contractId = await addContract({
                burialSiteId: lot ? lot.burialSiteId : '',
                contractTypeId: contractType.contractTypeId,
                contractStartDateString,
                contractEndDateString: ''
            }, user);
            await addContractOccupant({
                contractId,
                lotOccupantTypeId: importIds.deceasedLotOccupantTypeId,
                occupantName: workOrderRow.WO_DECEASED_NAME,
                occupantFamilyName: '',
                occupantAddress1: workOrderRow.WO_ADDRESS,
                occupantAddress2: '',
                occupantCity: workOrderRow.WO_CITY,
                occupantProvince: workOrderRow.WO_PROV.slice(0, 2),
                occupantPostalCode: `${workOrderRow.WO_POST1} ${workOrderRow.WO_POST2}`,
                occupantPhoneNumber: '',
                occupantEmailAddress: ''
            }, user);
            if (workOrderRow.WO_DEATH_YR !== '') {
                const contractFieldValue = formatDateString(workOrderRow.WO_DEATH_YR, workOrderRow.WO_DEATH_MON, workOrderRow.WO_DEATH_DAY);
                await addOrUpdateContractField({
                    contractId,
                    contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Death Date').contractTypeFieldId,
                    contractFieldValue
                }, user);
            }
            if (workOrderRow.WO_DEATH_PLACE !== '') {
                await addOrUpdateContractField({
                    contractId,
                    contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Death Place').contractTypeFieldId,
                    contractFieldValue: workOrderRow.WO_DEATH_PLACE
                }, user);
            }
            if (workOrderRow.WO_AGE !== '') {
                await addOrUpdateContractField({
                    contractId,
                    contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Death Age').contractTypeFieldId,
                    contractFieldValue: workOrderRow.WO_AGE
                }, user);
            }
            if (workOrderRow.WO_PERIOD !== '') {
                const period = importData.getDeathAgePeriod(workOrderRow.WO_PERIOD);
                await addOrUpdateContractField({
                    contractId,
                    contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Death Age Period').contractTypeFieldId,
                    contractFieldValue: period
                }, user);
            }
            if (workOrderRow.WO_FUNERAL_HOME !== '') {
                const funeralHomeOccupant = importData.getFuneralHomeLotOccupancyOccupantData(workOrderRow.WO_FUNERAL_HOME);
                await addContractOccupant({
                    contractId,
                    lotOccupantTypeId: funeralHomeOccupant.lotOccupantTypeId,
                    occupantName: funeralHomeOccupant.occupantName,
                    occupantFamilyName: '',
                    occupantAddress1: funeralHomeOccupant.occupantAddress1,
                    occupantAddress2: funeralHomeOccupant.occupantAddress2,
                    occupantCity: funeralHomeOccupant.occupantCity,
                    occupantProvince: funeralHomeOccupant.occupantProvince,
                    occupantPostalCode: funeralHomeOccupant.occupantPostalCode,
                    occupantPhoneNumber: funeralHomeOccupant.occupantPhoneNumber,
                    occupantEmailAddress: funeralHomeOccupant.occupantEmailAddress
                }, user);
                /*
                  addOrUpdateContractField(
                    {
                        contractId: contractId,
                        contractTypeFieldId: allContractTypeFields.find((contractTypeField) => {
                            return contractTypeField.contractTypeField === "Funeral Home";
                        }).contractTypeFieldId,
                        contractFieldValue: workOrderRow.WO_FUNERAL_HOME
                    },
                    user
                  );
                */
            }
            if (workOrderRow.WO_FUNERAL_YR !== '') {
                const contractFieldValue = formatDateString(workOrderRow.WO_FUNERAL_YR, workOrderRow.WO_FUNERAL_MON, workOrderRow.WO_FUNERAL_DAY);
                await addOrUpdateContractField({
                    contractId,
                    contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Funeral Date').contractTypeFieldId,
                    contractFieldValue
                }, user);
            }
            if (contractType.contractType !== 'Cremation') {
                if (workOrderRow.WO_CONTAINER_TYPE !== '') {
                    await addOrUpdateContractField({
                        contractId,
                        contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Container Type').contractTypeFieldId,
                        contractFieldValue: workOrderRow.WO_CONTAINER_TYPE
                    }, user);
                }
                if (workOrderRow.WO_COMMITTAL_TYPE !== '') {
                    let commitalType = workOrderRow.WO_COMMITTAL_TYPE;
                    if (commitalType === 'GS') {
                        commitalType = 'Graveside';
                    }
                    await addOrUpdateContractField({
                        contractId,
                        contractTypeFieldId: contractType.ContractTypeFields.find((contractTypeField) => contractTypeField.contractTypeField === 'Committal Type').contractTypeFieldId,
                        contractFieldValue: commitalType
                    }, user);
                }
            }
            await addWorkOrderContract({
                workOrderId: workOrder.workOrderId,
                contractId
            }, user);
            // Milestones
            let hasIncompleteMilestones = !workOrderRow.WO_CONFIRMATION_IN;
            let maxMilestoneCompletionDateString = workOrderOpenDateString;
            if (importIds.acknowledgedWorkOrderMilestoneTypeId) {
                await addWorkOrderMilestone({
                    workOrderId: workOrder.workOrderId,
                    workOrderMilestoneTypeId: importIds.acknowledgedWorkOrderMilestoneTypeId,
                    workOrderMilestoneDateString: workOrderOpenDateString,
                    workOrderMilestoneDescription: '',
                    workOrderMilestoneCompletionDateString: workOrderRow.WO_CONFIRMATION_IN
                        ? workOrderOpenDateString
                        : undefined,
                    workOrderMilestoneCompletionTimeString: workOrderRow.WO_CONFIRMATION_IN ? '00:00' : undefined
                }, user);
            }
            if (workOrderRow.WO_DEATH_YR) {
                const workOrderMilestoneDateString = formatDateString(workOrderRow.WO_DEATH_YR, workOrderRow.WO_DEATH_MON, workOrderRow.WO_DEATH_DAY);
                if (importIds.deathWorkOrderMilestoneTypeId) {
                    await addWorkOrderMilestone({
                        workOrderId: workOrder.workOrderId,
                        workOrderMilestoneTypeId: importIds.deathWorkOrderMilestoneTypeId,
                        workOrderMilestoneDateString,
                        workOrderMilestoneDescription: `Death Place: ${workOrderRow.WO_DEATH_PLACE}`,
                        workOrderMilestoneCompletionDateString: workOrderMilestoneDateString < currentDateString
                            ? workOrderMilestoneDateString
                            : undefined,
                        workOrderMilestoneCompletionTimeString: workOrderMilestoneDateString < currentDateString
                            ? '00:00'
                            : undefined
                    }, user);
                }
                if (workOrderMilestoneDateString > maxMilestoneCompletionDateString) {
                    maxMilestoneCompletionDateString = workOrderMilestoneDateString;
                }
                if (workOrderMilestoneDateString >= currentDateString) {
                    hasIncompleteMilestones = true;
                }
            }
            if (workOrderRow.WO_FUNERAL_YR) {
                const workOrderMilestoneDateString = formatDateString(workOrderRow.WO_FUNERAL_YR, workOrderRow.WO_FUNERAL_MON, workOrderRow.WO_FUNERAL_DAY);
                let funeralHour = Number.parseInt(workOrderRow.WO_FUNERAL_HR, 10);
                if (funeralHour <= 6) {
                    funeralHour += 12;
                }
                const workOrderMilestoneTimeString = formatTimeString(funeralHour.toString(), workOrderRow.WO_FUNERAL_MIN);
                if (importIds.funeralWorkOrderMilestoneTypeId) {
                    await addWorkOrderMilestone({
                        workOrderId: workOrder.workOrderId,
                        workOrderMilestoneTypeId: importIds.funeralWorkOrderMilestoneTypeId,
                        workOrderMilestoneDateString,
                        workOrderMilestoneTimeString,
                        workOrderMilestoneDescription: `Funeral Home: ${workOrderRow.WO_FUNERAL_HOME}`,
                        workOrderMilestoneCompletionDateString: workOrderMilestoneDateString < currentDateString
                            ? workOrderMilestoneDateString
                            : undefined,
                        workOrderMilestoneCompletionTimeString: workOrderMilestoneDateString < currentDateString
                            ? workOrderMilestoneTimeString
                            : undefined
                    }, user);
                }
                if (workOrderMilestoneDateString > maxMilestoneCompletionDateString) {
                    maxMilestoneCompletionDateString = workOrderMilestoneDateString;
                }
                if (workOrderMilestoneDateString >= currentDateString) {
                    hasIncompleteMilestones = true;
                }
            }
            if (workOrderRow.WO_CREMATION === 'Y' &&
                importIds.cremationWorkOrderMilestoneTypeId) {
                await addWorkOrderMilestone({
                    workOrderId: workOrder.workOrderId,
                    workOrderMilestoneTypeId: importIds.cremationWorkOrderMilestoneTypeId,
                    workOrderMilestoneDateString: maxMilestoneCompletionDateString,
                    workOrderMilestoneDescription: '',
                    workOrderMilestoneCompletionDateString: maxMilestoneCompletionDateString < currentDateString
                        ? maxMilestoneCompletionDateString
                        : undefined,
                    workOrderMilestoneCompletionTimeString: maxMilestoneCompletionDateString < currentDateString
                        ? '00:00'
                        : undefined
                }, user);
            }
            if (workOrderRow.WO_INTERMENT_YR) {
                const workOrderMilestoneDateString = formatDateString(workOrderRow.WO_INTERMENT_YR, workOrderRow.WO_INTERMENT_MON, workOrderRow.WO_INTERMENT_DAY);
                if (importIds.intermentWorkOrderMilestoneTypeId) {
                    await addWorkOrderMilestone({
                        workOrderId: workOrder.workOrderId,
                        workOrderMilestoneTypeId: importIds.intermentWorkOrderMilestoneTypeId,
                        workOrderMilestoneDateString,
                        workOrderMilestoneDescription: `Depth: ${workOrderRow.WO_DEPTH}`,
                        workOrderMilestoneCompletionDateString: workOrderMilestoneDateString < currentDateString
                            ? workOrderMilestoneDateString
                            : undefined,
                        workOrderMilestoneCompletionTimeString: workOrderMilestoneDateString < currentDateString
                            ? '23:59'
                            : undefined
                    }, user);
                }
                if (workOrderMilestoneDateString > maxMilestoneCompletionDateString) {
                    maxMilestoneCompletionDateString = workOrderMilestoneDateString;
                }
                if (workOrderMilestoneDateString >= currentDateString) {
                    hasIncompleteMilestones = true;
                }
            }
            if (!hasIncompleteMilestones) {
                await closeWorkOrder({
                    workOrderId: workOrder.workOrderId,
                    workOrderCloseDateString: maxMilestoneCompletionDateString
                }, user);
            }
        }
    }
    catch (error) {
        console.error(error);
        console.log(workOrderRow);
    }
    console.timeEnd('importFromWorkOrderCSV');
}
console.log(`Started ${new Date().toLocaleString()}`);
console.time('importFromCsv');
purgeTables();
// purgeConfigTables();
await importFromMasterCSV();
await importFromPrepaidCSV();
await importFromWorkOrderCSV();
console.timeEnd('importFromCsv');
console.log(`Finished ${new Date().toLocaleString()}`);
