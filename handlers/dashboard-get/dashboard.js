export default function handler(request, response) {
    let error = request.query.error;
    if (error === 'accessDenied') {
        error = 'Access Denied.';
    }
    else if (error === 'printConfigNotFound') {
        error = 'Print configuration not found.';
    }
    response.render('dashboard', {
        headTitle: 'Dashboard',
        error
    });
}
