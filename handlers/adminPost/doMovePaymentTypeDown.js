import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getCachedPaymentTypes } from '../../helpers/cache/paymentTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('PaymentTypes', request.body.paymentTypeId)
        : moveRecordDown('PaymentTypes', request.body.paymentTypeId);
    const paymentTypes = getCachedPaymentTypes();
    response.json({
        paymentTypes,
        success
    });
}
