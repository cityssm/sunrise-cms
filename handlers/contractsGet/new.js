import { dateToInteger, dateToString } from '@cityssm/utils-datetime';
import Debug from 'debug';
import getBurialSite from '../../database/getBurialSite.js';
import getBurialSiteDirectionsOfArrival, { defaultDirectionsOfArrival } from '../../database/getBurialSiteDirectionsOfArrival.js';
import getBurialSites from '../../database/getBurialSites.js';
import getFuneralHomes from '../../database/getFuneralHomes.js';
import getOrderForm from '../../database/getOrderForm.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js';
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js';
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js';
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js';
import { getCachedServiceTypeById, getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js';
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
import { i18next } from '../../helpers/i18n.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:new`);
function getOrderFormDateParts(orderFormData) {
    const birthDatePieces = orderFormData.birthDateString?.split('-') ?? [];
    const deathDatePieces = orderFormData.deathDateString?.split('-') ?? [];
    const returnDates = {};
    if (birthDatePieces.length === 3) {
        returnDates.birthYear = birthDatePieces[0];
        returnDates.birthMonth = birthDatePieces[1];
        returnDates.birthDay = birthDatePieces[2];
    }
    if (deathDatePieces.length === 3) {
        returnDates.deathYear = deathDatePieces[0];
        returnDates.deathMonth = deathDatePieces[1];
        returnDates.deathDay = deathDatePieces[2];
    }
    return returnDates;
}
export function calculateDeathAgeFromDates(orderFormData) {
    const { birthYear, birthMonth, birthDay, deathYear, deathMonth, deathDay } = getOrderFormDateParts(orderFormData);
    const birthYearNumber = Number(birthYear);
    const birthMonthNumber = Number(birthMonth);
    const birthDayNumber = Number(birthDay);
    const deathYearNumber = Number(deathYear);
    const deathMonthNumber = Number(deathMonth);
    const deathDayNumber = Number(deathDay);
    if (!Number.isFinite(birthYearNumber) ||
        birthYearNumber <= 0 ||
        !Number.isFinite(deathYearNumber) ||
        deathYearNumber <= 0) {
        const fallbackAge = orderFormData.deathAge;
        const fallbackPeriod = orderFormData.deathAgePeriod;
        return {
            deathAge: typeof fallbackAge === 'number' || typeof fallbackAge === 'string'
                ? fallbackAge
                : '',
            deathAgePeriod: typeof fallbackPeriod === 'string' ? fallbackPeriod : ''
        };
    }
    const hasFullBirthDate = Number.isFinite(birthMonthNumber) &&
        Number.isFinite(birthDayNumber) &&
        birthMonthNumber >= 1 &&
        birthMonthNumber <= 12 &&
        birthDayNumber >= 1 &&
        birthDayNumber <= 31;
    const hasFullDeathDate = Number.isFinite(deathMonthNumber) &&
        Number.isFinite(deathDayNumber) &&
        deathMonthNumber >= 1 &&
        deathMonthNumber <= 12 &&
        deathDayNumber >= 1 &&
        deathDayNumber <= 31;
    if (hasFullBirthDate && hasFullDeathDate) {
        const birthDate = new Date(birthYearNumber, birthMonthNumber - 1, birthDayNumber);
        const deathDate = new Date(deathYearNumber, deathMonthNumber - 1, deathDayNumber);
        const ageInDays = Math.floor((deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        if (ageInDays <= 0) {
            return { deathAge: 0, deathAgePeriod: 'Stillborn' };
        }
        const ageInYears = Math.floor(ageInDays / 365.25);
        return ageInYears === 0
            ? { deathAge: ageInDays, deathAgePeriod: 'Days' }
            : { deathAge: ageInYears, deathAgePeriod: 'Years' };
    }
    return {
        deathAge: Math.max(0, deathYearNumber - birthYearNumber),
        deathAgePeriod: 'Years'
    };
}
export default async function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
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
        const sourceOrderFormId = typeof request.query.orderFormId === 'string'
            ? request.query.orderFormId
            : undefined;
        const sourceOrderForm = sourceOrderFormId === undefined
            ? undefined
            : getOrderForm(sourceOrderFormId);
        let sourceOrderFormBurialSiteInfo = undefined;
        if (sourceOrderForm !== undefined) {
            const orderFormData = sourceOrderForm.orderFormData;
            const funeralHomeIdValue = orderFormData.funeralHomeId;
            const cemeteryIdValue = orderFormData.cemeteryId;
            const committalTypeIdValue = orderFormData.committalTypeId;
            const queryBurialSiteId = request.query.burialSiteId;
            const orderFormBurialSiteName = typeof orderFormData.burialSiteName === 'string'
                ? orderFormData.burialSiteName.trim()
                : '';
            const orderFormCemeteryName = typeof orderFormData.cemeteryIdText === 'string'
                ? orderFormData.cemeteryIdText.trim()
                : '';
            contract.purchaserName =
                orderFormData.purchaserName ?? contract.purchaserName;
            contract.purchaserAddress1 = orderFormData.purchaserAddress1 ?? '';
            contract.purchaserAddress2 = orderFormData.purchaserAddress2 ?? '';
            contract.purchaserCity = orderFormData.purchaserCity ?? '';
            contract.purchaserPostalCode = orderFormData.purchaserPostalCode ?? '';
            contract.purchaserProvince = orderFormData.purchaserProvince ?? '';
            contract.purchaserEmail = orderFormData.purchaserEmail ?? '';
            contract.purchaserPhoneNumber = orderFormData.purchaserPhoneNumber ?? '';
            contract.purchaserRelationship = orderFormData.purchaserRelationship ?? '';
            const isDeceasedSameAsPurchaser = orderFormData.deceasedSameAsPurchaser === true ||
                orderFormData.deceasedSameAsPurchaser === 'true';
            const orderFormDeceasedName = typeof orderFormData.deceasedName === 'string'
                ? orderFormData.deceasedName
                : '';
            const orderFormDeceasedAddress1 = typeof orderFormData.deceasedAddress1 === 'string'
                ? orderFormData.deceasedAddress1
                : '';
            const orderFormDeceasedAddress2 = typeof orderFormData.deceasedAddress2 === 'string'
                ? orderFormData.deceasedAddress2
                : '';
            const orderFormDeceasedCity = typeof orderFormData.deceasedCity === 'string'
                ? orderFormData.deceasedCity
                : '';
            const orderFormDeceasedPostalCode = typeof orderFormData.deceasedPostalCode === 'string'
                ? orderFormData.deceasedPostalCode
                : '';
            const orderFormDeceasedProvince = typeof orderFormData.deceasedProvince === 'string'
                ? orderFormData.deceasedProvince
                : '';
            contract.deceasedName = isDeceasedSameAsPurchaser
                ? (orderFormData.purchaserName ?? '')
                : orderFormDeceasedName;
            contract.deceasedAddress1 = isDeceasedSameAsPurchaser
                ? (orderFormData.purchaserAddress1 ?? '')
                : orderFormDeceasedAddress1;
            contract.deceasedAddress2 = isDeceasedSameAsPurchaser
                ? (orderFormData.purchaserAddress2 ?? '')
                : orderFormDeceasedAddress2;
            contract.deceasedCity = isDeceasedSameAsPurchaser
                ? (orderFormData.purchaserCity ?? '')
                : orderFormDeceasedCity;
            contract.deceasedPostalCode = isDeceasedSameAsPurchaser
                ? (orderFormData.purchaserPostalCode ?? '')
                : orderFormDeceasedPostalCode;
            contract.deceasedProvince = isDeceasedSameAsPurchaser
                ? (orderFormData.purchaserProvince ?? '')
                : orderFormDeceasedProvince;
            contract.contractTypeId =
                orderFormData.contractTypeId === undefined ||
                    orderFormData.contractTypeId === ''
                    ? 0
                    : Number(orderFormData.contractTypeId);
            contract.contractType =
                orderFormData.contractTypeIdText ?? contract.contractType ?? '';
            contract.funeralHomeId =
                funeralHomeIdValue === undefined || funeralHomeIdValue === ''
                    ? undefined
                    : Number(funeralHomeIdValue);
            contract.funeralHomeName =
                orderFormData.funeralHomeIdText ?? contract.funeralHomeName;
            contract.funeralDirectorName =
                typeof orderFormData.funeralDirectorName === 'string'
                    ? orderFormData.funeralDirectorName
                    : (contract.funeralDirectorName ?? '');
            contract.cemeteryId =
                cemeteryIdValue === undefined || cemeteryIdValue === ''
                    ? undefined
                    : Number(cemeteryIdValue);
            contract.cemeteryName =
                orderFormData.cemeteryIdText ?? contract.cemeteryName;
            contract.funeralDateString = orderFormData.funeralDateString ?? '';
            const dateParts = getOrderFormDateParts(orderFormData);
            contract.birthYear = dateParts.birthYear ?? '';
            contract.birthMonth = dateParts.birthMonth ?? '';
            contract.birthDay = dateParts.birthDay ?? '';
            contract.birthPlace = orderFormData.birthPlace ?? '';
            contract.deathYear = dateParts.deathYear ?? '';
            contract.deathMonth = dateParts.deathMonth ?? '';
            contract.deathDay = dateParts.deathDay ?? '';
            contract.deathAge = orderFormData.deathAge ?? '';
            contract.deathAgePeriod = orderFormData.deathAgePeriod ?? '';
            contract.deathPlace = orderFormData.deathPlace ?? '';
            contract.intermentDepthId =
                orderFormData.intermentDepthId === undefined ||
                    orderFormData.intermentDepthId === ''
                    ? undefined
                    : Number(orderFormData.intermentDepthId);
            contract.intermentDepth =
                orderFormData.intermentDepthIdText ?? contract.intermentDepth ?? '';
            contract.intermentContainerTypeId =
                orderFormData.intermentContainerTypeId === undefined ||
                    orderFormData.intermentContainerTypeId === ''
                    ? undefined
                    : Number(orderFormData.intermentContainerTypeId);
            contract.intermentContainerType =
                orderFormData.intermentContainerTypeIdText ??
                    contract.intermentContainerType ??
                    '';
            contract.funeralTimeString =
                orderFormData.funeralTimeString === undefined ||
                    orderFormData.funeralTimeString === ''
                    ? undefined
                    : orderFormData.funeralTimeString;
            contract.directionOfArrival = orderFormData.directionOfArrival ?? '';
            contract.directionOfArrivalDescription =
                orderFormData.directionOfArrivalText ?? '';
            contract.committalTypeId =
                committalTypeIdValue === undefined || committalTypeIdValue === ''
                    ? undefined
                    : Number(committalTypeIdValue);
            contract.contractStartDateString =
                orderFormData.funeralDateString ?? contract.contractStartDateString;
            contract.contractEndDateString = '';
            if (typeof orderFormData.deathAge === 'string' &&
                orderFormData.deathAge !== '') {
                const deathAge = Number(orderFormData.deathAge);
                if (!Number.isNaN(deathAge)) {
                    contract.deathAge = deathAge;
                }
            }
            const calculatedAge = calculateDeathAgeFromDates(orderFormData);
            if (calculatedAge.deathAge !== '' &&
                calculatedAge.deathAgePeriod !== '') {
                contract.deathAge = calculatedAge.deathAge;
                contract.deathAgePeriod = calculatedAge.deathAgePeriod;
            }
            let matchingBurialSite;
            if (queryBurialSiteId === undefined && orderFormBurialSiteName !== '') {
                matchingBurialSite = getBurialSites({ burialSiteName: orderFormBurialSiteName }, { limit: 1, offset: 0 }, database).burialSites.find((burialSite) => burialSite.burialSiteName.trim().toLowerCase() ===
                    orderFormBurialSiteName.toLowerCase());
                if (matchingBurialSite !== undefined) {
                    contract.burialSiteId = matchingBurialSite.burialSiteId;
                    contract.burialSiteName = matchingBurialSite.burialSiteName;
                    contract.cemeteryId =
                        matchingBurialSite.cemeteryId ?? contract.cemeteryId;
                    contract.cemeteryName =
                        matchingBurialSite.cemeteryName ?? contract.cemeteryName;
                }
            }
            contract.burialSiteId ??=
                queryBurialSiteId === undefined ? undefined : Number(queryBurialSiteId);
            sourceOrderFormBurialSiteInfo =
                queryBurialSiteId === undefined &&
                    matchingBurialSite === undefined &&
                    (orderFormCemeteryName !== '' || orderFormBurialSiteName !== '')
                    ? {
                        cemetery: orderFormCemeteryName,
                        burialSite: orderFormBurialSiteName
                    }
                    : undefined;
            const serviceTypeIds = [];
            for (const [key, value] of Object.entries(orderFormData)) {
                if (key.startsWith('serviceTypeId-') && value === 'true') {
                    const id = Number(key.replace('serviceTypeId-', ''));
                    if (!Number.isNaN(id)) {
                        serviceTypeIds.push(id);
                    }
                }
            }
            if (serviceTypeIds.length > 0) {
                contract.contractServiceTypes = serviceTypeIds
                    .map((serviceTypeId) => {
                    const serviceType = getCachedServiceTypeById(serviceTypeId);
                    return {
                        serviceTypeId,
                        serviceType: serviceType?.serviceType ?? '',
                        isAvailableOnPortal: serviceType?.isAvailableOnPortal ?? false,
                        contractServiceDetails: ''
                    };
                })
                    .filter((serviceType) => serviceType.serviceTypeId > 0);
            }
            if (typeof orderFormData.comment === 'string' &&
                orderFormData.comment.trim() !== '') {
                contract.comment = orderFormData.comment.trim();
                contract.contractComments = [
                    {
                        contractCommentId: 0,
                        comment: orderFormData.comment.trim(),
                        commentDate: Number(dateToInteger(new Date())),
                        commentDateString: dateToString(new Date()),
                        commentTime: 0,
                        commentTimePeriodString: 'AM',
                        commentTimeString: '00:00',
                        recordCreate_username: 'portal'
                    }
                ];
            }
            contract.sourceOrderFormId = sourceOrderForm.orderFormId;
        }
        const contractTypes = getCachedContractTypes();
        const funeralHomes = getFuneralHomes(false, database);
        const committalTypes = getCachedCommittalTypes();
        const intermentContainerTypes = getCachedIntermentContainerTypes();
        const intermentDepths = getCachedIntermentDepths();
        const serviceTypes = getCachedServiceTypes();
        const burialSiteStatuses = getCachedBurialSiteStatuses();
        const burialSiteTypes = getCachedBurialSiteTypes();
        const cemeteries = getCachedCemeteries();
        const burialSiteDirectionsOfArrival = contract.burialSiteId === undefined || contract.burialSiteId === null
            ? defaultDirectionsOfArrival
            : getBurialSiteDirectionsOfArrival(contract.burialSiteId, database);
        const sourceOrderFormServiceTypeIds = sourceOrderForm === undefined
            ? []
            : Object.entries(sourceOrderForm.orderFormData)
                .filter(([key, value]) => key.startsWith('serviceTypeId-') && value === 'true')
                .map(([key]) => Number(key.replace('serviceTypeId-', '')))
                .filter((serviceTypeId) => !Number.isNaN(serviceTypeId));
        console.log(contract);
        response.render('contracts/edit', {
            headTitle: i18next.t('contracts.createNewContract', {
                lng: response.locals.lng
            }),
            contract,
            sourceOrderForm,
            sourceOrderFormBurialSiteInfo,
            sourceOrderFormServiceTypeIds,
            committalTypes,
            contractTypes,
            funeralHomes,
            intermentContainerTypes,
            intermentDepths,
            serviceTypes,
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
