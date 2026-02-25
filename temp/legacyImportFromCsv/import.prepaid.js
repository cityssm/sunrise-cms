/* eslint-disable @cspell/spellchecker, complexity, no-await-in-loop, no-console */
import fs from 'node:fs';
import sqlite from 'better-sqlite3';
import papa from 'papaparse';
import addBurialSite from '../../database/addBurialSite.js';
import addContract from '../../database/addContract.js';
import addContractComment from '../../database/addContractComment.js';
import addContractFee from '../../database/addContractFee.js';
import addContractServiceType from '../../database/addContractServiceType.js';
import addContractTransaction from '../../database/addContractTransaction.js';
import getBurialSite, { getBurialSiteByBurialSiteName } from '../../database/getBurialSite.js';
import getContracts from '../../database/getContracts.js';
import { updateBurialSiteStatus } from '../../database/updateBurialSite.js';
import { buildBurialSiteName } from '../../helpers/burialSites.helpers.js';
import { sunriseDB as databasePath } from '../../helpers/database.helpers.js';
import { getBurialSiteTypeId } from './data.burialSiteTypes.js';
import { cremationCemeteryKeys, getCemeteryIdByKey } from './data.cemeteries.js';
import { getFeeIdByFeeDescription } from './data.fees.js';
import * as importIds from './data.ids.js';
import { formatContractNumber, formatDateString, user } from './utilities.js';
export async function importFromPrepaidCSV() {
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
    const database = sqlite(databasePath);
    database.pragma('journal_mode = WAL');
    try {
        for (prepaidRow of cmprpaid.data) {
            if (prepaidRow.CMPP_PREPAID_FOR_NAME === '') {
                continue;
            }
            let cemeteryKey = prepaidRow.CMPP_CEMETERY;
            if (cemeteryKey === '.m') {
                cemeteryKey = 'HC';
            }
            let burialSite;
            if (!cremationCemeteryKeys.has(cemeteryKey)) {
                const cemeteryId = getCemeteryIdByKey(cemeteryKey, user, database);
                const burialSiteNameSegment1 = prepaidRow.CMPP_BLOCK === '0' ? '' : prepaidRow.CMPP_BLOCK;
                const burialSiteNameSegment2 = (prepaidRow.CMPP_RANGE1 === '0' ? '' : prepaidRow.CMPP_RANGE1) +
                    (prepaidRow.CMPP_RANGE2 === '0' ? '' : prepaidRow.CMPP_RANGE2);
                const burialSiteNameSegment3 = (prepaidRow.CMPP_LOT1 === '0' ? '' : prepaidRow.CMPP_LOT1) +
                    (prepaidRow.CMPP_LOT2 === '0' ? '' : prepaidRow.CMPP_LOT2);
                let burialSiteNameSegment4 = (prepaidRow.CMPP_GRAVE1 === '0' ? '' : prepaidRow.CMPP_GRAVE1) +
                    (prepaidRow.CMPP_GRAVE2 === '0' ? '' : prepaidRow.CMPP_GRAVE2);
                if (burialSiteNameSegment4 === '') {
                    burialSiteNameSegment4 = '1';
                }
                const burialSiteName = buildBurialSiteName(cemeteryKey, {
                    burialSiteNameSegment1,
                    burialSiteNameSegment2,
                    burialSiteNameSegment3,
                    burialSiteNameSegment4
                });
                burialSite = await getBurialSiteByBurialSiteName(burialSiteName, true, database);
                if (burialSite === undefined) {
                    const burialSiteTypeId = getBurialSiteTypeId(cemeteryKey);
                    const burialSiteKeys = addBurialSite({
                        burialSiteNameSegment1,
                        burialSiteNameSegment2,
                        burialSiteNameSegment3,
                        burialSiteNameSegment4,
                        burialSiteStatusId: importIds.reservedBurialSiteStatusId,
                        burialSiteTypeId,
                        cemeteryId,
                        cemeterySvgId: burialSiteName.includes(',')
                            ? burialSiteName.split(',')[0]
                            : burialSiteName,
                        burialSiteLatitude: '',
                        burialSiteLongitude: '',
                        burialSiteImage: ''
                    }, user, database);
                    burialSite = await getBurialSite(burialSiteKeys.burialSiteId, true, database);
                }
            }
            if (burialSite !== undefined &&
                burialSite.burialSiteStatusId === importIds.availableBurialSiteStatusId) {
                updateBurialSiteStatus(burialSite.burialSiteId, importIds.reservedBurialSiteStatusId, user, database);
            }
            const contractStartDateString = formatDateString(prepaidRow.CMPP_PURCH_YR, prepaidRow.CMPP_PURCH_MON, prepaidRow.CMPP_PURCH_DAY);
            let contractId;
            if (burialSite !== undefined) {
                const possibleContracts = await getContracts({
                    burialSiteId: burialSite.burialSiteId,
                    contractStartDateString,
                    contractTypeId: importIds.preneedContractType.contractTypeId,
                    deceasedName: prepaidRow.CMPP_PREPAID_FOR_NAME
                }, {
                    includeFees: false,
                    includeInterments: false,
                    includeTransactions: false,
                    limit: -1,
                    offset: 0
                }, database);
                if (possibleContracts.contracts.length > 0) {
                    contractId = possibleContracts.contracts[0].contractId;
                }
            }
            contractId ||= addContract({
                contractNumber: formatContractNumber(prepaidRow.CMPP_ORDER_NO),
                burialSiteId: burialSite === undefined ? '' : burialSite.burialSiteId,
                contractTypeId: importIds.preneedContractType.contractTypeId,
                contractEndDateString: '',
                contractStartDateString,
                purchaserName: prepaidRow.CMPP_ARRANGED_BY_NAME,
                deceasedName: prepaidRow.CMPP_PREPAID_FOR_NAME,
                deceasedAddress1: prepaidRow.CMPP_ADDRESS,
                deceasedAddress2: '',
                deceasedCity: prepaidRow.CMPP_CITY,
                deceasedPostalCode: `${prepaidRow.CMPP_POSTAL1} ${prepaidRow.CMPP_POSTAL2}`,
                deceasedProvince: prepaidRow.CMPP_PROV.slice(0, 2)
            }, user, database);
            // Service Types
            if (prepaidRow.CMPP_FEE_GRAV_SD !== '0.0' ||
                prepaidRow.CMPP_FEE_GRAV_DD !== '0.0') {
                addContractServiceType({
                    contractId,
                    serviceTypeId: importIds.intermentServiceTypeId
                }, user, database);
            }
            if (prepaidRow.CMPP_FEE_ENTOMBMENT !== '0.0') {
                addContractServiceType({
                    contractId,
                    serviceTypeId: importIds.entombmentServiceTypeId
                }, user, database);
            }
            if (prepaidRow.CMPP_FEE_CREM !== '0.0') {
                addContractServiceType({
                    contractId,
                    serviceTypeId: importIds.cremationServiceTypeId
                }, user, database);
            }
            if (prepaidRow.CMPP_FEE_NICHE !== '0.0') {
                addContractServiceType({
                    contractId,
                    serviceTypeId: importIds.nicheServiceTypeId
                }, user, database);
            }
            if (prepaidRow.CMPP_FEE_DISINTERMENT !== '0.0' &&
                prepaidRow.CMPP_FEE_DISINTERMENT !== '20202.02') {
                addContractServiceType({
                    contractId,
                    serviceTypeId: importIds.disintermentServiceTypeId
                }, user, database);
            }
            // Fees and Transactions
            if (prepaidRow.CMPP_FEE_GRAV_SD !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: getFeeIdByFeeDescription('CMPP_FEE_GRAV_SD', user),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_GRAV_SD,
                    taxAmount: prepaidRow.CMPP_GST_GRAV_SD
                }, user, database);
            }
            if (prepaidRow.CMPP_FEE_GRAV_DD !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: getFeeIdByFeeDescription('CMPP_FEE_GRAV_DD', user),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_GRAV_DD,
                    taxAmount: prepaidRow.CMPP_GST_GRAV_DD
                }, user, database);
            }
            if (prepaidRow.CMPP_FEE_CHAP_SD !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: getFeeIdByFeeDescription('CMPP_FEE_CHAP_SD', user),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_CHAP_SD,
                    taxAmount: prepaidRow.CMPP_GST_CHAP_SD
                }, user, database);
            }
            if (prepaidRow.CMPP_FEE_CHAP_DD !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: getFeeIdByFeeDescription('CMPP_FEE_CHAP_DD', user),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_CHAP_DD,
                    taxAmount: prepaidRow.CMPP_GST_CHAP_DD
                }, user, database);
            }
            if (prepaidRow.CMPP_FEE_ENTOMBMENT !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: getFeeIdByFeeDescription('CMPP_FEE_ENTOMBMENT', user),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_ENTOMBMENT,
                    taxAmount: prepaidRow.CMPP_GST_ENTOMBMENT
                }, user, database);
            }
            if (prepaidRow.CMPP_FEE_CREM !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: getFeeIdByFeeDescription('CMPP_FEE_CREM', user),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_CREM,
                    taxAmount: prepaidRow.CMPP_GST_CREM
                }, user, database);
            }
            if (prepaidRow.CMPP_FEE_NICHE !== '0.0') {
                await addContractFee({
                    contractId,
                    feeId: getFeeIdByFeeDescription('CMPP_FEE_NICHE', user),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_NICHE,
                    taxAmount: prepaidRow.CMPP_GST_NICHE
                }, user, database);
            }
            if (prepaidRow.CMPP_FEE_DISINTERMENT !== '0.0' &&
                prepaidRow.CMPP_FEE_DISINTERMENT !== '20202.02') {
                await addContractFee({
                    contractId,
                    feeId: getFeeIdByFeeDescription('CMPP_FEE_DISINTERMENT', user),
                    quantity: 1,
                    feeAmount: prepaidRow.CMPP_FEE_DISINTERMENT,
                    taxAmount: prepaidRow.CMPP_GST_DISINTERMENT
                }, user, database);
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
            addContractTransaction({
                contractId,
                externalReceiptNumber: '',
                transactionAmount,
                transactionDateString: contractStartDateString,
                transactionTimeString: '00:00',
                transactionNote: `Order Number: ${prepaidRow.CMPP_ORDER_NO}`
            }, user, database);
            if (prepaidRow.CMPP_REMARK1 !== '') {
                addContractComment({
                    contractId,
                    comment: prepaidRow.CMPP_REMARK1,
                    commentDateString: contractStartDateString
                }, user, database);
            }
            if (prepaidRow.CMPP_REMARK2 !== '') {
                addContractComment({
                    contractId,
                    comment: prepaidRow.CMPP_REMARK2,
                    commentDateString: contractStartDateString
                }, user, database);
            }
        }
    }
    catch (error) {
        console.error(error);
        console.log(prepaidRow);
    }
    finally {
        database.close();
    }
    console.timeEnd('importFromPrepaidCSV');
}
