import { dateToString } from '@cityssm/utils-datetime'
import Holidays, { type HolidaysTypes } from 'date-holidays'

import updateSetting from '../database/updateSetting.js'

import {
  getCachedSetting,
  getCachedSettingValue
} from './cache/settings.cache.js'

type StatHolidaySettingKey =
  | 'workOrder.statHolidays.additionalDates'
  | 'workOrder.statHolidays.country'
  | 'workOrder.statHolidays.ignoredDates'
  | 'workOrder.statHolidays.region'
  | 'workOrder.statHolidays.state'
  | 'workOrder.statHolidays.types'

export const statHolidaySettingKeys = {
  additionalDates: 'workOrder.statHolidays.additionalDates',
  country: 'workOrder.statHolidays.country',
  ignoredDates: 'workOrder.statHolidays.ignoredDates',
  region: 'workOrder.statHolidays.region',
  state: 'workOrder.statHolidays.state',
  types: 'workOrder.statHolidays.types'
} as const satisfies Record<string, StatHolidaySettingKey>

const holidayTypeValues: HolidaysTypes.HolidayType[] = [
  'public',
  'bank',
  'optional',
  'school',
  'observance'
]

const dateStringPattern = /^\d{4}-\d{2}-\d{2}$/

export interface WorkOrderStatHolidaySettings {
  additionalDateStrings: string[]
  country: string
  ignoredDateStrings: string[]
  region: string
  state: string
  types: HolidaysTypes.HolidayType[]
}

export interface UpcomingStatHoliday {
  dayOfWeek: string
  dateString: string
  isAdditional: boolean
  isFromPackage: boolean
  names: string[]
  types: string[]
}

interface RawSettings {
  additionalDatesCsv: string
  country: string
  ignoredDatesCsv: string
  region: string
  state: string
  typesCsv: string
}

function normalizeDateString(dateString: string): string {
  const normalizedDateString = dateString.trim()

  if (!dateStringPattern.test(normalizedDateString)) {
    return ''
  }

  const date = new Date(`${normalizedDateString}T00:00:00`)

  return Number.isNaN(date.getTime()) ||
    dateToString(date) !== normalizedDateString
    ? ''
    : normalizedDateString
}

function normalizeDateStrings(
  dateStrings: string[],
  currentDateString: string
): string[] {
  const normalizedDateStringSet = new Set<string>()

  for (const dateString of dateStrings) {
    const normalizedDateString = normalizeDateString(dateString)

    if (
      normalizedDateString === '' ||
      normalizedDateString < currentDateString
    ) {
      continue
    }

    normalizedDateStringSet.add(normalizedDateString)
  }

  return [...normalizedDateStringSet].toSorted((leftDate, rightDate) =>
    leftDate.localeCompare(rightDate)
  )
}

function getRawSettings(): RawSettings {
  return {
    additionalDatesCsv:
      getCachedSetting(statHolidaySettingKeys.additionalDates).settingValue ??
      '',
    country: getCachedSettingValue(statHolidaySettingKeys.country).trim(),
    ignoredDatesCsv:
      getCachedSetting(statHolidaySettingKeys.ignoredDates).settingValue ?? '',
    region: getCachedSettingValue(statHolidaySettingKeys.region).trim(),
    state: getCachedSettingValue(statHolidaySettingKeys.state).trim(),
    typesCsv: getCachedSettingValue(statHolidaySettingKeys.types).trim()
  }
}

export function getHolidayTypes(): HolidaysTypes.HolidayType[] {
  return [...holidayTypeValues]
}

export function getHolidayTypeLabels(): Record<
  HolidaysTypes.HolidayType,
  string
> {
  return {
    bank: 'Bank',
    observance: 'Observance',
    optional: 'Optional',
    public: 'Public',
    school: 'School'
  }
}

function normalizeTypes(typesCsv: string): HolidaysTypes.HolidayType[] {
  const selectedTypes = new Set(
    typesCsv
      .split(',')
      .map((type) => type.trim())
      .filter((type): type is HolidaysTypes.HolidayType =>
        holidayTypeValues.includes(type as HolidaysTypes.HolidayType)
      )
  )

  if (selectedTypes.size === 0) {
    selectedTypes.add('public')
  }

  return holidayTypeValues.filter((type) => selectedTypes.has(type))
}

function buildLocationOptions(
  country: string,
  state: string
): {
  countries: Record<string, string>
  regions: Record<string, string>
  states: Record<string, string>
} {
  const holidays = new Holidays()

  const countries = holidays.getCountries()

  const states =
    country === '' || countries[country] === undefined
      ? {}
      : (holidays.getStates(country) ?? {})

  const regions =
    state === '' || states[state] === undefined
      ? {}
      : (holidays.getRegions(country, state) ?? {})

  return {
    countries,
    regions,
    states
  }
}

