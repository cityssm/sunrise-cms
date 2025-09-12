export default function handler(_request, response) {
    response.render('dashboard/userSettings', {
        headTitle: 'User Settings'
    });
}
