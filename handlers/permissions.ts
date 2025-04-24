import type { NextFunction, Request, Response } from 'express'

import { getConfigProperty } from '../helpers/config.helpers.js'
import {
  apiKeyIsValid,
  userCanUpdate,
  userCanUpdateWorkOrders,
  userIsAdmin
} from '../helpers/functions.user.js'

const urlPrefix = getConfigProperty('reverseProxy.urlPrefix')

const forbiddenStatus = 403

const forbiddenJSON = {
  message: 'Forbidden',
  success: false
}

const forbiddenRedirectURL = `${urlPrefix}/dashboard/?error=accessDenied`

export function adminGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userIsAdmin(request)) {
    next()
    return
  }

  response.redirect(forbiddenRedirectURL)
}

export function adminPostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userIsAdmin(request)) {
    next()
    return
  }

  response.status(forbiddenStatus).json(forbiddenJSON)
}

export async function apiGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  if (await apiKeyIsValid(request)) {
    next()
  } else {
    response.redirect(`${urlPrefix}/login`)
  }
}

export function updateGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userCanUpdate(request)) {
    next()
    return
  }

  response.redirect(forbiddenRedirectURL)
}

export function updatePostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userCanUpdate(request)) {
    next()
    return
  }

  response.status(forbiddenStatus).json(forbiddenJSON)
}

export function updateWorkOrdersGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userCanUpdateWorkOrders(request)) {
    next()
    return
  }

  response.redirect(forbiddenRedirectURL)
}

export function updateWorkOrdersPostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userCanUpdateWorkOrders(request)) {
    next()
    return
  }

  response.status(forbiddenStatus).json(forbiddenJSON)
}