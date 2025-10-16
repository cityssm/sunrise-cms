export default function handler(request, response) {
    response.render('workOrders/milestoneCalendar', {
        headTitle: 'Work Order Milestone Calendar'
    });
}
