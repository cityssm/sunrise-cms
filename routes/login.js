import Debug from 'debug';
import { Router } from 'express';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { useTestDatabases } from '../helpers/database.helpers.js';
import { getApiKey } from '../helpers/functions.api.js';
import { authenticate, getSafeRedirectURL } from '../helpers/functions.authentication.js';
const debug = Debug(`${DEBUG_NAMESPACE}:login`);
export const router = Router();
function getHandler(request, response) {
    const sessionCookieName = getConfigProperty('session.cookieName');
    if (request.session.user !== undefined &&
        request.cookies[sessionCookieName] !== undefined) {
        const redirectURL = getSafeRedirectURL((request.query.redirect ?? ''));
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
    const redirectURL = getSafeRedirectURL(typeof unsafeRedirectURL === 'string' ? unsafeRedirectURL : '');
    let isAuthenticated = false;
    if (userName.startsWith('*')) {
        if (useTestDatabases && userName === passwordPlain) {
            isAuthenticated = getConfigProperty('users.testing').includes(userName);
            if (isAuthenticated) {
                debug(`Authenticated testing user: ${userName}`);
            }
        }
    }
    else if (userName !== '' && passwordPlain !== '') {
        isAuthenticated = await authenticate(userName, passwordPlain);
    }
    let userObject;
    if (isAuthenticated) {
        const userNameLowerCase = userName.toLowerCase();
        const canLogin = getConfigProperty('users.canLogin').some((currentUserName) => userNameLowerCase === currentUserName.toLowerCase());
        if (canLogin) {
            const canUpdate = getConfigProperty('users.canUpdate').some((currentUserName) => userNameLowerCase === currentUserName.toLowerCase());
            const isAdmin = getConfigProperty('users.isAdmin').some((currentUserName) => userNameLowerCase === currentUserName.toLowerCase());
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
            message: 'Login Failed',
            redirect: redirectURL,
            userName,
            useTestDatabases
        });
    }
}
router.route('/').get(getHandler).post(postHandler);
export default router;
