import Debug from 'debug'
import { type Request, type Response, Router } from 'express'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import {
  authenticate,
  getSafeRedirectURL
} from '../helpers/authentication.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { useTestDatabases } from '../helpers/database.helpers.js'
import { getUser } from '../helpers/functions.user.js'

const debug = Debug(`${DEBUG_NAMESPACE}:login`)

export const router = Router()

function getHandler(request: Request, response: Response): void {
  const sessionCookieName = getConfigProperty('session.cookieName')

  if (
    request.session.user !== undefined &&
    request.cookies[sessionCookieName] !== undefined
  ) {
    const redirectURL = getSafeRedirectURL(
      (request.query.redirect ?? '') as string
    )

    response.redirect(redirectURL)
  } else {
    response.render('login', {
      userName: '',
      message: '',
      redirect: request.query.redirect,
      useTestDatabases
    })
  }
}

async function postHandler(
  request: Request<
    unknown,
    unknown,
    { password: string; redirect: string; userName: string }
  >,
  response: Response
): Promise<void> {
  const userName =
    typeof request.body.userName === 'string' ? request.body.userName : ''

  const passwordPlain =
    typeof request.body.password === 'string' ? request.body.password : ''

  const unsafeRedirectURL = request.body.redirect

  const redirectURL = getSafeRedirectURL(
    typeof unsafeRedirectURL === 'string' ? unsafeRedirectURL : ''
  )

  let isAuthenticated = false

  if (userName.startsWith('*')) {
    if (useTestDatabases && userName === passwordPlain) {
      isAuthenticated = getConfigProperty('users.testing').includes(userName)

      if (isAuthenticated) {
        debug(`Authenticated testing user: ${userName}`)
      }
    }
  } else if (userName !== '' && passwordPlain !== '') {
    isAuthenticated = await authenticate(userName, passwordPlain)
  }

  let userObject: User | undefined

  if (isAuthenticated) {
    userObject = getUser(userName)
  }

  if (isAuthenticated && userObject !== undefined) {
    request.session.user = userObject

    response.redirect(redirectURL)
  } else {
    response.render('login', {
      message: 'Login Failed',
      redirect: redirectURL,
      userName,
      useTestDatabases
    })
  }
}

router.route('/').get(getHandler).post(postHandler)

export default router
