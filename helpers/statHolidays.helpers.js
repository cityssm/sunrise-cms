import { dateToString } from '@cityssm/utils-datetime';
import Holidays from 'date-holidays';
import updateSetting from '../database/updateSetting.js';
import { getCachedSetting, getCachedSettingValue } from './cache/settings.cache.js';
export const statHolidaySettingKeys = {
    additionalDates: 'workOrder.statHolidays.additionalDates',
    country: 'workOrder.statHolidays.country',
    ignoredDates: 'workOrder.statHolidays.ignoredDates',
    region: 'workOrder.statHolidays.region',
    state: 'workOrder.statHolidays.state',
    types: 'workOrder.statHolidays.types'
};
const holidayTypeValues = [
    'public',
    'bank',
    'optional',
    'school',
    'observance'
];
const dateStringPattern = /^\d{4}-\d{2}-\d{2}$/;
function normalizeDateString(dateString) {
    const normalizedDateString = dateString.trim();
    if (!dateStringPattern.test(normalizedDateString)) {
        return '';
    }
    const date = new Date(`${normalizedDateString}T00:00:00`);
    if (Number.isNaN(date.getTime()) ||
        dateToString(date) !== normalizedDateString) {
        return '';
    }
    return normalizedDateString;
}
function normalizeDateStrings(dateStrings, currentDateString) {
    const normalizedDateStringSet = new Set();
    for (const dateString of dateStrings) {
        const normalizedDateString = normalizeDateString(dateString);
        if (normalizedDateString === '' || normalizedDateString < currentDateString) {
            continue;
        }
        normalizedDateStringSet.add(normalizedDateString);
    }
    return [...normalizedDateStringSet].sort((leftDate, rightDate) => leftDate.localeCompare(rightDate));
}
function getRawSettings() {
    return {
        additionalDatesCsv: getCachedSetting(statHolidaySettingKeys.additionalDates).settingValue ?? '',
        country: getCachedSettingValue(statHolidaySettingKeys.country).trim(),
        ignoredDatesCsv: getCachedSetting(statHolidaySettingKeys.ignoredDates).settingValue ?? '',
        region: getCachedSettingValue(statHolidaySettingKeys.region).trim(),
        state: getCachedSettingValue(statHolidaySettingKeys.state).trim(),
        typesCsv: getCachedSettingValue(statHolidaySettingKeys.types).trim()
    };
}
export function getHolidayTypes() {
    return [...holidayTypeValues];
}
export function getHolidayTypeLabels() {
    return {
        bank: 'Bank',
        observance: 'Observance',
        optional: 'Optional',
        public: 'Public',
        school: 'School'
    };
}
function normalizeTypes(typesCsv) {
    const selectedTypes = new Set(typesCsv
        .split(',')
        .map((type) => type.trim())
        .filter((type) => holidayTypeValues.includes(type)));
    if (selectedTypes.size === 0) {
        selectedTypes.add('public');
    }
    return holidayTypeValues.filter((type) => selectedTypes.has(type));
}
function buildLocationOptions(country, state) {
    const holidays = new Holidays();
    const countries = holidays.getCountries();
    const states = country === '' || countries[country] === undefined
        ? {}
        : (holidays.getStates(country) ?? {});
    const regions = state === '' || states[state] === undefined
        ? {}
        : (holidays.getRegions(country, state) ?? {});
    return {
        countries,
        regions,
        states
    };
}
function cleanupSettings(settings, rawSettings) {
    const updates = [];
    const additionalDatesCsv = settings.additionalDateStrings.join(',');
    const ignoredDatesCsv = settings.ignoredDateStrings.join(',');
    const typesCsv = settings.types.join(',');
    if (additionalDatesCsv !== rawSettings.additionalDatesCsv.trim()) {
        updates.push({
            key: statHolidaySettingKeys.additionalDates,
            value: additionalDatesCsv
        });
    }
    if (ignoredDatesCsv !== rawSettings.ignoredDatesCsv.trim()) {
        updates.push({
            key: statHolidaySettingKeys.ignoredDates,
            value: ignoredDatesCsv
        });
    }
    if (typesCsv !== rawSettings.typesCsv.trim()) {
        updates.push({
            key: statHolidaySettingKeys.types,
            value: typesCsv
        });
    }
    if (settings.country !== rawSettings.country) {
        updates.push({
            key: statHolidaySettingKeys.country,
            value: settings.country
        });
    }
    if (settings.state !== rawSettings.state) {
        updates.push({
            key: statHolidaySettingKeys.state,
            value: settings.state
        });
    }
    if (settings.region !== rawSettings.region) {
        updates.push({
            key: statHolidaySettingKeys.region,
            value: settings.region
        });
    }
    for (const update of updates) {
        updateSetting({
            settingKey: update.key,
            settingValue: update.value
        });
    }
}
export function getWorkOrderStatHolidaySettings() {
    const rawSettings = getRawSettings();
    const currentDateString = dateToString(new Date());
    let country = rawSettings.country;
    let state = rawSettings.state;
    let region = rawSettings.region;
    const types = normalizeTypes(rawSettings.typesCsv);
    const additionalDateStrings = normalizeDateStrings(rawSettings.additionalDatesCsv.split(','), currentDateString);
    const ignoredDateStrings = normalizeDateStrings(rawSettings.ignoredDatesCsv.split(','), currentDateString);
    const locationOptions = buildLocationOptions(country, state);
    if (locationOptions.countries[country] === undefined) {
        country = '';
        state = '';
        region = '';
    }
    else if (locationOptions.states[state] === undefined) {
        state = '';
        region = '';
    }
    else if (locationOptions.regions[region] === undefined) {
        region = '';
    }
    const settings = {
        additionalDateStrings,
        country,
        ignoredDateStrings,
        region,
        state,
        types
    };
    cleanupSettings(settings, rawSettings);
    return settings;
}
export function getHolidayLocationOptions(settings) {
    const currentSettings = settings ?? getWorkOrderStatHolidaySettings();
    return buildLocationOptions(currentSettings.country, currentSettings.state);
}
export function getHolidayLocationOptionsByCountryState(country, state) {
    return buildLocationOptions(country.trim(), state.trim());
}
export function getUpcomingStatHolidays(settings, startDate = new Date()) {
    const startDateString = dateToString(startDate);
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);
    const endDateString = dateToString(endDate);
    const ignoredDateStringSet = new Set(settings.ignoredDateStrings);
    const holidayMap = new Map();
    if (settings.country !== '') {
        let holidays;
        if (settings.state === '') {
            holidays = new Holidays(settings.country, { types: settings.types });
        }
        else if (settings.region === '') {
            holidays = new Holidays(settings.country, settings.state, {
                types: settings.types
            });
        }
        else {
            holidays = new Holidays(settings.country, settings.state, settings.region, {
                types: settings.types
            });
        }
        for (const year of [startDate.getFullYear(), endDate.getFullYear()]) {
            for (const holiday of holidays.getHolidays(year)) {
                const dateString = holiday.date.slice(0, 10);
                if (dateString < startDateString ||
                    dateString > endDateString ||
                    ignoredDateStringSet.has(dateString)) {
                    continue;
                }
                const currentHoliday = holidayMap.get(dateString) ?? {
                    dayOfWeek: new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long' }),
                    dateString,
                    isAdditional: false,
                    isFromPackage: false,
                    names: [],
                    types: []
                };
                currentHoliday.isFromPackage = true;
                if (!currentHoliday.names.includes(holiday.name)) {
                    currentHoliday.names.push(holiday.name);
                    currentHoliday.names.sort((leftName, rightName) => leftName.localeCompare(rightName));
                }
                if (!currentHoliday.types.includes(holiday.type)) {
                    currentHoliday.types.push(holiday.type);
                    currentHoliday.types.sort((leftType, rightType) => leftType.localeCompare(rightType));
                }
                holidayMap.set(dateString, currentHoliday);
            }
        }
    }
    for (const dateString of settings.additionalDateStrings) {
        if (dateString < startDateString ||
            dateString > endDateString ||
            ignoredDateStringSet.has(dateString)) {
            continue;
        }
        const currentHoliday = holidayMap.get(dateString) ?? {
            dayOfWeek: new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long' }),
            dateString,
            isAdditional: false,
            isFromPackage: false,
            names: [],
            types: []
        };
        currentHoliday.isAdditional = true;
        if (!currentHoliday.names.includes('Additional Date')) {
            currentHoliday.names.push('Additional Date');
            currentHoliday.names.sort((leftName, rightName) => leftName.localeCompare(rightName));
        }
        if (!currentHoliday.types.includes('additional')) {
            currentHoliday.types.push('additional');
            currentHoliday.types.sort((leftType, rightType) => leftType.localeCompare(rightType));
        }
        holidayMap.set(dateString, currentHoliday);
    }
    return [...holidayMap.values()].sort((leftHoliday, rightHoliday) => leftHoliday.dateString.localeCompare(rightHoliday.dateString));
}
export function updateWorkOrderStatHolidaySettings(updateValues) {
    const countries = new Holidays().getCountries();
    const country = countries[updateValues.country] === undefined ? '' : updateValues.country;
    const states = country === '' ? {} : (new Holidays().getStates(country) ?? {});
    const state = states[updateValues.state] === undefined ? '' : updateValues.state;
    const regions = country === '' || state === ''
        ? {}
        : (new Holidays().getRegions(country, state) ?? {});
    const region = regions[updateValues.region] === undefined ? '' : updateValues.region;
    const types = updateValues.types.filter((type) => holidayTypeValues.includes(type));
    updateSetting({
        settingKey: statHolidaySettingKeys.country,
        settingValue: country
    });
    updateSetting({
        settingKey: statHolidaySettingKeys.state,
        settingValue: state
    });
    updateSetting({
        settingKey: statHolidaySettingKeys.region,
        settingValue: region
    });
    updateSetting({
        settingKey: statHolidaySettingKeys.types,
        settingValue: types.length === 0 ? 'public' : holidayTypeValues.filter((type) => types.includes(type)).join(',')
    });
}
export function addWorkOrderStatHolidayDate(settingKey, dateString) {
    const settings = getWorkOrderStatHolidaySettings();
    const normalizedDateString = normalizeDateString(dateString);
    if (normalizedDateString === '') {
        return;
    }
    const dateStrings = new Set(settingKey === 'additionalDates'
        ? settings.additionalDateStrings
        : settings.ignoredDateStrings);
    dateStrings.add(normalizedDateString);
    updateSetting({
        settingKey: statHolidaySettingKeys[settingKey],
        settingValue: [...dateStrings]
            .sort((leftDate, rightDate) => leftDate.localeCompare(rightDate))
            .join(',')
    });
}
export function removeWorkOrderStatHolidayDate(settingKey, dateString) {
    const settings = getWorkOrderStatHolidaySettings();
    const normalizedDateString = normalizeDateString(dateString);
    if (normalizedDateString === '') {
        return;
    }
    const dateStrings = (settingKey === 'additionalDates'
        ? settings.additionalDateStrings
        : settings.ignoredDateStrings).filter((currentDateString) => currentDateString !== normalizedDateString);
    updateSetting({
        settingKey: statHolidaySettingKeys[settingKey],
        settingValue: dateStrings.join(',')
    });
}
