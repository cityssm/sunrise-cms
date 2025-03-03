/* eslint-disable unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */

import type { Request, Response } from 'express'
import ical, { type ICalEventData, ICalEventStatus } from 'ical-generator'

import getWorkOrderMilestones, {
  type WorkOrderMilestoneFilters
} from '../../database/getWorkOrderMilestones.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getPrintConfig } from '../../helpers/functions.print.js'
import type { WorkOrderMilestone } from '../../types/recordTypes.js'

const calendarCompany = 'cityssm.github.io'
const calendarProduct = getConfigProperty('application.applicationName')

const timeStringSplitRegex = /[ :-]/

function escapeHTML(stringToEscape: string): string {
  return stringToEscape.replaceAll(
    /[^\d a-z]/gi,
    (c) => `&#${c.codePointAt(0)};`
  )
}

function getUrlRoot(request: Request): string {
  return `http://${request.hostname}${
    getConfigProperty('application.httpPort') === 80
      ? ''
      : `:${getConfigProperty('application.httpPort')}`
  }${getConfigProperty('reverseProxy.urlPrefix')}`
}

function getWorkOrderUrl(
  request: Request,
  milestone: WorkOrderMilestone
): string {
  return `${getUrlRoot(request)}/workOrders/${milestone.workOrderId}`
}