function cleanupSettings(
  settings: WorkOrderStatHolidaySettings,
  rawSettings: RawSettings
): void {
  const updates: Array<{ key: StatHolidaySettingKey; value: string }> = []

  const additionalDatesCsv = settings.additionalDateStrings.join(',')
  const ignoredDatesCsv = settings.ignoredDateStrings.join(',')
  const typesCsv = settings.types.join(',')

  if (additionalDatesCsv !== rawSettings.additionalDatesCsv.trim()) {
    updates.push({
      key: statHolidaySettingKeys.additionalDates,
      value: additionalDatesCsv
    })
  }

  if (ignoredDatesCsv !== rawSettings.ignoredDatesCsv.trim()) {
    updates.push({
      key: statHolidaySettingKeys.ignoredDates,
      value: ignoredDatesCsv
    })
  }

  if (typesCsv !== rawSettings.typesCsv.trim()) {
    updates.push({
      key: statHolidaySettingKeys.types,
      value: typesCsv
    })
  }

  if (settings.country !== rawSettings.country) {
    updates.push({
      key: statHolidaySettingKeys.country,
      value: settings.country
    })
  }

  if (settings.state !== rawSettings.state) {
    updates.push({
      key: statHolidaySettingKeys.state,
      value: settings.state
    })
  }

  if (settings.region !== rawSettings.region) {
    updates.push({
      key: statHolidaySettingKeys.region,
      value: settings.region
    })
  }

  for (const update of updates) {
    updateSetting({
      settingKey: update.key,
      settingValue: update.value
    })
  }
}

export function getWorkOrderStatHolidaySettings(): WorkOrderStatHolidaySettings {
  const rawSettings = getRawSettings()

  const currentDateString = dateToString(new Date())

  let country = rawSettings.country
  let state = rawSettings.state
  let region = rawSettings.region

  const types = normalizeTypes(rawSettings.typesCsv)

  const additionalDateStrings = normalizeDateStrings(
    rawSettings.additionalDatesCsv.split(','),
    currentDateString
  )

  const ignoredDateStrings = normalizeDateStrings(
    rawSettings.ignoredDatesCsv.split(','),
    currentDateString
  )

  const locationOptions = buildLocationOptions(country, state)

  if (locationOptions.countries[country] === undefined) {
    country = ''
    state = ''
    region = ''
  } else if (locationOptions.states[state] === undefined) {
    state = ''
    region = ''
  } else if (locationOptions.regions[region] === undefined) {
    region = ''
  }

  const settings: WorkOrderStatHolidaySettings = {
    additionalDateStrings,
    country,
    ignoredDateStrings,
    region,
    state,
    types
  }

  cleanupSettings(settings, rawSettings)

  return settings
}

export function getHolidayLocationOptions(
  settings?: WorkOrderStatHolidaySettings
): {
  countries: Record<string, string>
  regions: Record<string, string>
  states: Record<string, string>
} {
  const currentSettings = settings ?? getWorkOrderStatHolidaySettings()
  return buildLocationOptions(currentSettings.country, currentSettings.state)
}

export function getHolidayLocationOptionsByCountryState(
  country: string,
  state: string
): {
  countries: Record<string, string>
  regions: Record<string, string>
  states: Record<string, string>
} {
  return buildLocationOptions(country.trim(), state.trim())
}

