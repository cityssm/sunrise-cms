// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets, perfectionist/sort-objects */
export const settingProperties = [
    {
        settingKey: 'aliases.externalReceiptNumber',
        settingName: 'Aliases - External Receipt Number',
        description: 'The alias for the external receipt number.',
        type: 'string',
        defaultValue: 'Receipt Number',
        isUserConfigurable: true
    },
    {
        settingKey: 'aliases.workOrderOpenDate',
        settingName: 'Aliases - Work Order Open Date',
        description: 'The alias for the work order open date.',
        type: 'string',
        defaultValue: 'Order Date',
        isUserConfigurable: true
    },
    {
        settingKey: 'aliases.workOrderCloseDate',
        settingName: 'Aliases - Work Order Close Date',
        description: 'The alias for the work order close date.',
        type: 'string',
        defaultValue: 'Completion Date',
        isUserConfigurable: true
    },
    {
        settingKey: 'burialSiteTypes.bodyCapacityMaxDefault',
        settingName: 'Burial Site Types - Body Capacity Max Default',
        description: 'The default maximum body capacity for burial site types.',
        type: 'number',
        defaultValue: '2',
        isUserConfigurable: true
    },
    {
        settingKey: 'burialSiteTypes.crematedCapacityMaxDefault',
        settingName: 'Burial Site Types - Cremated Capacity Max Default',
        description: 'The default maximum cremated capacity for burial site types.',
        type: 'number',
        defaultValue: '6',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.0.startHour',
        settingName: 'Work Order Work Day - Sunday - Start Hour',
        description: 'The first hour for work day on Sunday.',
        type: 'number',
        defaultValue: '',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.0.endHour',
        settingName: 'Work Order Work Day - Sunday - End Hour',
        description: 'The final hour for work day on Sunday.',
        type: 'number',
        defaultValue: '',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.1.startHour',
        settingName: 'Work Order Work Day - Monday - Start Hour',
        description: 'The first hour for work day on Monday.',
        type: 'number',
        defaultValue: '8',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.1.endHour',
        settingName: 'Work Order Work Day - Monday - End Hour',
        description: 'The final hour for work day on Monday.',
        type: 'number',
        defaultValue: '17',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.2.startHour',
        settingName: 'Work Order Work Day - Tuesday - Start Hour',
        description: 'The first hour for work day on Tuesday.',
        type: 'number',
        defaultValue: '8',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.2.endHour',
        settingName: 'Work Order Work Day - Tuesday - End Hour',
        description: 'The final hour for work day on Tuesday.',
        type: 'number',
        defaultValue: '17',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.3.startHour',
        settingName: 'Work Order Work Day - Wednesday - Start Hour',
        description: 'The first hour for work day on Wednesday.',
        type: 'number',
        defaultValue: '8',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.3.endHour',
        settingName: 'Work Order Work Day - Wednesday - End Hour',
        description: 'The final hour for work day on Wednesday.',
        type: 'number',
        defaultValue: '17',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.4.startHour',
        settingName: 'Work Order Work Day - Thursday - Start Hour',
        description: 'The first hour for work day on Thursday.',
        type: 'number',
        defaultValue: '8',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.4.endHour',
        settingName: 'Work Order Work Day - Thursday - End Hour',
        description: 'The final hour for work day on Thursday.',
        type: 'number',
        defaultValue: '17',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.5.startHour',
        settingName: 'Work Order Work Day - Friday - Start Hour',
        description: 'The first hour for work day on Friday.',
        type: 'number',
        defaultValue: '8',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.5.endHour',
        settingName: 'Work Order Work Day - Friday - End Hour',
        description: 'The final hour for work day on Friday.',
        type: 'number',
        defaultValue: '17',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.6.startHour',
        settingName: 'Work Order Work Day - Saturday - Start Hour',
        description: 'The first hour for work day on Saturday.',
        type: 'number',
        defaultValue: '',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workDay.6.endHour',
        settingName: 'Work Order Work Day - Saturday - End Hour',
        description: 'The final hour for work day on Saturday.',
        type: 'number',
        defaultValue: '',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workOrderMilestone.recentBeforeDays',
        settingName: 'Work Order Milestone - Recent Before Days',
        description: 'The number of days before the current date to consider a work order milestone as recent.',
        type: 'number',
        defaultValue: '5',
        isUserConfigurable: true
    },
    {
        settingKey: 'workOrder.workOrderMilestone.recentAfterDays',
        settingName: 'Work Order Milestone - Recent After Days',
        description: 'The number of days after the current date to consider a work order milestone as recent.',
        type: 'number',
        defaultValue: '60',
        isUserConfigurable: true
    },
    {
        settingKey: 'pdfPuppeteer.browserInstallAttempted',
        settingName: 'PDF Puppeteer - Browser Install Has Been Attempted',
        description: 'Whether the PDF Puppeteer browser installation was attempted.',
        type: 'boolean',
        defaultValue: 'false',
        isUserConfigurable: true
    },
    {
        settingKey: 'application.csrfSecret',
        settingName: 'Application - CSRF Secret',
        description: 'The secret used for CSRF protection.',
        type: 'string',
        defaultValue: '',
        isUserConfigurable: false
    }
];
