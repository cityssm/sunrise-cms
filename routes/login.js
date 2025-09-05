import { clearAbuse, recordAbuse } from '@cityssm/express-abuse-points';
import { Router } from 'express';
import { authenticate, getSafeRedirectURL } from '../helpers/authentication.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { useTestDatabases } from '../helpers/database.helpers.js';
import { getUser } from '../helpers/user.helpers.js';
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
            message: '',
            redirect: request.query.redirect,
            userName: '',
            useTestDatabases
        });
    }
}
async function postHandler(request, response) {
    const userName = typeof request.body.userName === 'string' ? request.body.userName : '';
    const passwordPlain = typeof request.body.password === 'string' ? request.body.password : '';
    const unsafeRedirectURL = request.body.redirect;
    const redirectURL = getSafeRedirectURL(typeof unsafeRedirectURL === 'string' ? unsafeRedirectURL : '');
    /*
     * Authenticate User
     */
    const isAuthenticated = await authenticate(userName, passwordPlain);
    /*
     * Get User Object
     */
    let userObject;
    if (isAuthenticated) {
        userObject = getUser(userName);
    }
    if (isAuthenticated && userObject !== undefined) {
        clearAbuse(request);
        request.session.user = userObject;
        response.redirect(redirectURL);
    }
    else {
        recordAbuse(request);
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
