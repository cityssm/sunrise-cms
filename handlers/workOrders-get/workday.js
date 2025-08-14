export default function handler(request, response) {
    response.render('workOrder-workday', {
        headTitle: 'Workday Report'
    });
}
