import { updatePaymentType } from '../../database/updateRecord.js';
import { getCachedPaymentTypes } from '../../helpers/cache/paymentTypes.cache.js';
export default function handler(request, response) {
    const success = updatePaymentType(request.body.paymentTypeId, request.body.paymentType, request.session.user);
    const paymentTypes = getCachedPaymentTypes();
    response.json({
        paymentTypes,
        success
    });
}