function buildEventSummary(milestone: WorkOrderMilestone): string {
  let summary =
    (milestone.workOrderMilestoneCompletionDate ? '✔ ' : '') +
    ((milestone.workOrderMilestoneTypeId ?? -1) === -1
      ? milestone.workOrderMilestoneDescription ?? ''
      : milestone.workOrderMilestoneType ?? ''
    ).trim()

  let occupantCount = 0

  for (const contract of milestone.workOrderContracts ?? []) {
    for (const occupant of contract.contractOccupants ?? []) {
      occupantCount += 1

      if (occupantCount === 1) {
        if (summary !== '') {
          summary += ': '
        }

        summary += `${occupant.occupantName ?? ''} ${occupant.occupantFamilyName ?? ''}`
      }
    }
  }

  if (occupantCount > 1) {
    summary += ` plus ${(occupantCount - 1).toString()}`
  }

  return summary
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function buildEventDescriptionHTML_occupancies(
  request: Request,
  milestone: WorkOrderMilestone
): string {
  let descriptionHTML = ''

  if (milestone.workOrderContracts!.length > 0) {
    const urlRoot = getUrlRoot(request)

    descriptionHTML = `<h2>
      Related Contracts
      </h2>
      <table border="1">
      <thead><tr>
      <th>Contract Type</th>
      <th>Burial Site</th>
      <th>Start Date</th>
      <th>End Date</th>
      <th>${escapeHTML(getConfigProperty('aliases.occupants'))}</th>
      </tr></thead>
      <tbody>`

    for (const occupancy of milestone.workOrderContracts ?? []) {
      descriptionHTML += `<tr>
          <td>
            <a href="${urlRoot}/contracts/${occupancy.contractId}">
              ${escapeHTML(occupancy.contractType ?? '')}
            </a>
          </td>
          <td>
            ${occupancy.lotName ? escapeHTML(occupancy.lotName) : '(Not Set)'}
          </td>
          <td>
            ${occupancy.contractStartDateString}
          </td>
          <td>
            ${
              occupancy.contractEndDate
                ? occupancy.contractEndDateString
                : '(No End Date)'
            }
          </td>
          <td>`

      for (const occupant of occupancy.contractOccupants ?? []) {
        descriptionHTML += `${escapeHTML(
          occupant.lotOccupantType ?? ''
        )}: ${escapeHTML(occupant.occupantName ?? '')} ${escapeHTML(
          occupant.occupantFamilyName ?? ''
        )}<br />`
      }

      descriptionHTML += '</td></tr>'
    }

    descriptionHTML += '</tbody></table>'
  }

  return descriptionHTML
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function buildEventDescriptionHTML_lots(
  request: Request,
  milestone: WorkOrderMilestone
): string {
  let descriptionHTML = ''

  if ((milestone.workOrderBurialSites ?? []).length > 0) {
    const urlRoot = getUrlRoot(request)

    descriptionHTML += `<h2>
      Related Burial Sites
      </h2>
      <table border="1"><thead><tr>
      <th>Burial Site</th>
      <th>Cemetery</th>
      <th>Burial Site Type</th>
      <th>Status</th>
      </tr></thead>
      <tbody>`

    for (const burialSite of milestone.workOrderBurialSites ?? []) {
      descriptionHTML += `<tr>
        <td>
          <a href="${urlRoot}/burialSites/${burialSite.burialSiteId.toString()}">
            ${escapeHTML(burialSite.burialSiteName ?? '')}
          </a>
        </td>
        <td>${escapeHTML(burialSite.cemeteryName ?? '')}</td>
        <td>${escapeHTML(burialSite.burialSiteType ?? '')}</td>
        <td>${escapeHTML(burialSite.burialSiteStatus ?? '')}</td>
        </tr>`
    }

    descriptionHTML += '</tbody></table>'
  }

  return descriptionHTML
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function buildEventDescriptionHTML_prints(
  request: Request,
  milestone: WorkOrderMilestone
): string {
  let descriptionHTML = ''

  const prints = getConfigProperty('settings.workOrders.prints')

  if (prints.length > 0) {
    const urlRoot = getUrlRoot(request)

    descriptionHTML += '<h2>Prints</h2>'

    for (const printName of prints) {
      const printConfig = getPrintConfig(printName)

      if (printConfig) {
        descriptionHTML += `<p>
          ${escapeHTML(printConfig.title)}<br />
          ${urlRoot}/print/${printName}/?workOrderId=${milestone.workOrderId.toString()}
          </p>`
      }
    }
  }

  return descriptionHTML
}

function buildEventDescriptionHTML(
  request: Request,
  milestone: WorkOrderMilestone
): string {
  const workOrderUrl = getWorkOrderUrl(request, milestone)

  let descriptionHTML = `<h1>Milestone Description</h1>
    <p>${escapeHTML(milestone.workOrderMilestoneDescription ?? '')}</p>
    <h2>Work Order #${milestone.workOrderNumber ?? ''}</h2>
    <p>${escapeHTML(milestone.workOrderDescription ?? '')}</p>
    <p>${workOrderUrl}</p>`

  descriptionHTML += buildEventDescriptionHTML_occupancies(request, milestone)
  descriptionHTML += buildEventDescriptionHTML_lots(request, milestone)
  descriptionHTML += buildEventDescriptionHTML_prints(request, milestone)

  return descriptionHTML
}

function buildEventCategoryList(milestone: WorkOrderMilestone): string[] {
  const categories: string[] = []

  if (milestone.workOrderMilestoneTypeId) {
    categories.push(
      milestone.workOrderMilestoneType ?? '',
      milestone.workOrderType ?? ''
    )
  }

  if (milestone.workOrderMilestoneCompletionDate) {
    categories.push('Completed')
  }

  return categories
}

function buildEventLocation(milestone: WorkOrderMilestone): string {
  const burialSiteNames: string[] = []

  if ((milestone.workOrderBurialSites ?? []).length > 0) {
    for (const burialSite of milestone.workOrderBurialSites ?? []) {
      burialSiteNames.push(`${burialSite.cemeteryName ?? ''}: ${burialSite.burialSiteName ?? ''}`)
    }
  }
  return burialSiteNames.join(', ')
}

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const urlRoot = getUrlRoot(request)

  /*
   * Get work order milestones
   */
  const workOrderMilestoneFilters: WorkOrderMilestoneFilters = {
    workOrderTypeIds: request.query.workOrderTypeIds as string,
    workOrderMilestoneTypeIds: request.query.workOrderMilestoneTypeIds as string
  }

  if (request.query.workOrderId) {
    workOrderMilestoneFilters.workOrderId = request.query.workOrderId as string
    workOrderMilestoneFilters.workOrderMilestoneDateFilter = 'notBlank'
  } else {
    workOrderMilestoneFilters.workOrderMilestoneDateFilter = 'recent'
  }

  const workOrderMilestones = await getWorkOrderMilestones(
    workOrderMilestoneFilters,
    {
      includeWorkOrders: true,
      orderBy: 'date'
    }
  )

  /*
   * Create calendar object
   */
  const calendar = ical({
    name: 'Work Order Milestone Calendar',
    url: `${urlRoot}/workOrders`
  })

  if (request.query.workOrderId && workOrderMilestones.length > 0) {
    calendar.name(`Work Order #${workOrderMilestones[0].workOrderNumber}`)
    calendar.url(
      `${urlRoot}/workOrders/${workOrderMilestones[0].workOrderId?.toString()}`
    )
  }

  calendar.prodId({
    company: calendarCompany,
    product: calendarProduct
  })

  /*
   * Loop through milestones
   */
  for (const milestone of workOrderMilestones) {
    const milestoneTimePieces =
      `${milestone.workOrderMilestoneDateString} ${milestone.workOrderMilestoneTimeString}`.split(
        timeStringSplitRegex
      )

    const milestoneDate = new Date(
      Number.parseInt(milestoneTimePieces[0], 10),
      Number.parseInt(milestoneTimePieces[1], 10) - 1,
      Number.parseInt(milestoneTimePieces[2], 10),
      Number.parseInt(milestoneTimePieces[3], 10),
      Number.parseInt(milestoneTimePieces[4], 10)
    )

    const milestoneEndDate = new Date(milestoneDate.getTime())
    milestoneEndDate.setHours(milestoneEndDate.getHours() + 1)

    // Build summary (title in Outlook)
    const summary = buildEventSummary(milestone)

    // Build URL
    const workOrderUrl = getWorkOrderUrl(request, milestone)

    // Create event
    const eventData: ICalEventData = {
      start: milestoneDate,
      created: new Date(milestone.recordCreate_timeMillis ?? 0),
      stamp: new Date(milestone.recordCreate_timeMillis ?? 0),
      lastModified: new Date(
        Math.max(
          milestone.recordUpdate_timeMillis ?? 0,
          milestone.workOrderRecordUpdate_timeMillis ?? 0
        )
      ),
      allDay: !milestone.workOrderMilestoneTime,
      summary,
      url: workOrderUrl
    }

    if (!eventData.allDay) {
      eventData.end = milestoneEndDate
    }

    const calendarEvent = calendar.createEvent(eventData)

    // Build description
    const descriptionHTML = buildEventDescriptionHTML(request, milestone)

    calendarEvent.description({
      plain: workOrderUrl,
      html: descriptionHTML
    })

    // Set status
    if (milestone.workOrderMilestoneCompletionDate) {
      calendarEvent.status(ICalEventStatus.CONFIRMED)
    }

    // Add categories
    const categories = buildEventCategoryList(milestone)
    for (const category of categories) {
      calendarEvent.createCategory({
        name: category
      })
    }

    // Set location
    const location = buildEventLocation(milestone)
    calendarEvent.location(location)

    // Set organizer / attendees
    if (milestone.workOrderContracts!.length > 0) {
      let organizerSet = false
      for (const contract of milestone.workOrderContracts ?? []) {
        for (const occupant of contract.contractOccupants ?? []) {
          if (organizerSet) {
            calendarEvent.createAttendee({
              name: `${occupant.occupantName ?? ''} ${
                occupant.occupantFamilyName ?? ''
              }`,
              email: getConfigProperty(
                'settings.workOrders.calendarEmailAddress'
              )
            })
          } else {
            calendarEvent.organizer({
              name: `${occupant.occupantName ?? ''} ${
                occupant.occupantFamilyName ?? ''
              }`,
              email: getConfigProperty(
                'settings.workOrders.calendarEmailAddress'
              )
            })
            organizerSet = true
          }
        }
      }
    } else {
      calendarEvent.organizer({
        name: milestone.recordCreate_userName ?? '',
        email: getConfigProperty('settings.workOrders.calendarEmailAddress')
      })
    }
  }

  response.setHeader('Content-Disposition', 'inline; filename=calendar.ics')

  response.setHeader('Content-Type', 'text/calendar; charset=utf-8')

  response.send(calendar.toString())
}
