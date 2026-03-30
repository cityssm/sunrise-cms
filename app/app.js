import path from 'node:path';
import { abuseCheck, clearAbuse, shutdown as shutdownAbuseCheck } from '@cityssm/express-abuse-points';
import { millisecondsInOneHour, millisecondsInOneMinute, minutesToMillis } from '@cityssm/to-millis';
import * as dateTimeFunctions from '@cityssm/utils-datetime';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import Debug from 'debug';
import exitHook from 'exit-hook';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import createError from 'http-errors';
import * as i18nextMiddleware from 'i18next-http-middleware';
import FileStore from 'session-file-store';
import { DEBUG_NAMESPACE, PROCESS_ID_MAX_DIGITS } from '../debug.config.js';
import * as permissionHandlers from '../handlers/permissions.js';
import { getSafeRedirectUrl } from '../helpers/authentication.helpers.js';
import { getCachedBurialSiteStatuses } from '../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedBurialSiteTypes } from '../helpers/cache/burialSiteTypes.cache.js';
import { getCachedCommittalTypes } from '../helpers/cache/committalTypes.cache.js';
import { getCachedContractTypes } from '../helpers/cache/contractTypes.cache.js';
import { getCachedIntermentContainerTypes } from '../helpers/cache/intermentContainerTypes.cache.js';
import { getCachedIntermentDepths } from '../helpers/cache/intermentDepths.cache.js';
import { getCachedServiceTypes } from '../helpers/cache/serviceTypes.cache.js';
import { getCachedSettingValue } from '../helpers/cache/settings.cache.js';
import { getCachedWorkOrderMilestoneTypes } from '../helpers/cache/workOrderMilestoneTypes.cache.js';
import { getCachedWorkOrderTypes } from '../helpers/cache/workOrderTypes.cache.js';
import * as configFunctions from '../helpers/config.helpers.js';
import { useTestDatabases } from '../helpers/database.helpers.js';
import dataLists from '../helpers/dataLists.js';
import { i18next } from '../helpers/i18n.helpers.js';
import * as printFunctions from '../helpers/print.helpers.js';
import { getCsrfSecret } from '../helpers/settings.helpers.js';
import packageJson from '../package.json' with { type: 'json' };
import routerAdmin from '../routes/admin.js';
import routerApi from '../routes/api.js';
import routerBurialSites from '../routes/burialSites.js';
import routerCemeteries from '../routes/cemeteries.js';
import routerContracts from '../routes/contracts.js';
import routerDashboard from '../routes/dashboard.js';
import routerFuneralHomes from '../routes/funeralHomes.js';
import routerLogin from '../routes/login.js';
import routerPrint from '../routes/print.js';
import routerReports from '../routes/reports.js';
import routerWorkOrders from '../routes/workOrders.js';
export const version = packageJson.version;
const debug = Debug(`${DEBUG_NAMESPACE}:app:${process.pid.toString().padEnd(PROCESS_ID_MAX_DIGITS)}`);
const sessionCookieName = configFunctions.getConfigProperty('session.cookieName');
function hasSession(request) {
    return (Object.hasOwn(request.session, 'user') &&
        Object.hasOwn(request.cookies, sessionCookieName));
}
export const app = express();
app.use((request, _response, next) => {
    debug(`${request.method} ${request.url}`);
    next();
});
app.set('views', 'views').set('view engine', 'ejs');
app.disable('x-powered-by');
if (!configFunctions.getConfigProperty('reverseProxy.disableEtag')) {
    app.set('etag', false);
}
if (!configFunctions.getConfigProperty('reverseProxy.disableCompression')) {
    app.use(compression());
}
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(i18nextMiddleware.handle(i18next));
const urlPrefix = configFunctions.getConfigProperty('reverseProxy.urlPrefix');
if (urlPrefix !== '') {
    debug(`urlPrefix = ${urlPrefix}`);
    app.all('', (_request, response) => {
        response.redirect(urlPrefix);
    });
}
if (!configFunctions.getConfigProperty('reverseProxy.disableRateLimit')) {
    app.use(rateLimit({
        limit: useTestDatabases ? 1_000_000 : 2000,
        windowMs: millisecondsInOneMinute
    }));
}
app
    .use(urlPrefix, express.static('public'))
    .use(`${urlPrefix}/locales`, express.static('locales'))
    .use(`${urlPrefix}/lib/bulma`, express.static('node_modules/bulma/css'))
    .use(`${urlPrefix}/lib/cityssm-bulma-js/bulma-js.js`, express.static('node_modules/@cityssm/bulma-js/dist/bulma-js.js'))
    .use(`${urlPrefix}/lib/cityssm-fa-glow/fa-glow.min.css`, express.static('node_modules/@cityssm/fa-glow/fa-glow.min.css'))
    .use(`${urlPrefix}/lib/cityssm-bulma-sticky-table/bulma-with-sticky-table.css`, express.static('node_modules/@cityssm/bulma-sticky-table/bulma-with-sticky-table.css'))
    .use(`${urlPrefix}/lib/cityssm-bulma-webapp-js/cityssm.js`, express.static('node_modules/@cityssm/bulma-webapp-js/dist/cityssm.js'))
    .use(`${urlPrefix}/lib/fa/js/all.min.js`, express.static('node_modules/@fortawesome/fontawesome-free/js/all.min.js'))
    .use(`${urlPrefix}/lib/fa/css/all.min.css`, express.static('node_modules/@fortawesome/fontawesome-free/css/all.min.css'))
    .use(`${urlPrefix}/lib/i18next/i18next.min.js`, express.static('node_modules/i18next/dist/umd/i18next.min.js'))
    .use(`${urlPrefix}/lib/i18next-http-backend/i18nextHttpBackend.min.js`, express.static('node_modules/i18next-http-backend/i18nextHttpBackend.min.js'))
    .use(`${urlPrefix}/lib/leaflet`, express.static('node_modules/leaflet/dist'));
