// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable perfectionist/sort-objects */

export type SettingKey =
  | 'workOrder.workDay.0.endHour'
  | 'workOrder.workDay.0.startHour'
  | 'workOrder.workDay.1.endHour'
  | 'workOrder.workDay.1.startHour'
  | 'workOrder.workDay.2.endHour'
  | 'workOrder.workDay.2.startHour'
  | 'workOrder.workDay.3.endHour'
  | 'workOrder.workDay.3.startHour'
  | 'workOrder.workDay.4.endHour'
  | 'workOrder.workDay.4.startHour'
  | 'workOrder.workDay.5.endHour'
  | 'workOrder.workDay.5.startHour'
  | 'workOrder.workDay.6.endHour'
  | 'workOrder.workDay.6.startHour'

export interface SettingProperties {
  settingKey: SettingKey
  settingName: string

  description: string

  type: 'boolean' | 'number' | 'string'

  defaultValue: string
}

export const settingProperties: SettingProperties[] = [
  {
    settingKey: 'workOrder.workDay.0.startHour',
    settingName: 'Work Order Work Day - Sunday - Start Hour',
    description: 'The first hour for work day on Sunday.',
    type: 'number',
    defaultValue: ''
  },
  {
    settingKey: 'workOrder.workDay.0.endHour',
    settingName: 'Work Order Work Day - Sunday - End Hour',
    description: 'The final hour for work day on Sunday.',
    type: 'number',
    defaultValue: ''
  },
  {
    settingKey: 'workOrder.workDay.1.startHour',
    settingName: 'Work Order Work Day - Monday - Start Hour',
    description: 'The first hour for work day on Monday.',
    type: 'number',
    defaultValue: '8'
  },
  {
    settingKey: 'workOrder.workDay.1.endHour',
    settingName: 'Work Order Work Day - Monday - End Hour',
    description: 'The final hour for work day on Monday.',
    type: 'number',
    defaultValue: '17'
  },
  {
    settingKey: 'workOrder.workDay.2.startHour',
    settingName: 'Work Order Work Day - Tuesday - Start Hour',
    description: 'The first hour for work day on Tuesday.',
    type: 'number',
    defaultValue: '8'
  },
  {
    settingKey: 'workOrder.workDay.2.endHour',
    settingName: 'Work Order Work Day - Tuesday - End Hour',
    description: 'The final hour for work day on Tuesday.',
    type: 'number',
    defaultValue: '17'
  },
  {
    settingKey: 'workOrder.workDay.3.startHour',
    settingName: 'Work Order Work Day - Wednesday - Start Hour',
    description: 'The first hour for work day on Wednesday.',
    type: 'number',
    defaultValue: '8'
  },
  {
    settingKey: 'workOrder.workDay.3.endHour',
    settingName: 'Work Order Work Day - Wednesday - End Hour',
    description: 'The final hour for work day on Wednesday.',
    type: 'number',
    defaultValue: '17'
  },
  {
    settingKey: 'workOrder.workDay.4.startHour',
    settingName: 'Work Order Work Day - Thursday - Start Hour',
    description: 'The first hour for work day on Thursday.',
    type: 'number',
    defaultValue: '8'
  },
  {
    settingKey: 'workOrder.workDay.4.endHour',
    settingName: 'Work Order Work Day - Thursday - End Hour',
    description: 'The final hour for work day on Thursday.',
    type: 'number',
    defaultValue: '17'
  },
  {
    settingKey: 'workOrder.workDay.5.startHour',
    settingName: 'Work Order Work Day - Friday - Start Hour',
    description: 'The first hour for work day on Friday.',
    type: 'number',
    defaultValue: '8'
  },
  {
    settingKey: 'workOrder.workDay.5.endHour',
    settingName: 'Work Order Work Day - Friday - End Hour',
    description: 'The final hour for work day on Friday.',
    type: 'number',
    defaultValue: '17'
  },
  {
    settingKey: 'workOrder.workDay.6.startHour',
    settingName: 'Work Order Work Day - Saturday - Start Hour',
    description: 'The first hour for work day on Saturday.',
    type: 'number',
    defaultValue: ''
  },
  {
    settingKey: 'workOrder.workDay.6.endHour',
    settingName: 'Work Order Work Day - Saturday - End Hour',
    description: 'The final hour for work day on Saturday.',
    type: 'number',
    defaultValue: ''
  }
]
