import { deleteRecord } from '../../database/deleteRecord.js';
import { getCachedPaymentTypes } from '../../helpers/cache/paymentTypes.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('PaymentTypes', request.body.paymentTypeId, request.session.user);
    const paymentTypes = getCachedPaymentTypes();
    response.json({
        paymentTypes,
        success
    });
}
