import type { NextFunction, Request, Response } from 'express'

import { getConfigProperty } from '../helpers/config.helpers.js'
import {
  canUserUpdateCemeteries,
  canUserUpdateContracts,
  canUserUpdateWorkOrders,
  isApiKeyValid,
  isUserAdmin
} from '../helpers/user.helpers.js'

const urlPrefix = getConfigProperty('reverseProxy.urlPrefix')

const forbiddenStatus = 403

const forbiddenJSON = {
  message: 'Forbidden',
  success: false
}

const forbiddenRedirectUrl = `${urlPrefix}/dashboard/?error=accessDenied`

export function adminGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (isUserAdmin(request)) {
    next()
    return
  }

  response.redirect(forbiddenRedirectUrl)
}

export function adminPostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (isUserAdmin(request)) {
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
  if (isApiKeyValid(request)) {
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
  if (canUserUpdateCemeteries(request)) {
    next()
    return
  }

  response.redirect(forbiddenRedirectUrl)
}

export function updateCemeteriesPostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (canUserUpdateCemeteries(request)) {
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
  if (canUserUpdateContracts(request)) {
    next()
    return
  }

  response.redirect(forbiddenRedirectUrl)
}

export function updateContractsPostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (canUserUpdateContracts(request)) {
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
  if (canUserUpdateWorkOrders(request)) {
    next()
    return
  }

  response.redirect(forbiddenRedirectUrl)
}

export function updateWorkOrdersPostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (canUserUpdateWorkOrders(request)) {
    next()
    return
  }

  response.status(forbiddenStatus).json(forbiddenJSON)
}
