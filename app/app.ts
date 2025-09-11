import path from 'node:path'

import {
  abuseCheck,
  clearAbuse,
  shutdown as shutdownAbuseCheck
} from '@cityssm/express-abuse-points'
import {
  millisecondsInOneHour,
  millisecondsInOneMinute,
  minutesToMillis
} from '@cityssm/to-millis'
import * as dateTimeFunctions from '@cityssm/utils-datetime'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { doubleCsrf } from 'csrf-csrf'
import Debug from 'debug'
import exitHook from 'exit-hook'
import express from 'express'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import createError, { type HttpError } from 'http-errors'
import FileStore from 'session-file-store'

import { DEBUG_NAMESPACE, PROCESS_ID_MAX_DIGITS } from '../debug.config.js'
import * as permissionHandlers from '../handlers/permissions.js'
import { getSafeRedirectUrl } from '../helpers/authentication.helpers.js'
import { getCachedSettingValue } from '../helpers/cache/settings.cache.js'
import * as configFunctions from '../helpers/config.helpers.js'
import { useTestDatabases } from '../helpers/database.helpers.js'
import dataLists from '../helpers/dataLists.js'
import * as printFunctions from '../helpers/print.helpers.js'
import { getCsrfSecret } from '../helpers/settings.helpers.js'
import routerAdmin from '../routes/admin.js'
import routerApi from '../routes/api.js'
import routerBurialSites from '../routes/burialSites.js'
import routerCemeteries from '../routes/cemeteries.js'
import routerContracts from '../routes/contracts.js'
import routerDashboard from '../routes/dashboard.js'
import routerFuneralHomes from '../routes/funeralHomes.js'
import routerLogin from '../routes/login.js'
import routerPrint from '../routes/print.js'
import routerReports from '../routes/reports.js'
import routerWorkOrders from '../routes/workOrders.js'
import { version } from '../version.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:app:${process.pid.toString().padEnd(PROCESS_ID_MAX_DIGITS)}`
)

const sessionCookieName =
  configFunctions.getConfigProperty('session.cookieName')

function hasSession(request: express.Request): boolean {
  return (
    Object.hasOwn(request.session, 'user') &&
    Object.hasOwn(request.cookies, sessionCookieName)
  )
}

/*
 * INITIALIZE APP
 */

export const app = express()

app.use((request, _response, next) => {
  debug(`${request.method} ${request.url}`)
  next()
})

/*
 * Configure Views
 */

app.set('views', 'views').set('view engine', 'ejs')

/*
 * Adjust headers
 */

app.disable('x-powered-by')

if (!configFunctions.getConfigProperty('reverseProxy.disableEtag')) {
  app.set('etag', false)
}

if (!configFunctions.getConfigProperty('reverseProxy.disableCompression')) {
  app.use(compression())
}

/*
 * Parsers
 */

app.use(express.json())

app.use(
  express.urlencoded({
    extended: false
  })
)

app.use(cookieParser())

/*
 * URL Prefix
 */

const urlPrefix = configFunctions.getConfigProperty('reverseProxy.urlPrefix')

if (urlPrefix !== '') {
  debug(`urlPrefix = ${urlPrefix}`)

  app.all('', (_request, response) => {
    response.redirect(urlPrefix)
  })
}

/*
 * Rate Limiter
 */

if (!configFunctions.getConfigProperty('reverseProxy.disableRateLimit')) {
  app.use(
    rateLimit({
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      limit: useTestDatabases ? 1_000_000 : 2000,
      windowMs: millisecondsInOneMinute
    })
  )
}

/*
 * Static content
 */

app.use(
  `${urlPrefix}/public-internal`,
  (request, response, next) => {
    if (hasSession(request)) {
      next()
      return
    }

    response.sendStatus(403)
  },
  express.static(
    path.join(
      configFunctions.getConfigProperty('settings.customizationsPath'),
      'public-internal'
    )
  )
)

app
  .use(urlPrefix, express.static('public'))
  .use(`${urlPrefix}/lib/bulma`, express.static('node_modules/bulma/css'))
  .use(
    `${urlPrefix}/lib/bulma-tooltip`,
    express.static('node_modules/bulma-tooltip/dist/css')
  )
  .use(
    `${urlPrefix}/lib/cityssm-bulma-js/bulma-js.js`,
    express.static('node_modules/@cityssm/bulma-js/dist/bulma-js.js')
  )
  .use(
    `${urlPrefix}/lib/cityssm-fa-glow`,
    express.static('node_modules/@cityssm/fa-glow')
  )
  .use(
    `${urlPrefix}/lib/cityssm-bulma-sticky-table`,
    express.static('node_modules/@cityssm/bulma-sticky-table')
  )
  .use(
    `${urlPrefix}/lib/cityssm-bulma-webapp-js`,
    express.static('node_modules/@cityssm/bulma-webapp-js/dist')
  )
  .use(
    `${urlPrefix}/lib/fa`,
    express.static('node_modules/@fortawesome/fontawesome-free')
  )
  .use(`${urlPrefix}/lib/leaflet`, express.static('node_modules/leaflet/dist'))

/*
 * SESSION MANAGEMENT
 */

const FileStoreSession = FileStore(session)

