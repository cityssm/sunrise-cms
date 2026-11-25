import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getCachedPaymentTypes } from '../../helpers/cache/paymentTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('PaymentTypes', request.body.paymentTypeId)
        : moveRecordUp('PaymentTypes', request.body.paymentTypeId);
    const paymentTypes = getCachedPaymentTypes();
    response.json({
        paymentTypes,
        success
    });
}