const FileStoreSession = FileStore(session);
app.use(session({
    name: sessionCookieName,
    cookie: {
        maxAge: configFunctions.getConfigProperty('session.maxAgeMillis'),
        sameSite: 'strict'
    },
    secret: configFunctions.getConfigProperty('session.secret'),
    store: new FileStoreSession({
        logFn: Debug(`${DEBUG_NAMESPACE}:session:${process.pid.toString().padEnd(PROCESS_ID_MAX_DIGITS)}`),
        path: './data/sessions',
        retries: 20
    }),
    resave: true,
    rolling: true,
    saveUninitialized: false
}));
const sessionCheckHandler = (request, response, next) => {
    if (hasSession(request)) {
        next();
        return;
    }
    response.clearCookie(sessionCookieName);
    const redirectUrl = getSafeRedirectUrl(request.originalUrl);
    response.redirect(`${urlPrefix}/login?redirect=${encodeURIComponent(redirectUrl)}`);
};
app.use(`${urlPrefix}/public-internal`, (request, response, next) => {
    if (hasSession(request)) {
        next();
        return;
    }
    response.sendStatus(403);
}, express.static(path.join(configFunctions.getConfigProperty('settings.customizationsPath'), 'public-internal'), {}));
app.use((request, response, next) => {
    response.locals.buildNumber = version;
    response.locals.user = request.session.user;
    response.locals.configFunctions = configFunctions;
    response.locals.printFunctions = printFunctions;
    response.locals.dateTimeFunctions = dateTimeFunctions;
    response.locals.settingFunctions = {
        getSettingValue: getCachedSettingValue
    };
    response.locals.dataLists = dataLists;
    response.locals.urlPrefix = urlPrefix;
    const workOrderTypesCount = getCachedWorkOrderTypes().length;
    const workOrderMilestoneTypesCount = getCachedWorkOrderMilestoneTypes().length;
    const committalTypesCount = getCachedCommittalTypes().length;
    const serviceTypesCount = getCachedServiceTypes().length;
    const intermentContainerTypesCount = getCachedIntermentContainerTypes().length;
    const intermentDepthsCount = getCachedIntermentDepths().length;
    const burialSiteStatusesCount = getCachedBurialSiteStatuses().length;
    response.locals.configCounts = {
        burialSiteTypes: getCachedBurialSiteTypes().length,
        contractTypes: getCachedContractTypes().length,
        workOrderTypes: workOrderTypesCount,
        workOrderMilestoneTypes: workOrderMilestoneTypesCount,
        committalTypes: committalTypesCount,
        serviceTypes: serviceTypesCount,
        intermentContainerTypes: intermentContainerTypesCount,
        intermentDepths: intermentDepthsCount,
        burialSiteStatuses: burialSiteStatusesCount,
        configTables: Math.min(workOrderTypesCount, workOrderMilestoneTypesCount, committalTypesCount, serviceTypesCount, intermentContainerTypesCount, intermentDepthsCount, burialSiteStatusesCount)
    };
    response.locals.t = request.t;
    response.locals.i18n = request.i18n;
    response.locals.lng = request.language;
    next();
});
const loginAbuseCheck = abuseCheck({
    byIP: !configFunctions.getConfigProperty('reverseProxy.trafficIsForwarded'),
    byXForwardedFor: configFunctions.getConfigProperty('reverseProxy.trafficIsForwarded'),
    abusePoints: 1,
    abusePointsMax: 5,
    clearIntervalMillis: millisecondsInOneHour,
    expiryMillis: minutesToMillis(5),
    abuseMessageText: 'Too many login attempts. Please try again later.'
});
exitHook(() => {
    shutdownAbuseCheck();
});
app.use(`${urlPrefix}/login`, loginAbuseCheck, routerLogin);
app.get(`${urlPrefix}/logout`, (request, response) => {
    if (hasSession(request)) {
        request.session.destroy(() => {
            clearAbuse(request);
            response.clearCookie(sessionCookieName);
            response.redirect(`${urlPrefix}/`);
        });
    }
    else {
        response.redirect(`${urlPrefix}/login`);
    }
});
const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: (_request) => getCsrfSecret(),
    getSessionIdentifier: (request) => request.session.id
});
app.use(doubleCsrfProtection);
app.use((request, response, next) => {
    response.locals.csrfToken = generateCsrfToken(request, response);
    next();
});
app.get(`${urlPrefix}/`, sessionCheckHandler, (_request, response) => {
    response.redirect(`${urlPrefix}/dashboard`);
});
app
    .use(`${urlPrefix}/dashboard`, sessionCheckHandler, routerDashboard)
    .use(`${urlPrefix}/print`, sessionCheckHandler, routerPrint)
    .use(`${urlPrefix}/cemeteries`, sessionCheckHandler, routerCemeteries)
    .use(`${urlPrefix}/burialSites`, sessionCheckHandler, routerBurialSites)
    .use(`${urlPrefix}/funeralHomes`, sessionCheckHandler, routerFuneralHomes)
    .use(`${urlPrefix}/contracts`, sessionCheckHandler, routerContracts)
    .use(`${urlPrefix}/workOrders`, sessionCheckHandler, routerWorkOrders)
    .use(`${urlPrefix}/reports`, sessionCheckHandler, routerReports);
app.use(`${urlPrefix}/api/:apiKey`, permissionHandlers.apiGetHandler, routerApi);
app.use(`${urlPrefix}/admin`, sessionCheckHandler, permissionHandlers.adminGetHandler, routerAdmin);
if (configFunctions.getConfigProperty('session.doKeepAlive')) {
    app.all(`${urlPrefix}/keepAlive`, (request, response) => {
        response.json({
            activeSession: request.session.user !== undefined
        });
    });
}
app.use((_request, _response, next) => {
    next(createError(404));
});
app.use((error, request, response, _next) => {
    response.locals.message = error.message;
    response.locals.error =
        request.app.get('env') === 'development' ? error : {};
    response.locals.configFunctions = configFunctions;
    response.locals.urlPrefix = configFunctions.getConfigProperty('reverseProxy.urlPrefix');
    response.status(error.status ?? 500);
    response.render('error');
});
export default app;
export { shutdown as shutdownAbuseCheck } from '@cityssm/express-abuse-points';
