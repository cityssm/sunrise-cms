import { hoursToMillis } from '@cityssm/to-millis';
export const configDefaultValues = {
    'application.applicationName': 'Sunrise CMS',
    'application.backgroundURL': '/images/cemetery-background.jpg',
    'application.httpPort': 9000,
    'application.logoURL': '/images/sunrise-cms.svg',
    'application.maximumProcesses': 4,
    'application.ntfyStartup': undefined,
    'application.useTestDatabases': false,
    'login.authentication': undefined,
    'login.domain': '',
    'reverseProxy.disableCompression': false,
    'reverseProxy.disableEtag': false,
    'reverseProxy.disableRateLimit': false,
    'reverseProxy.urlPrefix': '',
    'session.cookieName': 'sunrise-user-sid',
    'session.doKeepAlive': false,
    'session.maxAgeMillis': hoursToMillis(1),
    'session.secret': 'cityssm/sunrise',
    'users.canLogin': ['administrator'],
    'users.canUpdate': [],
    'users.canUpdateWorkOrders': [],
    'users.isAdmin': ['administrator'],
    'users.testing': [],
    'settings.cityDefault': '',
    'settings.provinceDefault': '',
    'settings.customizationsPath': '.',
    'settings.enableKeyboardShortcuts': true,
    'settings.latitudeMax': 90,
    'settings.latitudeMin': -90,
    'settings.longitudeMax': 180,
    'settings.longitudeMin': -180,
    'settings.cemeteries.refreshImageChanges': false,
    // eslint-disable-next-line no-secrets/no-secrets
    'settings.burialSiteTypes.bodyCapacityMaxDefault': 2,
    // eslint-disable-next-line no-secrets/no-secrets
    'settings.burialSiteTypes.crematedCapacityMaxDefault': 6,
    'settings.burialSites.burialSiteNameSegments': {
        includeCemeteryKey: false,
        separator: '-',
        segments: {
            1: {
                isAvailable: true,
                isRequired: true,
                label: 'Plot Number',
                maxLength: 20,
                minLength: 1
            }
        }
    },
    'settings.burialSites.burialSiteNameSegments.includeCemeteryKey': false,
    'settings.burialSites.refreshImageChanges': false,
    'settings.contracts.burialSiteIdIsRequired': true,
    'settings.contracts.contractEndDateIsRequired': false,
    'settings.contracts.prints': ['screen/contract'],
    'settings.fees.taxPercentageDefault': 0,
    'settings.workOrders.workOrderNumberLength': 6,
    'settings.workOrders.calendarEmailAddress': 'no-reply@127.0.0.1',
    'settings.workOrders.prints': ['pdf/workOrder', 'pdf/workOrder-commentLog'],
    'settings.workOrders.workOrderMilestoneDateRecentAfterDays': 60,
    'settings.workOrders.workOrderMilestoneDateRecentBeforeDays': 5,
    'settings.adminCleanup.recordDeleteAgeDays': 60,
    'settings.printPdf.browser': 'chrome',
    'settings.printPdf.contentDisposition': 'attachment',
    'settings.dynamicsGP.integrationIsEnabled': false,
    'settings.dynamicsGP.mssqlConfig': undefined,
    // eslint-disable-next-line no-secrets/no-secrets
    'settings.dynamicsGP.lookupOrder': ['invoice'],
    'settings.dynamicsGP.accountCodes': [],
    'settings.dynamicsGP.itemNumbers': [],
    'settings.dynamicsGP.trialBalanceCodes': []
};
export default configDefaultValues;
