import Debug from 'debug';
import { Router } from 'express';
import { useTestDatabases } from '../data/databasePaths.js';
import { getApiKey } from '../helpers/functions.api.js';
import * as authenticationFunctions from '../helpers/functions.authentication.js';
import * as configFunctions from '../helpers/functions.config.js';
const debug = Debug('lot-occupancy-system:login');
export const router = Router();
function getHandler(request, response) {
    const sessionCookieName = configFunctions.getProperty('session.cookieName');
    if (request.session.user !== undefined &&
        request.cookies[sessionCookieName] !== undefined) {
        const redirectURL = authenticationFunctions.getSafeRedirectURL((request.query.redirect ?? ''));
        response.redirect(redirectURL);
    }
    else {
        response.render('login', {
            userName: '',
            message: '',
            redirect: request.query.redirect,
            useTestDatabases
        });
    }
}
async function postHandler(request, response) {
    const userName = (typeof request.body.userName === 'string' ? request.body.userName : '');
    const passwordPlain = (typeof request.body.password === 'string' ? request.body.password : '');
    const unsafeRedirectURL = request.body.redirect;
    const redirectURL = authenticationFunctions.getSafeRedirectURL(typeof unsafeRedirectURL === 'string' ? unsafeRedirectURL : '');
    let isAuthenticated = false;
    if (userName.charAt(0) === '*') {
        if (useTestDatabases && userName === passwordPlain) {
            isAuthenticated = configFunctions
                .getProperty('users.testing')
                .includes(userName);
            if (isAuthenticated) {
                debug('Authenticated testing user: ' + userName);
            }
        }
    }
    else if (userName !== '' && passwordPlain !== '') {
        isAuthenticated = await authenticationFunctions.authenticate(userName, passwordPlain);
    }
    let userObject;
    if (isAuthenticated) {
        const userNameLowerCase = userName.toLowerCase();
        const canLogin = configFunctions
            .getProperty('users.canLogin')
            .some((currentUserName) => {
            return userNameLowerCase === currentUserName.toLowerCase();
        });
        if (canLogin) {
            const canUpdate = configFunctions
                .getProperty('users.canUpdate')
                .some((currentUserName) => {
                return userNameLowerCase === currentUserName.toLowerCase();
            });
            const isAdmin = configFunctions
                .getProperty('users.isAdmin')
                .some((currentUserName) => {
                return userNameLowerCase === currentUserName.toLowerCase();
            });
            const apiKey = await getApiKey(userNameLowerCase);
            userObject = {
                userName: userNameLowerCase,
                userProperties: {
                    canUpdate,
                    isAdmin,
                    apiKey
                }
            };
        }
    }
    if (isAuthenticated && userObject !== undefined) {
        request.session.user = userObject;
        response.redirect(redirectURL);
    }
    else {
        response.render('login', {
            userName,
            message: 'Login Failed',
            redirect: redirectURL,
            useTestDatabases
        });
    }
}
router
    .route('/')
    .get(getHandler)
    .post(postHandler);
export default router;
