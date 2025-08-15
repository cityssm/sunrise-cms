export default function handler(_request, response) {
    response.render('dashboard', {
        headTitle: 'Dashboard'
    });
}
