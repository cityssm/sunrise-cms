import { clearAbuse, recordAbuse } from '@cityssm/express-abuse-points'
import { type Request, type Response, Router } from 'express'

import {
  authenticate,
  getSafeRedirectUrl
} from '../helpers/authentication.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { useTestDatabases } from '../helpers/database.helpers.js'
import { getUser } from '../helpers/user.helpers.js'

export const router = Router()

function getHandler(request: Request, response: Response): void {
  const sessionCookieName = getConfigProperty('session.cookieName')

  if (
    request.session.user !== undefined &&
    request.cookies[sessionCookieName] !== undefined
  ) {
    const redirectUrl = getSafeRedirectUrl(
      (request.query.redirect ?? '') as string
    )

    response.redirect(redirectUrl)
  } else {
    response.render('login', {
      message: '',
      redirect: request.query.redirect,
      userName: '',
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
  const username =
    typeof request.body.userName === 'string' ? request.body.userName : ''

  const passwordPlain =
    typeof request.body.password === 'string' ? request.body.password : ''

  const unsafeRedirectUrl = request.body.redirect

  const redirectUrl = getSafeRedirectUrl(
    typeof unsafeRedirectUrl === 'string' ? unsafeRedirectUrl : ''
  )

  /*
   * Authenticate User
   */

  const isAuthenticated = await authenticate(username, passwordPlain)

  /*
   * Get User Object
   */

  let userObject: User | undefined

  if (isAuthenticated) {
    userObject = getUser(username)
  }

  if (isAuthenticated && userObject !== undefined) {
    clearAbuse(request as unknown as Express.Request)

    request.session.user = userObject

    response.redirect(redirectUrl)
  } else {
    recordAbuse(request as unknown as Express.Request)

    response.render('login', {
      message: 'Login Failed',
      redirect: redirectUrl,
      userName: username,
      useTestDatabases
    })
  }
}

router.route('/').get(getHandler).post(postHandler)

export default router
