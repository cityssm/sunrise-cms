import { getConfigProperty } from '../helpers/config.helpers.js';
import { canUserUpdateCemeteries, canUserUpdateContracts, canUserUpdateWorkOrders, isApiKeyValid, isUserAdmin } from '../helpers/user.helpers.js';
const urlPrefix = getConfigProperty('reverseProxy.urlPrefix');
const forbiddenStatus = 403;
const forbiddenJSON = {
    message: 'Forbidden',
    success: false
};
const forbiddenRedirectUrl = `${urlPrefix}/dashboard/?error=accessDenied`;
export function adminGetHandler(request, response, next) {
    if (isUserAdmin(request)) {
        next();
        return;
    }
    response.redirect(forbiddenRedirectUrl);
}
export function adminPostHandler(request, response, next) {
    if (isUserAdmin(request)) {
        next();
        return;
    }
    response.status(forbiddenStatus).json(forbiddenJSON);
}
export function apiGetHandler(request, response, next) {
    if (isApiKeyValid(request)) {
        next();
    }
    else {
        response.redirect(`${urlPrefix}/login`);
    }
}
export function updateCemeteriesGetHandler(request, response, next) {
    if (canUserUpdateCemeteries(request)) {
        next();
        return;
    }
    response.redirect(forbiddenRedirectUrl);
}
export function updateCemeteriesPostHandler(request, response, next) {
    if (canUserUpdateCemeteries(request)) {
        next();
        return;
    }
    response.status(forbiddenStatus).json(forbiddenJSON);
}
export function updateContractsGetHandler(request, response, next) {
    if (canUserUpdateContracts(request)) {
        next();
        return;
    }
    response.redirect(forbiddenRedirectUrl);
}
export function updateContractsPostHandler(request, response, next) {
    if (canUserUpdateContracts(request)) {
        next();
        return;
    }
    response.status(forbiddenStatus).json(forbiddenJSON);
}
export function updateWorkOrdersGetHandler(request, response, next) {
    if (canUserUpdateWorkOrders(request)) {
        next();
        return;
    }
    response.redirect(forbiddenRedirectUrl);
}
export function updateWorkOrdersPostHandler(request, response, next) {
    if (canUserUpdateWorkOrders(request)) {
        next();
        return;
    }
    response.status(forbiddenStatus).json(forbiddenJSON);
}
