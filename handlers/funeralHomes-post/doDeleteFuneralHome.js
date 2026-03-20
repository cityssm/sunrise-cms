import deleteFuneralHome from '../../database/deleteFuneralHome.js';
export default function handler(request, response) {
    const success = deleteFuneralHome(request.body.funeralHomeId, request.session.user);
    if (success) {
        response.json({
            success: true
        });
    }
    else {
        response.json({
            success: false,
            errorMessage: 'Note that funeral homes with current or upcoming funerals cannot be deleted.'
        });
    }
}
