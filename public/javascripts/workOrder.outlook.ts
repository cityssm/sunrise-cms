import type { Sunrise } from './types.js'

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  const workOrderTypeIdsElement = document.querySelector(
    '#icsFilters--workOrderTypeIds'
  ) as HTMLSelectElement

  const workOrderMilestoneTypeIdsElement = document.querySelector(
    '#icsFilters--workOrderMilestoneTypeIds'
  ) as HTMLSelectElement

  const calendarLinkElement = document.querySelector(
    '#icsFilters--calendarURL'
  ) as HTMLTextAreaElement

  function updateCalendarURL(): void {
    let url = `${
      globalThis.location.href.slice(
        0,
        Math.max(0, globalThis.location.href.indexOf(globalThis.location.pathname) + 1)
      ) + sunrise.urlPrefix
    }api/${sunrise.apiKey}/milestoneICS/?`

    if (
      !workOrderTypeIdsElement.disabled &&
      workOrderTypeIdsElement.selectedOptions.length > 0
    ) {
      url += 'workOrderTypeIds='

      for (const optionElement of workOrderTypeIdsElement.selectedOptions) {
        url += `${optionElement.value},`
      }

      url = `${url.slice(0, -1)}&`
    }

    if (
      !workOrderMilestoneTypeIdsElement.disabled &&
      workOrderMilestoneTypeIdsElement.selectedOptions.length > 0
    ) {
      url += 'workOrderMilestoneTypeIds='

      for (const optionElement of workOrderMilestoneTypeIdsElement.selectedOptions) {
        url += `${optionElement.value},`
      }

      url = `${url.slice(0, -1)}&`
    }

    calendarLinkElement.value = url.slice(0, -1)
  }

  ;(
    document.querySelector(
      '#icsFilters--workOrderTypeIds-all'
    ) as HTMLInputElement
  ).addEventListener('change', (changeEvent) => {
    workOrderTypeIdsElement.disabled = (
      changeEvent.currentTarget as HTMLInputElement
    ).checked
  })
  ;(
    document.querySelector(
      '#icsFilters--workOrderMilestoneTypeIds-all'
    ) as HTMLInputElement
  ).addEventListener('change', (changeEvent) => {
    workOrderMilestoneTypeIdsElement.disabled = (
      changeEvent.currentTarget as HTMLInputElement
    ).checked
  })

  const inputSelectElements = (
    document.querySelector('#panel--icsFilters') as HTMLElement
  ).querySelectorAll('input, select')

  for (const element of inputSelectElements) {
    element.addEventListener('change', updateCalendarURL)
  }

  updateCalendarURL()

  calendarLinkElement.addEventListener('click', () => {
    calendarLinkElement.focus()
    calendarLinkElement.select()
  })
})()
