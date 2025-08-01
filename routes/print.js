import { Router } from 'express';
import handler_pdf from '../handlers/print-get/pdf.js';
import handler_screen from '../handlers/print-get/screen.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
export const router = Router();
router.get('/screen/:printName', handler_screen);
router.get('/pdf/:printName', handler_pdf);
router.get('/:printName', (_request, response) => {
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/dashboard/?error=printConfigNotAllowed`);
});
export default router;
