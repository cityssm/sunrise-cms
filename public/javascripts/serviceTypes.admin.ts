/* eslint-disable runtime-cleanup/no-unmanaged-event-listeners */
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { CityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddServiceTypeResponse } from '../../handlers/adminPost/doAddServiceType.js'
import type { DoDeleteServiceTypeResponse } from '../../handlers/adminPost/doDeleteServiceType.js'
import type { DoMoveServiceTypeDownResponse } from '../../handlers/adminPost/doMoveServiceTypeDown.js'
import type { DoMoveServiceTypeUpResponse } from '../../handlers/adminPost/doMoveServiceTypeUp.js'
import type { DoUpdateServiceTypeResponse } from '../../handlers/adminPost/doUpdateServiceType.js'
import type { ServiceType } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: CityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise

  serviceTypes?: ServiceType[]
}

{
  const sunrise = exports.sunrise

  let serviceTypes = exports.serviceTypes as ServiceType[]
  delete exports.serviceTypes

  function updateServiceType(submitEvent: SubmitEvent): void {
    submitEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doUpdateServiceType`,
      submitEvent.currentTarget as HTMLFormElement,
      (responseJSON: DoUpdateServiceTypeResponse) => {
        if (responseJSON.success) {
          serviceTypes = responseJSON.serviceTypes

          bulmaJS.alert({
            contextualColorName: 'success',
            message: 'Service Type Updated Successfully'
          })
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Updating Service Type',

            message: responseJSON.errorMessage
          })
        }
      }
    )
  }

  function deleteServiceType(clickEvent: Event): void {
    const tableRowElement = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const serviceTypeId = tableRowElement.dataset.serviceTypeId

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/admin/doDeleteServiceType`,
        {
          serviceTypeId
        },
        (responseJSON: DoDeleteServiceTypeResponse) => {
          if (responseJSON.success) {
            serviceTypes = responseJSON.serviceTypes

            if (serviceTypes.length === 0) {
              renderServiceTypes()
            } else {
              tableRowElement.remove()
              ;(
                document.querySelector('#tag--serviceTypes') as HTMLElement
              ).textContent = serviceTypes.length.toString()
            }

            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Service Type Deleted Successfully'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Deleting Service Type',

              message: responseJSON.errorMessage
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Service Type',

      message: `Are you sure you want to delete this type?<br />
          Note that no contracts will be removed.`,
      messageIsHtml: true,

      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Delete Type'
      }
    })
  }

  function moveServiceType(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const tableRowElement = buttonElement.closest('tr') as HTMLTableRowElement

    const serviceTypeId = tableRowElement.dataset.serviceTypeId

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveServiceTypeUp'
          : 'doMoveServiceTypeDown'
      }`,
      {
        serviceTypeId,

        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      (
        responseJSON:
          DoMoveServiceTypeDownResponse | DoMoveServiceTypeUpResponse
      ) => {
        if (responseJSON.success) {
          serviceTypes = responseJSON.serviceTypes
          renderServiceTypes()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Moving Service Type',

            message: responseJSON.errorMessage
          })
        }
      }
    )
  }

  function renderServiceTypes(): void {
    ;(document.querySelector('#tag--serviceTypes') as HTMLElement).textContent =
      serviceTypes.length.toString()

    const containerElement = document.querySelector(
      '#container--serviceTypes'
    ) as HTMLTableSectionElement

    if (serviceTypes.length === 0) {
      containerElement.innerHTML = /* html */ `
        <tr>
          <td colspan="${sunrise.portalIntegrationIsEnabled ? '3' : '2'}">
            <div class="message is-warning">
              <p class="message-body">There are no active service types.</p>
            </div>
          </td>
        </tr>
      `

      return
    }

    containerElement.replaceChildren()

    for (const serviceType of serviceTypes) {
      const tableRowElement = document.createElement('tr')

      tableRowElement.dataset.serviceTypeId =
        serviceType.serviceTypeId.toString()

      const formId = `form--editServiceType--${serviceType.serviceTypeId.toString()}`

      tableRowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td>
            <form id="${cityssm.escapeHTML(formId)}">
              <input name="serviceTypeId" type="hidden" value="${cityssm.escapeHTML(serviceType.serviceTypeId.toString())}" />
              <div class="field">
                <div class="control">
                  <input
                    class="input"
                    name="serviceType"
                    type="text"
                    value="${cityssm.escapeHTML(serviceType.serviceType)}"
                    maxlength="100"
                    aria-label="Service Type"
                    required
                  />
                </div>
              </div>
            </form>
          </td>
        `
      )

      if (sunrise.portalIntegrationIsEnabled) {
        tableRowElement.insertAdjacentHTML(
          'beforeend',
          /* html */ `
            <td>
              <div class="control">
                <div class="select is-fullwidth">
                  <select name="isAvailableOnPortal" aria-label="Sync with Portal" form="${cityssm.escapeHTML(formId)}">
                    <option value="0" ${serviceType.isAvailableOnPortal ? '' : ' selected'}>No</option>
                    <option value="1" ${serviceType.isAvailableOnPortal ? ' selected' : ''}>Yes, Sync</option>
                  </select>
                </div>
              </div>
            </td>
          `
        )
      }

      tableRowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td class="is-nowrap">
            <div class="field is-grouped">
              <div class="control">
                <button
                  class="button is-success"
                  type="submit"
                  aria-label="Save"
                  form="${cityssm.escapeHTML(formId)}"
                >
                  <span class="icon"><i class="fa-solid fa-save"></i></span>
                </button>
              </div>
              <div class="control">
                ${sunrise.getMoveUpDownButtonFieldHTML(
                  'button--moveServiceTypeUp',
                  'button--moveServiceTypeDown',
                  false
                )}
              </div>
              <div class="control">
                <button
                  class="button is-danger is-light button--deleteServiceType"
                  type="button"
                  title="Delete Type"
                >
                  <span class="icon"><i class="fa-solid fa-trash"></i></span>
                </button>
              </div>
            </div>
          </td>
        `
      )

      tableRowElement
        .querySelector('form')
        ?.addEventListener('submit', updateServiceType)

      for (const moveButton of tableRowElement.querySelectorAll<HTMLButtonElement>(
        '.button--moveServiceTypeUp, .button--moveServiceTypeDown'
      )) {
        moveButton.addEventListener('click', moveServiceType)
      }

      tableRowElement
        .querySelector('.button--deleteServiceType')
        ?.addEventListener('click', deleteServiceType)

      containerElement.append(tableRowElement)
    }
  }

  document
    .querySelector<HTMLFormElement>('#form--addServiceType')
    ?.addEventListener('submit', (submitEvent: SubmitEvent) => {
      submitEvent.preventDefault()

      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${sunrise.urlPrefix}/admin/doAddServiceType`,
        formElement,
        (responseJSON: DoAddServiceTypeResponse) => {
          serviceTypes = responseJSON.serviceTypes
          renderServiceTypes()

          formElement.reset()
          formElement.querySelector('input')?.focus()
        }
      )
    })

  renderServiceTypes()
}
