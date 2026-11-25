import { addPaymentType } from '../../database/addRecord.js';
import { getCachedPaymentTypes } from '../../helpers/cache/paymentTypes.cache.js';
export default function handler(request, response) {
    const paymentTypeId = addPaymentType(request.body.paymentType, request.body.orderNumber ?? -1, request.session.user);
    const paymentTypes = getCachedPaymentTypes();
    response.json({
        paymentTypeId,
        paymentTypes
    });
}
