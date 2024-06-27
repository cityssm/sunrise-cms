export const configDefaultValues = {
    'activeDirectory': undefined,
    'application.applicationName': 'Lot Occupancy System',
    'application.backgroundURL': '/images/cemetery-background.jpg',
    'application.logoURL': '/images/cemetery-logo.png',
    'application.httpPort': 7000,
    'application.userDomain': '',
    'application.useTestDatabases': false,
    'application.maximumProcesses': 4,
    'application.ntfyStartup': undefined,
    'reverseProxy.disableCompression': false,
    'reverseProxy.disableEtag': false,
    'reverseProxy.urlPrefix': '',
    'session.cookieName': 'lot-occupancy-system-user-sid',
    'session.secret': 'cityssm/lot-occupancy-system',
    'session.maxAgeMillis': 60 * 60 * 1000,
    'session.doKeepAlive': false,
    'users.testing': [],
    'users.canLogin': ['administrator'],
    'users.canUpdate': [],
    'users.isAdmin': ['administrator'],
    'aliases.lot': 'Lot',
    'aliases.lots': 'Lots',
    'aliases.map': 'Map',
    'aliases.maps': 'Maps',
    'aliases.occupancy': 'Occupancy',
    'aliases.occupancies': 'Occupancies',
    'aliases.occupancyStartDate': 'Start Date',
    'aliases.occupant': 'Occupant',
    'aliases.occupants': 'Occupants',
    'aliases.externalReceiptNumber': 'External Receipt Number',
    'aliases.workOrderOpenDate': 'Open Date',
    'aliases.workOrderCloseDate': 'Close Date',
    'settings.map.mapCityDefault': '',
    'settings.map.mapProvinceDefault': '',
    'settings.lot.lotNamePattern': undefined,
    'settings.lot.lotNameHelpText': '',
    'settings.lot.lotNameSortNameFunction': (lotName) => lotName,
    // eslint-disable-next-line no-secrets/no-secrets
    'settings.lotOccupancy.occupancyEndDateIsRequired': true,
    'settings.lotOccupancy.occupantCityDefault': '',
    'settings.lotOccupancy.occupantProvinceDefault': '',
    'settings.lotOccupancy.prints': ['screen/lotOccupancy'],
    'settings.fees.taxPercentageDefault': 0,
    'settings.workOrders.workOrderNumberLength': 6,
    'settings.workOrders.workOrderMilestoneDateRecentBeforeDays': 5,
    'settings.workOrders.workOrderMilestoneDateRecentAfterDays': 60,
    'settings.workOrders.calendarEmailAddress': 'no-reply@127.0.0.1',
    'settings.workOrders.prints': ['pdf/workOrder', 'pdf/workOrder-commentLog'],
    'settings.adminCleanup.recordDeleteAgeDays': 60,
    'settings.printPdf.contentDisposition': 'attachment',
    'settings.dynamicsGP.integrationIsEnabled': false,
    'settings.dynamicsGP.mssqlConfig': undefined,
    // eslint-disable-next-line no-secrets/no-secrets
    'settings.dynamicsGP.lookupOrder': ['invoice'],
    'settings.dynamicsGP.accountCodes': [],
    'settings.dynamicsGP.itemNumbers': [],
    'settings.dynamicsGP.trialBalanceCodes': []
};
