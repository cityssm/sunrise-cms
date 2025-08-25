import path from 'node:path'

import { secondsToMillis } from '@cityssm/to-millis'
import * as dateTimeFunctions from '@cityssm/utils-datetime'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import csurf from 'csurf'
import Debug from 'debug'
import express from 'express'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import createError from 'http-errors'
import FileStore from 'session-file-store'

import dataLists from './data/dataLists.js'
import { DEBUG_NAMESPACE } from './debug.config.js'
import * as permissionHandlers from './handlers/permissions.js'
import { getSafeRedirectURL } from './helpers/authentication.helpers.js'
import { getCachedSettingValue } from './helpers/cache/settings.cache.js'
import * as configFunctions from './helpers/config.helpers.js'
import { useTestDatabases } from './helpers/database.helpers.js'
import * as printFunctions from './helpers/print.helpers.js'
import routerAdmin from './routes/admin.js'
import routerApi from './routes/api.js'
import routerBurialSites from './routes/burialSites.js'
import routerCemeteries from './routes/cemeteries.js'
import routerContracts from './routes/contracts.js'
import routerDashboard from './routes/dashboard.js'
import routerFuneralHomes from './routes/funeralHomes.js'
import routerLogin from './routes/login.js'
import routerPrint from './routes/print.js'
import routerReports from './routes/reports.js'
import routerWorkOrders from './routes/workOrders.js'
import { version } from './version.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:app:${process.pid.toString().padEnd(5)}`
)

/*
 * INITIALIZE APP
 */

export const app = express()

app.disable('x-powered-by')

if (!configFunctions.getConfigProperty('reverseProxy.disableEtag')) {
  app.set('etag', false)
}

// View engine setup
app.set('views', 'views')
app.set('view engine', 'ejs')

if (!configFunctions.getConfigProperty('reverseProxy.disableCompression')) {
  app.use(compression())
}

app.use((request, _response, next) => {
  debug(`${request.method} ${request.url}`)
  next()
})

app.use(express.json())

app.use(
  express.urlencoded({
    extended: false
  })
)

app.use(cookieParser())
app.use(
  // eslint-disable-next-line sonarjs/insecure-cookie, sonarjs/cookie-no-httponly
  csurf({
    cookie: true
  })
)

/*
 * Rate Limiter
 */

if (configFunctions.getConfigProperty('reverseProxy.disableRateLimit')) {
  app.use(
    rateLimit({
      limit: useTestDatabases ? 1_000_000 : 200,
      windowMs: secondsToMillis(10)
    })
  )
}

/*
 * SESSION MANAGEMENT
 */

const sessionCookieName: string =
  configFunctions.getConfigProperty('session.cookieName')

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
        `${DEBUG_NAMESPACE}:session:${process.pid.toString().padEnd(5)}`
      ),
      path: './data/sessions',
      retries: 20
    }),

    resave: true,
    rolling: true,
    saveUninitialized: false
  })
)

// Clear cookie if no corresponding session
app.use((request, response, next) => {
  if (
    Object.hasOwn(request.cookies, sessionCookieName) &&
    !Object.hasOwn(request.session, 'user')
  ) {
    response.clearCookie(sessionCookieName)
  }

  next()
})

/*
 * STATIC ROUTES
 */

const urlPrefix = configFunctions.getConfigProperty('reverseProxy.urlPrefix')

if (urlPrefix !== '') {
  debug(`urlPrefix = ${urlPrefix}`)

  app.all('', (_request, response) => {
    response.redirect(urlPrefix)
  })
}