export function getUpcomingStatHolidays(
  settings: WorkOrderStatHolidaySettings,
  startDate: Date = new Date()
): UpcomingStatHoliday[] {
  const startDateString = dateToString(startDate)
  const endDate = new Date(startDate)
  endDate.setFullYear(startDate.getFullYear() + 1)
  const endDateString = dateToString(endDate)

  const ignoredDateStringSet = new Set(settings.ignoredDateStrings)

  const holidayMap = new Map<string, UpcomingStatHoliday>()

  if (settings.country !== '') {
    let holidays: Holidays

    if (settings.state === '') {
      holidays = new Holidays(settings.country, { types: settings.types })
    } else if (settings.region === '') {
      holidays = new Holidays(settings.country, settings.state, {
        types: settings.types
      })
    } else {
      holidays = new Holidays(
        settings.country,
        settings.state,
        settings.region,
        {
          types: settings.types
        }
      )
    }

    for (const year of [startDate.getFullYear(), endDate.getFullYear()]) {
      for (const holiday of holidays.getHolidays(year)) {
        const dateString = holiday.date.slice(0, 10)

        if (
          dateString < startDateString ||
          dateString > endDateString ||
          ignoredDateStringSet.has(dateString)
        ) {
          continue
        }

        const currentHoliday = holidayMap.get(dateString) ?? {
          dayOfWeek: new Date(`${dateString}T00:00:00`).toLocaleDateString(
            undefined,
            { weekday: 'long' }
          ),
          dateString,
          isAdditional: false,
          isFromPackage: false,
          names: [],
          types: []
        }

        currentHoliday.isFromPackage = true

        if (!currentHoliday.names.includes(holiday.name)) {
          currentHoliday.names.push(holiday.name)
          currentHoliday.names.sort((leftName, rightName) =>
            leftName.localeCompare(rightName)
          )
        }

        if (!currentHoliday.types.includes(holiday.type)) {
          currentHoliday.types.push(holiday.type)
          currentHoliday.types.sort((leftType, rightType) =>
            leftType.localeCompare(rightType)
          )
        }

        holidayMap.set(dateString, currentHoliday)
      }
    }
  }

  for (const dateString of settings.additionalDateStrings) {
    if (
      dateString < startDateString ||
      dateString > endDateString ||
      ignoredDateStringSet.has(dateString)
    ) {
      continue
    }

    const currentHoliday = holidayMap.get(dateString) ?? {
      dayOfWeek: new Date(`${dateString}T00:00:00`).toLocaleDateString(
        undefined,
        { weekday: 'long' }
      ),
      dateString,
      isAdditional: false,
      isFromPackage: false,
      names: [],
      types: []
    }

    currentHoliday.isAdditional = true

    if (!currentHoliday.names.includes('Additional Date')) {
      currentHoliday.names.push('Additional Date')
      currentHoliday.names.sort((leftName, rightName) =>
        leftName.localeCompare(rightName)
      )
    }

    if (!currentHoliday.types.includes('additional')) {
      currentHoliday.types.push('additional')
      currentHoliday.types.sort((leftType, rightType) =>
        leftType.localeCompare(rightType)
      )
    }

    holidayMap.set(dateString, currentHoliday)
  }

  // eslint-disable-next-line unicorn/prefer-iterator-to-array
  const holidayList = [...holidayMap.values()]

  return holidayList.toSorted((leftHoliday, rightHoliday) =>
    leftHoliday.dateString.localeCompare(rightHoliday.dateString)
  )
}

export function updateWorkOrderStatHolidaySettings(updateValues: {
  country: string
  region: string
  state: string
  types: string[]
}): void {
  const countries = new Holidays().getCountries()

  const country =
    countries[updateValues.country] === undefined ? '' : updateValues.country

  const states = country === '' ? {} : (new Holidays().getStates(country) ?? {})

  const state =
    states[updateValues.state] === undefined ? '' : updateValues.state

  const regions =
    country === '' || state === ''
      ? {}
      : (new Holidays().getRegions(country, state) ?? {})

  const region =
    regions[updateValues.region] === undefined ? '' : updateValues.region

  const types = updateValues.types.filter(
    (type): type is HolidaysTypes.HolidayType =>
      holidayTypeValues.includes(type as HolidaysTypes.HolidayType)
  )

  updateSetting({
    settingKey: statHolidaySettingKeys.country,
    settingValue: country
  })

  updateSetting({
    settingKey: statHolidaySettingKeys.state,
    settingValue: state
  })

  updateSetting({
    settingKey: statHolidaySettingKeys.region,
    settingValue: region
  })

  updateSetting({
    settingKey: statHolidaySettingKeys.types,
    settingValue:
      types.length === 0
        ? 'public'
        : holidayTypeValues.filter((type) => types.includes(type)).join(',')
  })
}

export function addWorkOrderStatHolidayDate(
  settingKey: 'additionalDates' | 'ignoredDates',
  dateString: string
): void {
  const settings = getWorkOrderStatHolidaySettings()

  const normalizedDateString = normalizeDateString(dateString)

  if (normalizedDateString === '') {
    return
  }

  const dateStrings = new Set(
    settingKey === 'additionalDates'
      ? settings.additionalDateStrings
      : settings.ignoredDateStrings
  )

  dateStrings.add(normalizedDateString)

  updateSetting({
    settingKey: statHolidaySettingKeys[settingKey],
    settingValue: [...dateStrings]
      .toSorted((leftDate, rightDate) => leftDate.localeCompare(rightDate))
      .join(',')
  })
}

export function removeWorkOrderStatHolidayDate(
  settingKey: 'additionalDates' | 'ignoredDates',
  dateString: string
): void {
  const settings = getWorkOrderStatHolidaySettings()

  const normalizedDateString = normalizeDateString(dateString)

  if (normalizedDateString === '') {
    return
  }

  const dateStrings = (
    settingKey === 'additionalDates'
      ? settings.additionalDateStrings
      : settings.ignoredDateStrings
  ).filter((currentDateString) => currentDateString !== normalizedDateString)

  updateSetting({
    settingKey: statHolidaySettingKeys[settingKey],
    settingValue: dateStrings.join(',')
  })
}
