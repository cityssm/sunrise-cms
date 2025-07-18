import { getSettingValue } from './cache.helpers.js'

export function getWorkOrderWorkDayRanges(): Record<
  number,
  { endHour: number; startHour: number }
> {
  return {
    0: {
      endHour:
        getSettingValue('workOrder.workDay.0.endHour') === ''
          ? -1
          : Number.parseInt(getSettingValue('workOrder.workDay.0.endHour'), 10),
      startHour:
        getSettingValue('workOrder.workDay.0.startHour') === ''
          ? -1
          : Number.parseInt(
              getSettingValue('workOrder.workDay.0.startHour'),
              10
            )
    }, // Sunday
    1: {
      endHour:
        getSettingValue('workOrder.workDay.1.endHour') === ''
          ? -1
          : Number.parseInt(getSettingValue('workOrder.workDay.1.endHour'), 10),
      startHour:
        getSettingValue('workOrder.workDay.1.startHour') === ''
          ? -1
          : Number.parseInt(
              getSettingValue('workOrder.workDay.1.startHour'),
              10
            )
    }, // Monday
    2: {
      endHour:
        getSettingValue('workOrder.workDay.2.endHour') === ''
          ? -1
          : Number.parseInt(getSettingValue('workOrder.workDay.2.endHour'), 10),
      startHour:
        getSettingValue('workOrder.workDay.2.startHour') === ''
          ? -1
          : Number.parseInt(
              getSettingValue('workOrder.workDay.2.startHour'),
              10
            )
    }, // Tuesday
    3: {
      endHour:
        getSettingValue('workOrder.workDay.3.endHour') === ''
          ? -1
          : Number.parseInt(getSettingValue('workOrder.workDay.3.endHour'), 10),
      startHour:
        getSettingValue('workOrder.workDay.3.startHour') === ''
          ? -1
          : Number.parseInt(
              getSettingValue('workOrder.workDay.3.startHour'),
              10
            )
    }, // Wednesday
    4: {
      endHour:
        getSettingValue('workOrder.workDay.4.endHour') === ''
          ? -1
          : Number.parseInt(getSettingValue('workOrder.workDay.4.endHour'), 10),
      startHour:
        getSettingValue('workOrder.workDay.4.startHour') === ''
          ? -1
          : Number.parseInt(
              getSettingValue('workOrder.workDay.4.startHour'),
              10
            )
    }, // Thursday
    5: {
      endHour:
        getSettingValue('workOrder.workDay.5.endHour') === ''
          ? -1
          : Number.parseInt(getSettingValue('workOrder.workDay.5.endHour'), 10),
      startHour:
        getSettingValue('workOrder.workDay.5.startHour') === ''
          ? -1
          : Number.parseInt(
              getSettingValue('workOrder.workDay.5.startHour'),
              10
            )
    }, // Friday
    6: {
      endHour:
        getSettingValue('workOrder.workDay.6.endHour') === ''
          ? -1
          : Number.parseInt(getSettingValue('workOrder.workDay.6.endHour'), 10),
      startHour:
        getSettingValue('workOrder.workDay.6.startHour') === ''
          ? -1
          : Number.parseInt(
              getSettingValue('workOrder.workDay.6.startHour'),
              10
            )
    } // Saturday
  }
}
