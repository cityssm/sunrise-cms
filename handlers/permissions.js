import { getConfigProperty } from '../helpers/config.helpers.js';
import { apiKeyIsValid, userCanUpdateCemeteries, userCanUpdateContracts, userCanUpdateWorkOrders, userIsAdmin } from '../helpers/user.helpers.js';
const urlPrefix = getConfigProperty('reverseProxy.urlPrefix');
const forbiddenStatus = 403;
const forbiddenJSON = {
    message: 'Forbidden',
    success: false
};
const forbiddenRedirectURL = `${urlPrefix}/dashboard/?error=accessDenied`;
export function adminGetHandler(request, response, next) {
    if (userIsAdmin(request)) {
        next();
        return;
    }
    response.redirect(forbiddenRedirectURL);
}
export function adminPostHandler(request, response, next) {
    if (userIsAdmin(request)) {
        next();
        return;
    }
    response.status(forbiddenStatus).json(forbiddenJSON);
}
export function apiGetHandler(request, response, next) {
    if (apiKeyIsValid(request)) {
        next();
    }
    else {
        response.redirect(`${urlPrefix}/login`);
    }
}
export function updateCemeteriesGetHandler(request, response, next) {
    if (userCanUpdateCemeteries(request)) {
        next();
        return;
    }
    response.redirect(forbiddenRedirectURL);
}
export function updateCemeteriesPostHandler(request, response, next) {
    if (userCanUpdateCemeteries(request)) {
        next();
        return;
    }
    response.status(forbiddenStatus).json(forbiddenJSON);
}
export function updateContractsGetHandler(request, response, next) {
    if (userCanUpdateContracts(request)) {
        next();
        return;
    }
    response.redirect(forbiddenRedirectURL);
}
export function updateContractsPostHandler(request, response, next) {
    if (userCanUpdateContracts(request)) {
        next();
        return;
    }
    response.status(forbiddenStatus).json(forbiddenJSON);
}
export function updateWorkOrdersGetHandler(request, response, next) {
    if (userCanUpdateWorkOrders(request)) {
        next();
        return;
    }
    response.redirect(forbiddenRedirectURL);
}
export function updateWorkOrdersPostHandler(request, response, next) {
    if (userCanUpdateWorkOrders(request)) {
        next();
        return;
    }
    response.status(forbiddenStatus).json(forbiddenJSON);
}
