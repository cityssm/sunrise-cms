import deleteFuneralHome from '../../database/deleteFuneralHome.js';
export default function handler(request, response) {
    const success = deleteFuneralHome(request.body.funeralHomeId, request.session.user);
    response.json({
        success,
        errorMessage: success
            ? ''
            : 'Note that funeral homes with current or upcoming funerals cannot be deleted.'
    });
}
