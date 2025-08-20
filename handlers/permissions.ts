import type { NextFunction, Request, Response } from 'express'

import { getConfigProperty } from '../helpers/config.helpers.js'
import {
  apiKeyIsValid,
  userCanUpdateCemeteries,
  userCanUpdateContracts,
  userCanUpdateWorkOrders,
  userIsAdmin
} from '../helpers/user.helpers.js'

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

export function apiGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (apiKeyIsValid(request)) {
    next()
  } else {
    response.redirect(`${urlPrefix}/login`)
  }
}

export function updateCemeteriesGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userCanUpdateCemeteries(request)) {
    next()
    return
  }

  response.redirect(forbiddenRedirectURL)
}

export function updateCemeteriesPostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userCanUpdateCemeteries(request)) {
    next()
    return
  }

  response.status(forbiddenStatus).json(forbiddenJSON)
}

export function updateContractsGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userCanUpdateContracts(request)) {
    next()
    return
  }

  response.redirect(forbiddenRedirectURL)
}

export function updateContractsPostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userCanUpdateContracts(request)) {
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
