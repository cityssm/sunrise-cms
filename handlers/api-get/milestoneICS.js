/* eslint-disable unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */
/* eslint-disable html/use-baseline */
import ical, { ICalEventStatus } from 'ical-generator';
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
import { getApplicationUrl } from '../../helpers/application.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getPrintConfig } from '../../helpers/print.helpers.js';
const calendarCompany = 'cityssm.github.io';
const calendarProduct = getConfigProperty('application.applicationName');
const timeStringSplitRegex = /[ :-]/;
function escapeHTML(stringToEscape) {
    return stringToEscape.replaceAll(/[^\d a-z]/gi, (c) => `&#${c.codePointAt(0)};`);
}
function getWorkOrderUrl(request, workOrderId) {
    return `${getApplicationUrl(request)}/workOrders/${workOrderId}`;
}
function buildEventSummary(milestone) {
    let summary = (milestone.workOrderMilestoneCompletionDate ? '✔ ' : '') +
        ((milestone.workOrderMilestoneTypeId ?? -1) === -1
            ? milestone.workOrderMilestoneDescription
            : milestone.workOrderMilestoneType ?? '').trim();
    let intermentCount = 0;
    for (const contract of milestone.workOrderContracts ?? []) {
        for (const interment of contract.contractInterments ?? []) {
            intermentCount += 1;
            if (intermentCount === 1) {
                if (summary !== '') {
                    summary += ': ';
                }
                summary += interment.deceasedName ?? '';
            }
        }
    }
    if (intermentCount > 1) {
        summary += ` plus ${(intermentCount - 1).toString()}`;
    }
    return summary;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
function buildEventDescriptionHTML_occupancies(request, milestone) {
    let descriptionHTML = '';
    if ((milestone.workOrderContracts ?? []).length > 0) {
        const urlRoot = getApplicationUrl(request);
        /* eslint-disable html/require-closing-tags */
        descriptionHTML = /*html*/ `
      <h2>
        Related Contracts
      </h2>
      <table border="1">
        <thead>
          <tr>
            <th>Contract Type</th>
            <th>Burial Site</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Interments</th>
          </tr>
        </thead>
        <tbody>
    `;
        for (const contract of milestone.workOrderContracts ?? []) {
            descriptionHTML += /*html*/ `
        <tr>
          <td>
            <a href="${urlRoot}/contracts/${contract.contractId}">
              ${escapeHTML(contract.contractType)}
            </a>
          </td>
          <td>
            ${contract.burialSiteName ? escapeHTML(contract.burialSiteName) : '(Not Set)'}
          </td>
          <td>
            ${contract.contractStartDateString}
          </td>
          <td>
            ${contract.contractEndDate
                ? contract.contractEndDateString
                : '(No End Date)'}
          </td>
          <td>
      `;
            for (const interment of contract.contractInterments ?? []) {
                descriptionHTML += `${escapeHTML(interment.deceasedName ?? '')}<br />`;
            }
            descriptionHTML += '</td></tr>';
        }
        descriptionHTML += '</tbody></table>';
        /* eslint-enable html/require-closing-tags */
    }
    return descriptionHTML;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
function buildEventDescriptionHTML_lots(request, milestone) {
    let descriptionHTML = '';
    if ((milestone.workOrderBurialSites ?? []).length > 0) {
        const urlRoot = getApplicationUrl(request);
        /* eslint-disable html/require-closing-tags */
        descriptionHTML += /*html*/ `
      <h2>
        Related Burial Sites
      </h2>
      <table border="1">
        <thead>
          <tr>
            <th>Burial Site</th>
            <th>Cemetery</th>
            <th>Burial Site Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;
        for (const burialSite of milestone.workOrderBurialSites ?? []) {
            descriptionHTML += /*html*/ `
        <tr>
          <td>
            <a href="${urlRoot}/burialSites/${burialSite.burialSiteId.toString()}">
              ${escapeHTML(burialSite.burialSiteName)}
            </a>
          </td>
          <td>${escapeHTML(burialSite.cemeteryName ?? '')}</td>
          <td>${escapeHTML(burialSite.burialSiteType ?? '')}</td>
          <td>${escapeHTML(burialSite.burialSiteStatus ?? '')}</td>
        </tr>
      `;
        }
        descriptionHTML += '</tbody></table>';
        /* eslint-enable html/require-closing-tags */
    }
    return descriptionHTML;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
function buildEventDescriptionHTML_prints(request, milestone) {
    let descriptionHTML = '';
    const prints = getConfigProperty('settings.workOrders.prints');
    if (prints.length > 0) {
        const urlRoot = getApplicationUrl(request);
        descriptionHTML += '<h2>Prints</h2>';
        for (const printName of prints) {
            const printConfig = getPrintConfig(printName);
            if (printConfig) {
                descriptionHTML += /*html*/ `
          <p>
            ${escapeHTML(printConfig.title)}<br />
            ${urlRoot}/print/${printName}/?workOrderId=${milestone.workOrderId.toString()}
          </p>
        `;
            }
        }
    }
    return descriptionHTML;
}
function buildEventDescriptionHTML(request, milestone) {
    const workOrderUrl = getWorkOrderUrl(request, milestone.workOrderId);
    let descriptionHTML = /*html*/ `
    <h1>Milestone Description</h1>
    <p>${escapeHTML(milestone.workOrderMilestoneDescription)}</p>
    <h2>Work Order #${milestone.workOrderNumber ?? ''}</h2>
    <p>${escapeHTML(milestone.workOrderDescription ?? '')}</p>
    <p>${workOrderUrl}</p>
  `;
    descriptionHTML += buildEventDescriptionHTML_occupancies(request, milestone);
    descriptionHTML += buildEventDescriptionHTML_lots(request, milestone);
    descriptionHTML += buildEventDescriptionHTML_prints(request, milestone);
    return descriptionHTML;
}
function buildEventCategoryList(milestone) {
    const categories = [];
    if (milestone.workOrderMilestoneTypeId) {
        categories.push(milestone.workOrderMilestoneType ?? '', milestone.workOrderType ?? '');
    }
    if (milestone.workOrderMilestoneCompletionDate) {
        categories.push('Completed');
    }
    return categories;
}
function buildEventLocation(milestone) {
    const burialSiteNames = [];
    if ((milestone.workOrderBurialSites ?? []).length > 0) {
        for (const burialSite of milestone.workOrderBurialSites ?? []) {
            burialSiteNames.push(`${burialSite.cemeteryName ?? ''}: ${burialSite.burialSiteName}`);
        }
    }
    return burialSiteNames.join(', ');
}
function createCalendarEventFormMilestone(request, calendar, milestone) {
    const milestoneTimePieces = `${milestone.workOrderMilestoneDateString} ${milestone.workOrderMilestoneTimeString}`.split(timeStringSplitRegex);
    const milestoneDate = new Date(Number.parseInt(milestoneTimePieces[0], 10), Number.parseInt(milestoneTimePieces[1], 10) - 1, Number.parseInt(milestoneTimePieces[2], 10), Number.parseInt(milestoneTimePieces[3], 10), Number.parseInt(milestoneTimePieces[4], 10));
    const milestoneEndDate = new Date(milestoneDate);
    milestoneEndDate.setHours(milestoneEndDate.getHours() + 1);
    // Build summary (title in Outlook)
    const summary = buildEventSummary(milestone);
    // Build URL
    const workOrderUrl = getWorkOrderUrl(request, milestone.workOrderId);
    const isAllDayEvent = milestone.workOrderMilestoneTime === null ||
        milestone.workOrderMilestoneTime === undefined;
    // Create event
    const eventData = {
        created: new Date(milestone.recordCreate_timeMillis ?? 0),
        stamp: new Date(milestone.recordCreate_timeMillis ?? 0),
        lastModified: new Date(Math.max(milestone.recordUpdate_timeMillis ?? 0, milestone.workOrderRecordUpdate_timeMillis ?? 0)),
        start: milestoneDate,
        summary,
        allDay: isAllDayEvent,
        url: workOrderUrl
    };
    if (!isAllDayEvent) {
        eventData.end = milestoneEndDate;
    }
    const calendarEvent = calendar.createEvent(eventData);
    // Build description
    const descriptionHTML = buildEventDescriptionHTML(request, milestone);
    calendarEvent.description({
        html: descriptionHTML,
        plain: workOrderUrl
    });
    // Set status
    if (milestone.workOrderMilestoneCompletionDate) {
        calendarEvent.status(ICalEventStatus.CONFIRMED);
    }
    // Add categories
    const categories = buildEventCategoryList(milestone);
    for (const category of categories) {
        calendarEvent.createCategory({
            name: category
        });
    }
    // Set location
    const location = buildEventLocation(milestone);
    calendarEvent.location(location);
    // Set organizer / attendees
    if ((milestone.workOrderContracts ?? []).length > 0) {
        let organizerSet = false;
        for (const contract of milestone.workOrderContracts ?? []) {
            for (const interment of contract.contractInterments ?? []) {
                if (organizerSet) {
                    calendarEvent.createAttendee({
                        email: getConfigProperty('settings.workOrders.calendarEmailAddress'),
                        name: interment.deceasedName ?? ''
                    });
                }
                else {
                    calendarEvent.organizer({
                        email: getConfigProperty('settings.workOrders.calendarEmailAddress'),
                        name: interment.deceasedName ?? ''
                    });
                    organizerSet = true;
                }
            }
        }
    }
    else {
        calendarEvent.organizer({
            email: getConfigProperty('settings.workOrders.calendarEmailAddress'),
            name: milestone.recordCreate_userName ?? ''
        });
    }
}
export default async function handler(request, response) {
    /*
     * Get work order milestones
     */
    const workOrderMilestoneFilters = {
        workOrderMilestoneTypeIds: request.query
            .workOrderMilestoneTypeIds,
        workOrderTypeIds: request.query.workOrderTypeIds
    };
    if (request.query.workOrderId) {
        workOrderMilestoneFilters.workOrderId = request.query.workOrderId;
        workOrderMilestoneFilters.workOrderMilestoneDateFilter = 'notBlank';
    }
    else {
        workOrderMilestoneFilters.workOrderMilestoneDateFilter = 'recent';
    }
    const workOrderMilestones = await getWorkOrderMilestones(workOrderMilestoneFilters, {
        includeWorkOrders: true,
        orderBy: 'date'
    });
    /*
     * Create calendar object
     */
    const calendar = ical({
        name: 'Work Order Milestone Calendar',
        url: getWorkOrderUrl(request)
    });
    if (request.query.workOrderId && workOrderMilestones.length > 0) {
        calendar.name(`Work Order #${workOrderMilestones[0].workOrderNumber}`);
        calendar.url(getWorkOrderUrl(request, workOrderMilestones[0].workOrderId));
    }
    calendar.prodId({
        company: calendarCompany,
        product: calendarProduct
    });
    /*
     * Loop through milestones
     */
    for (const milestone of workOrderMilestones) {
        createCalendarEventFormMilestone(request, calendar, milestone);
    }
    response
        .setHeader('Content-Disposition', 'inline; filename=calendar.ics')
        .setHeader('Content-Type', 'text/calendar; charset=utf-8')
        .send(calendar.toString());
}