// Initialize session
app.use(
  session({
    name: sessionCookieName,

    cookie: {
      maxAge: configFunctions.getConfigProperty('session.maxAgeMillis'),
      sameSite: 'strict'
    },
    secret: configFunctions.getConfigProperty('session.secret'),
    store: new FileStoreSession({
      logFn: Debug(
        `${DEBUG_NAMESPACE}:session:${process.pid.toString().padEnd(PROCESS_ID_MAX_DIGITS)}`
      ),
      path: './data/sessions',
      retries: 20
    }),

    resave: true,
    rolling: true,
    saveUninitialized: false
  })
)

// Redirect logged in users
const sessionCheckHandler = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): void => {
  if (hasSession(request)) {
    next()
    return
  }

  response.clearCookie(sessionCookieName)

  const redirectUrl = getSafeRedirectUrl(request.originalUrl)

  response.redirect(
    `${urlPrefix}/login?redirect=${encodeURIComponent(redirectUrl)}`
  )
}

/*
 * Locals
 */

app.use((request, response, next) => {
  response.locals.buildNumber = version

  response.locals.user = request.session.user

  response.locals.configFunctions = configFunctions
  response.locals.printFunctions = printFunctions
  response.locals.dateTimeFunctions = dateTimeFunctions

  response.locals.settingFunctions = {
    getSettingValue: getCachedSettingValue
  }

  response.locals.dataLists = dataLists

  response.locals.urlPrefix = urlPrefix

  response.locals.enableKeyboardShortcuts = configFunctions.getConfigProperty(
    'settings.enableKeyboardShortcuts'
  )

  next()
})

/*
 * LOGIN / LOGOUT
 * Before CSRF Protection
 */

const loginAbuseCheck = abuseCheck({
  byIP: !configFunctions.getConfigProperty('reverseProxy.trafficIsForwarded'),
  byXForwardedFor: configFunctions.getConfigProperty(
    'reverseProxy.trafficIsForwarded'
  ),

  abusePoints: 1,
  abusePointsMax: 5,

  clearIntervalMillis: millisecondsInOneHour,

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  expiryMillis: minutesToMillis(5),

  abuseMessageText: 'Too many login attempts. Please try again later.'
})

exitHook(() => {
  shutdownAbuseCheck()
})

app.use(`${urlPrefix}/login`, loginAbuseCheck, routerLogin)

app.get(`${urlPrefix}/logout`, (request, response) => {
  if (hasSession(request)) {
    request.session.destroy(() => {
      clearAbuse(request as unknown as Express.Request)
      response.clearCookie(sessionCookieName)
      response.redirect(`${urlPrefix}/`)
    })
  } else {
    response.redirect(`${urlPrefix}/login`)
  }
})

/*
 * CSRF PROTECTION
 */

const {
  doubleCsrfProtection, // This is the default CSRF protection middleware.
  generateCsrfToken // Use this in your routes to provide a CSRF token.
} = doubleCsrf({
  getSecret: (_request) => getCsrfSecret(), // return a secret for the request
  getSessionIdentifier: (request) => request.session.id // return the requests unique identifier
})

app.use(doubleCsrfProtection)

/*
 * ROUTES
 */

app.use((request, response, next) => {
  response.locals.csrfToken = generateCsrfToken(request, response)

  next()
})

app.get(`${urlPrefix}/`, sessionCheckHandler, (_request, response) => {
  response.redirect(`${urlPrefix}/dashboard`)
})

app
  .use(`${urlPrefix}/dashboard`, sessionCheckHandler, routerDashboard)
  .use(`${urlPrefix}/print`, sessionCheckHandler, routerPrint)
  .use(`${urlPrefix}/cemeteries`, sessionCheckHandler, routerCemeteries)
  .use(`${urlPrefix}/burialSites`, sessionCheckHandler, routerBurialSites)
  .use(`${urlPrefix}/funeralHomes`, sessionCheckHandler, routerFuneralHomes)
  .use(`${urlPrefix}/contracts`, sessionCheckHandler, routerContracts)
  .use(`${urlPrefix}/workOrders`, sessionCheckHandler, routerWorkOrders)
  .use(`${urlPrefix}/reports`, sessionCheckHandler, routerReports)

app.use(`${urlPrefix}/api/:apiKey`, permissionHandlers.apiGetHandler, routerApi)

app.use(
  `${urlPrefix}/admin`,
  sessionCheckHandler,
  permissionHandlers.adminGetHandler,
  routerAdmin
)

if (configFunctions.getConfigProperty('session.doKeepAlive')) {
  app.all(`${urlPrefix}/keepAlive`, (request, response) => {
    response.json({
      activeSession: request.session.user !== undefined
    })
  })
}

/*
 * Error handling
 */

// Catch 404 and forward to error handler
app.use(
  (
    _request: express.Request,
    _response: express.Response,
    next: express.NextFunction
  ) => {
    next(createError(404))
  }
)

// Error handler
app.use(
  (
    error: Partial<HttpError>,
    request: express.Request,
    response: express.Response,
    _next: express.NextFunction
  ) => {
    // Set locals, only providing error in development
    response.locals.message = error.message
    response.locals.error =
      request.app.get('env') === 'development' ? error : {}

    response.locals.configFunctions = configFunctions
    response.locals.urlPrefix = configFunctions.getConfigProperty(
      'reverseProxy.urlPrefix'
    )

    // Render the error page
    response.status(error.status ?? 500)
    response.render('error')
  }
)

export default app

export { shutdown as shutdownAbuseCheck } from '@cityssm/express-abuse-points'
