export default function handler(_request, response) {
    response.render('dashboard/updateLog', {
        headTitle: 'Update Log'
    });
}