app.use(
  `${urlPrefix}/public-internal`,
  (request, response, next) => {
    if (
      Object.hasOwn(request.session, 'user') &&
      Object.hasOwn(request.cookies, sessionCookieName)
    ) {
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

app.use(urlPrefix, express.static('public'))

app.use(`${urlPrefix}/lib/bulma`, express.static('node_modules/bulma/css'))

app.use(
  `${urlPrefix}/lib/bulma-tooltip`,
  express.static('node_modules/bulma-tooltip/dist/css')
)

app.use(
  `${urlPrefix}/lib/cityssm-bulma-js/bulma-js.js`,
  express.static('node_modules/@cityssm/bulma-js/dist/bulma-js.js')
)

app.use(
  `${urlPrefix}/lib/cityssm-fa-glow`,
  express.static('node_modules/@cityssm/fa-glow')
)

app.use(
  `${urlPrefix}/lib/cityssm-bulma-sticky-table`,
  express.static('node_modules/@cityssm/bulma-sticky-table')
)

app.use(
  `${urlPrefix}/lib/cityssm-bulma-webapp-js`,
  express.static('node_modules/@cityssm/bulma-webapp-js/dist')
)

app.use(
  `${urlPrefix}/lib/fa`,
  express.static('node_modules/@fortawesome/fontawesome-free')
)

app.use(`${urlPrefix}/lib/leaflet`, express.static('node_modules/leaflet/dist'))

app.use(
  `${urlPrefix}/lib/randomcolor/randomColor.js`,
  express.static('node_modules/randomcolor/randomColor.js')
)

/*
 * ROUTES
 */

function hasSession(request: express.Request): boolean {
  return (
    Object.hasOwn(request.session, 'user') &&
    Object.hasOwn(request.cookies, sessionCookieName)
  )
}

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

  const redirectUrl = getSafeRedirectURL(request.originalUrl)

  response.redirect(
    `${urlPrefix}/login?redirect=${encodeURIComponent(redirectUrl)}`
  )
}

// Make the user and config objects available to the templates

app.use((request, response, next) => {
  response.locals.buildNumber = version

  response.locals.user = request.session.user
  response.locals.csrfToken = request.csrfToken()

  response.locals.configFunctions = configFunctions
  response.locals.printFunctions = printFunctions
  response.locals.dateTimeFunctions = dateTimeFunctions

  response.locals.settingFunctions = {
    getSettingValue: getCachedSettingValue
  }

  response.locals.dataLists = dataLists

  response.locals.urlPrefix = configFunctions.getConfigProperty(
    'reverseProxy.urlPrefix'
  )

  response.locals.enableKeyboardShortcuts = configFunctions.getConfigProperty(
    'settings.enableKeyboardShortcuts'
  )

  next()
})

app.get(`${urlPrefix}/`, sessionCheckHandler, (_request, response) => {
  response.redirect(`${urlPrefix}/dashboard`)
})

app.use(`${urlPrefix}/dashboard`, sessionCheckHandler, routerDashboard)

app.use(`${urlPrefix}/api/:apiKey`, permissionHandlers.apiGetHandler, routerApi)

app.use(`${urlPrefix}/print`, sessionCheckHandler, routerPrint)
app.use(`${urlPrefix}/cemeteries`, sessionCheckHandler, routerCemeteries)
app.use(`${urlPrefix}/burialSites`, sessionCheckHandler, routerBurialSites)
app.use(`${urlPrefix}/funeralHomes`, sessionCheckHandler, routerFuneralHomes)
app.use(`${urlPrefix}/contracts`, sessionCheckHandler, routerContracts)
app.use(`${urlPrefix}/workOrders`, sessionCheckHandler, routerWorkOrders)
app.use(`${urlPrefix}/reports`, sessionCheckHandler, routerReports)

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

app.use(`${urlPrefix}/login`, routerLogin)

app.get(`${urlPrefix}/logout`, (request, response) => {
  if (
    Object.hasOwn(request.session, 'user') &&
    Object.hasOwn(request.cookies, sessionCookieName)
  ) {
    request.session.destroy(() => {
      response.clearCookie(sessionCookieName)
      response.redirect(`${urlPrefix}/`)
    })
  } else {
    response.redirect(`${urlPrefix}/login`)
  }
})

// Catch 404 and forward to error handler
app.use((request, _response, next) => {
  debug(request.url)
  next(createError(404, `File not found: ${request.url}`))
})

export default app
