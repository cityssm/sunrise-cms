// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  BurialSite,
  BurialSiteStatus,
  Contract
} from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise

  workOrderBurialSites?: BurialSite[]
  workOrderContracts?: Contract[]

  burialSiteStatuses: BurialSiteStatus[]
}
;(() => {
  const sunrise = exports.sunrise

  const workOrderId = (
    document.querySelector('#workOrderEdit--workOrderId') as HTMLInputElement
  ).value

  let workOrderBurialSites = exports.workOrderBurialSites as BurialSite[]
  delete exports.workOrderBurialSites

  let workOrderContracts = exports.workOrderContracts as Contract[]
  delete exports.workOrderContracts

  function deleteContract(clickEvent: Event): void {
    const contractId = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--contract'
      ) as HTMLElement
    ).dataset.contractId

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/workOrders/doDeleteWorkOrderContract`,
        {
          contractId,
          workOrderId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            errorMessage?: string
            success: boolean
            workOrderContracts: Contract[]
          }

          if (responseJSON.success) {
            workOrderContracts = responseJSON.workOrderContracts
            renderRelatedBurialSitesAndContracts()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Deleting Relationship',

              message: responseJSON.errorMessage ?? ''
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Contract Relationship',

      message: `Are you sure you want to remove the relationship to this contract record from this work order?
        Note that the contract will remain.`,

      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Delete Relationship'
      }
    })
  }

  function addBurialSite(
    burialSiteId: number | string,
    callbackFunction?: (success: boolean) => void
  ): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/workOrders/doAddWorkOrderBurialSite`,
      {
        burialSiteId,
        workOrderId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          errorMessage?: string
          success: boolean
          workOrderBurialSites: BurialSite[]
        }

        if (responseJSON.success) {
          workOrderBurialSites = responseJSON.workOrderBurialSites
          renderRelatedBurialSitesAndContracts()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Adding Burial Site',

            message: responseJSON.errorMessage ?? ''
          })
        }

        if (callbackFunction !== undefined) {
          callbackFunction(responseJSON.success)
        }
      }
    )
  }

  function addContract(
    contractId: number | string,
    callbackFunction?: (success?: boolean) => void
  ): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/workOrders/doAddWorkOrderContract`,
      {
        contractId,
        workOrderId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          errorMessage?: string
          success: boolean
          workOrderContracts: Contract[]
        }

        if (responseJSON.success) {
          workOrderContracts = responseJSON.workOrderContracts
          renderRelatedBurialSitesAndContracts()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Adding Contract',

            message: responseJSON.errorMessage ?? ''
          })
        }

        if (callbackFunction !== undefined) {
          callbackFunction(responseJSON.success)
        }
      }
    )
  }

  function addBurialSiteFromContract(clickEvent: Event): void {
    const burialSiteId =
      (clickEvent.currentTarget as HTMLElement).dataset.burialSiteId ?? ''
    addBurialSite(burialSiteId)
  }

  function renderRelatedContracts(): void {
    const contractsContainerElement = document.querySelector(
      '#container--contracts'
    ) as HTMLElement

    ;(
      document.querySelector(
        ".tabs a[href='#relatedTab--contracts'] .tag"
      ) as HTMLElement
    ).textContent = workOrderContracts.length.toString()

    if (workOrderContracts.length === 0) {
      contractsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no contracts associated with this work order.</p>
        </div>`

      return
    }

    contractsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
      <thead><tr>
        <th class="has-width-1"></th>
        <th>Contract Type</th>
        <th>Burial Site</th>
        <th>Contract Date</th>
        <th>End Date</th>
        <th>Contacts</th>
        <th class="has-width-1"></th>
      </tr></thead>
      <tbody></tbody>
      </table>`

    for (const contract of workOrderContracts) {
      const rowElement = document.createElement('tr')
      rowElement.className = 'container--contract'
      rowElement.dataset.contractId = contract.contractId.toString()

      const hasBurialSiteRecord =
        contract.burialSiteId &&
        workOrderBurialSites.some(
          (burialSite) => contract.burialSiteId === burialSite.burialSiteId
        )

      let contractIcon =
        '<i class="fa-solid fa-stop" title="Previous Contract"></i>'

      if (contract.contractIsFuture === 1) {
        contractIcon =
          '<i class="fa-solid fa-fast-forward" title="Future Contract"></i>'
      } else if (contract.contractIsActive === 1) {
        contractIcon =
          '<i class="fa-solid fa-play" title="Current Contract"></i>'
      }

      // eslint-disable-next-line no-unsanitized/property
      rowElement.innerHTML = `<td class="is-width-1 has-text-centered">
        ${contractIcon}
        </td><td>
          <a class="has-text-weight-bold" href="${sunrise.getContractUrl(contract.contractId)}">
            ${cityssm.escapeHTML(contract.contractType)}
          </a><br />
          <span class="is-size-7">#${contract.contractId}</span>
        </td>`

      if (contract.burialSiteId) {
        // eslint-disable-next-line no-unsanitized/method
        rowElement.insertAdjacentHTML(
          'beforeend',
          `<td>
          ${cityssm.escapeHTML(contract.burialSiteName ?? '')}
          ${
            hasBurialSiteRecord
              ? ''
              : ` <button class="button is-small is-light is-success button--addBurialSite"
                    data-burial-site-id="${contract.burialSiteId.toString()}"
                    data-tooltip="Add Burial Site"
                    aria-label="Add Burial Site" type="button">
                  <i class="fa-solid fa-plus"></i>
                  </button>`
          }
        </td>`
        )
      } else {
        rowElement.insertAdjacentHTML(
          'beforeend',
          '<td><span class="has-text-grey">(No Burial Site)</span></td>'
        )
      }

      let contactsHtml = ''

      for (const interment of contract.contractInterments ?? []) {
        contactsHtml += `<li class="has-tooltip-left"
          data-tooltip="${cityssm.escapeHTML(contract.isPreneed ? 'Recipient' : 'Deceased')}">
          <span class="fa-li">
            <i class="fa-solid fa-user" aria-label="${cityssm.escapeHTML(contract.isPreneed ? 'Recipient' : 'Deceased')}"></i>
          </span>
          ${cityssm.escapeHTML(interment.deceasedName ?? '')}
          </li>`
      }

      if (contract.purchaserName !== '') {
        contactsHtml += `<li class="has-tooltip-left"
          data-tooltip="Purchaser">
          <span class="fa-li">
            <i class="fa-solid fa-hand-holding-dollar" aria-label="Purchaser"></i>
          </span>
          ${cityssm.escapeHTML(contract.purchaserName)}
          </li>`
      }

      if (contract.funeralHomeName !== null) {
        contactsHtml += `<li class="has-tooltip-left"
          data-tooltip="Funeral Home">
          <span class="fa-li">
            <i class="fa-solid fa-place-of-worship" aria-label="Funeral Home"></i>
          </span>
          ${cityssm.escapeHTML(contract.funeralHomeName)}
          </li>`
      }

      // eslint-disable-next-line no-unsanitized/method
      rowElement.insertAdjacentHTML(
        'beforeend',
        `<td>
          ${contract.contractStartDateString}
        </td><td>
          ${
            contract.contractEndDate
              ? contract.contractEndDateString
              : '<span class="has-text-grey">(No End Date)</span>'
          }
        </td><td>
          <ul class="fa-ul ml-5">
          ${contactsHtml}
          </ul>
        </td><td>
          <button class="button is-small is-light is-danger button--deleteContract" data-tooltip="Delete Relationship" type="button">
            <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
          </button>
        </td>`
      )

      rowElement
        .querySelector('.button--addBurialSite')
        ?.addEventListener('click', addBurialSiteFromContract)

      rowElement
        .querySelector('.button--deleteContract')
        ?.addEventListener('click', deleteContract)

      contractsContainerElement.querySelector('tbody')?.append(rowElement)
    }
  }

  function openEditBurialSiteStatus(clickEvent: Event): void {
    const burialSiteId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--burialSite'
        ) as HTMLElement
      ).dataset.burialSiteId ?? '',
      10
    )

    const burialSite = workOrderBurialSites.find(
      (potentialBurialSite) => potentialBurialSite.burialSiteId === burialSiteId
    ) as BurialSite

    let editCloseModalFunction: () => void

    function doUpdateBurialSiteStatus(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${sunrise.urlPrefix}/workOrders/doUpdateBurialSiteStatus`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            errorMessage?: string
            success: boolean
            workOrderBurialSites: BurialSite[]
          }

          if (responseJSON.success) {
            workOrderBurialSites = responseJSON.workOrderBurialSites
            renderRelatedBurialSitesAndContracts()
            editCloseModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Deleting Relationship',

              message: responseJSON.errorMessage ?? ''
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('burialSite-editBurialSiteStatus', {
      onshow(modalElement) {
        sunrise.populateAliases(modalElement)
        ;(
          modalElement.querySelector(
            '#burialSiteStatusEdit--burialSiteId'
          ) as HTMLInputElement
        ).value = burialSiteId.toString()
        ;(
          modalElement.querySelector(
            '#burialSiteStatusEdit--burialSiteName'
          ) as HTMLInputElement
        ).value = burialSite.burialSiteName

        const burialSiteStatusElement = modalElement.querySelector(
          '#burialSiteStatusEdit--burialSiteStatusId'
        ) as HTMLSelectElement

        let statusFound = false

        for (const burialSiteStatus of exports.burialSiteStatuses) {
          const optionElement = document.createElement('option')
          optionElement.value = burialSiteStatus.burialSiteStatusId.toString()
          optionElement.textContent = burialSiteStatus.burialSiteStatus

          if (
            burialSiteStatus.burialSiteStatusId ===
            burialSite.burialSiteStatusId
          ) {
            statusFound = true
          }

          burialSiteStatusElement.append(optionElement)
        }

        if (!statusFound && burialSite.burialSiteStatusId) {
          const optionElement = document.createElement('option')
          optionElement.value = burialSite.burialSiteStatusId.toString()
          optionElement.textContent = burialSite.burialSiteStatus ?? ''
          burialSiteStatusElement.append(optionElement)
        }

        if (burialSite.burialSiteStatusId) {
          burialSiteStatusElement.value =
            burialSite.burialSiteStatusId.toString()
        }

        // eslint-disable-next-line no-unsanitized/method
        modalElement
          .querySelector('form')
          ?.insertAdjacentHTML(
            'beforeend',
            `<input name="workOrderId" type="hidden" value="${workOrderId}" />`
          )
      },
      onshown(modalElement, closeModalFunction) {
        editCloseModalFunction = closeModalFunction

        bulmaJS.toggleHtmlClipped()

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateBurialSiteStatus)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteBurialSite(clickEvent: Event): void {
    const burialSiteId = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--burialSite'
      ) as HTMLElement
    ).dataset.burialSiteId

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/workOrders/doDeleteWorkOrderBurialSite`,
        {
          burialSiteId,
          workOrderId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            errorMessage?: string
            success: boolean
            workOrderBurialSites: BurialSite[]
          }

          if (responseJSON.success) {
            workOrderBurialSites = responseJSON.workOrderBurialSites
            renderRelatedBurialSitesAndContracts()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Deleting Relationship',

              message: responseJSON.errorMessage ?? ''
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Burial Site Relationship',

      message: `Are you sure you want to remove the relationship to this burial site from this work order?
        Note that the record will remain.`,

      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Delete Relationship'
      }
    })
  }

  function renderRelatedBurialSites(): void {
    const burialSitesContainerElement = document.querySelector(
      '#container--burialSites'
    ) as HTMLElement

    ;(
      document.querySelector(
        ".tabs a[href='#relatedTab--burialSites'] .tag"
      ) as HTMLElement
    ).textContent = workOrderBurialSites.length.toString()

    if (workOrderBurialSites.length === 0) {
      burialSitesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no burial sites associated with this work order.</p>
        </div>`

      return
    }

    burialSitesContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
      <thead><tr>
        <th>Burial Site</th>
        <th>Cemetery</th>
        <th>Burial Site Type</th>
        <th>Status</th>
        <th class="has-width-1"></th>
      </tr></thead>
      <tbody></tbody>
      </table>`

    for (const burialSite of workOrderBurialSites) {
      const rowElement = document.createElement('tr')
      rowElement.className = 'container--burialSite'

      rowElement.dataset.burialSiteId = burialSite.burialSiteId.toString()

      // eslint-disable-next-line no-unsanitized/property
      rowElement.innerHTML = `<td>
          <a class="has-text-weight-bold" href="${sunrise.getBurialSiteUrl(burialSite.burialSiteId)}">
            ${cityssm.escapeHTML(burialSite.burialSiteName)}
          </a>
        </td><td>
          ${cityssm.escapeHTML(burialSite.cemeteryName ?? '')}
        </td><td>
          ${cityssm.escapeHTML(burialSite.burialSiteType ?? '')}
        </td><td>
          ${
            burialSite.burialSiteStatusId
              ? cityssm.escapeHTML(burialSite.burialSiteStatus ?? '')
              : '<span class="has-text-grey">(No Status)</span>'
          }
        </td><td class="has-text-right">
          <button class="button is-small mb-1 is-light is-info button--editBurialSiteStatus" data-tooltip="Update Status" type="button">
            <span class="icon is-small"><i class="fa-solid fa-pencil-alt"></i></span>
          </button>
          <button class="button is-small is-light is-danger button--deleteBurialSite" data-tooltip="Delete Relationship" type="button">
            <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
          </button>
        </td>`

      rowElement
        .querySelector('.button--editBurialSiteStatus')
        ?.addEventListener('click', openEditBurialSiteStatus)

      rowElement
        .querySelector('.button--deleteBurialSite')
        ?.addEventListener('click', deleteBurialSite)

      burialSitesContainerElement.querySelector('tbody')?.append(rowElement)
    }
  }

  function renderRelatedBurialSitesAndContracts(): void {
    renderRelatedContracts()
    renderRelatedBurialSites()
  }

  renderRelatedBurialSitesAndContracts()

  function doAddContract(clickEvent: Event): void {
    const rowElement = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const contractId = rowElement.dataset.contractId ?? ''

    addContract(contractId, (success) => {
      if (success) {
        rowElement.remove()
      }
    })
  }

  document
    .querySelector('#button--addContract')
    ?.addEventListener('click', (addClickEvent) => {
      addClickEvent.preventDefault()

      let searchFormElement: HTMLFormElement
      let searchResultsContainerElement: HTMLElement

      function doSearch(event?: Event): void {
        event?.preventDefault()

        // eslint-disable-next-line no-unsanitized/property
        searchResultsContainerElement.innerHTML =
          sunrise.getLoadingParagraphHTML('Searching...')

        cityssm.postJSON(
          `${sunrise.urlPrefix}/contracts/doSearchContracts`,
          searchFormElement,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              contracts: Contract[]
            }

            if (responseJSON.contracts.length === 0) {
              searchResultsContainerElement.innerHTML = `<div class="message is-info">
                <p class="message-body">There are no records that meet the search criteria.</p>
                </div>`

              return
            }

            searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
              <thead><tr>
                <th class="has-width-1"></th>
                <th>Contract Type</th>
                <th>Burial Site</th>
                <th>Contract Date</th>
                <th>End Date</th>
                <th>Interments</th>
              </tr></thead>
              <tbody></tbody>
              </table>`

            for (const contract of responseJSON.contracts) {
              const rowElement = document.createElement('tr')
              rowElement.className = 'container--contract'
              rowElement.dataset.contractId = contract.contractId.toString()

              rowElement.innerHTML = `<td class="has-text-centered">
                  <button class="button is-small is-success button--addContract" data-tooltip="Add" type="button" aria-label="Add">
                    <span class="icon is-small"><i class="fa-solid fa-plus"></i></span>
                  </button>
                </td>
                <td class="has-text-weight-bold">
                  ${cityssm.escapeHTML(contract.contractType)}
                </td>`

              if (contract.burialSiteId) {
                rowElement.insertAdjacentHTML(
                  'beforeend',
                  `<td>${cityssm.escapeHTML(contract.burialSiteName ?? '')}</td>`
                )
              } else {
                rowElement.insertAdjacentHTML(
                  'beforeend',
                  '<td><span class="has-text-grey">(No Burial Site)</span></td>'
                )
              }

              const intermentCount = contract.contractInterments?.length ?? 0
              const recipientOrDeceased = contract.isPreneed
                ? 'Recipients'
                : 'Deceased'

              const intermentsHtml =
                intermentCount === 0
                  ? `<span class="has-text-grey">
                      (No ${cityssm.escapeHTML(recipientOrDeceased)})
                      </span>`
                  : cityssm.escapeHTML(
                      contract.contractInterments?.[0].deceasedName ?? ''
                    ) +
                    // eslint-disable-next-line sonarjs/no-nested-conditional
                    (intermentCount > 1
                      ? ` plus ${(intermentCount - 1).toString()}`
                      : '')

              // eslint-disable-next-line no-unsanitized/method
              rowElement.insertAdjacentHTML(
                'beforeend',
                `<td>
                  ${contract.contractStartDateString}
                </td><td>
                  ${
                    contract.contractEndDate
                      ? contract.contractEndDateString
                      : '<span class="has-text-grey">(No End Date)</span>'
                  }
                </td>
                <td>${intermentsHtml}</td>`
              )

              rowElement
                .querySelector('.button--addContract')
                ?.addEventListener('click', doAddContract)

              searchResultsContainerElement
                .querySelector('tbody')
                ?.append(rowElement)
            }
          }
        )
      }

      cityssm.openHtmlModal('workOrder-addContract', {
        onshow(modalElement) {
          sunrise.populateAliases(modalElement)

          searchFormElement = modalElement.querySelector(
            'form'
          ) as HTMLFormElement

          searchResultsContainerElement = modalElement.querySelector(
            '#resultsContainer--contractAdd'
          ) as HTMLElement
          ;(
            modalElement.querySelector(
              '#contractSearch--notWorkOrderId'
            ) as HTMLInputElement
          ).value = workOrderId
          ;(
            modalElement.querySelector(
              '#contractSearch--contractEffectiveDateString'
            ) as HTMLInputElement
          ).value = (
            document.querySelector(
              '#workOrderEdit--workOrderOpenDateString'
            ) as HTMLInputElement
          ).value

          doSearch()
        },
        onshown(modalElement) {
          bulmaJS.toggleHtmlClipped()

          const deceasedNameElement = modalElement.querySelector(
            '#contractSearch--deceasedName'
          ) as HTMLInputElement

          deceasedNameElement.addEventListener('change', doSearch)
          deceasedNameElement.focus()
          ;(
            modalElement.querySelector(
              '#contractSearch--burialSiteName'
            ) as HTMLInputElement
          ).addEventListener('change', doSearch)

          searchFormElement.addEventListener('submit', doSearch)
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
          ;(
            document.querySelector('#button--addContract') as HTMLButtonElement
          ).focus()
        }
      })
    })

  function doAddBurialSite(clickEvent: Event): void {
    const rowElement = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const burialSiteId = rowElement.dataset.burialSiteId ?? ''

    addBurialSite(burialSiteId, (success) => {
      if (success) {
        rowElement.remove()
      }
    })
  }

  document
    .querySelector('#button--addBurialSite')
    ?.addEventListener('click', (addClickEvent) => {
      addClickEvent.preventDefault()

      let searchFormElement: HTMLFormElement
      let searchResultsContainerElement: HTMLElement

      function doSearch(event?: Event): void {
        event?.preventDefault()

        // eslint-disable-next-line no-unsanitized/property
        searchResultsContainerElement.innerHTML =
          sunrise.getLoadingParagraphHTML('Searching...')

        cityssm.postJSON(
          `${sunrise.urlPrefix}/burialSites/doSearchBurialSites`,
          searchFormElement,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              burialSites: BurialSite[]
            }

            if (responseJSON.burialSites.length === 0) {
              searchResultsContainerElement.innerHTML = `<div class="message is-info">
                <p class="message-body">There are no records that meet the search criteria.</p>
                </div>`

              return
            }

            searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
              <thead><tr>
                <th class="has-width-1"></th>
                <th>Burial Site</th>
                <th>Cemetery</th>
                <th>Burial Site Type</th>
                <th>Status</th>
              </tr></thead>
              <tbody></tbody>
              </table>`

            for (const burialSite of responseJSON.burialSites) {
              const rowElement = document.createElement('tr')
              rowElement.className = 'container--burialSite'
              rowElement.dataset.burialSiteId =
                burialSite.burialSiteId.toString()

              rowElement.innerHTML = `<td class="has-text-centered">
                  <button class="button is-small is-success button--addBurialSite" data-tooltip="Add" type="button" aria-label="Add">
                    <span class="icon is-small"><i class="fa-solid fa-plus"></i></span>
                  </button>
                </td><td class="has-text-weight-bold">
                  ${cityssm.escapeHTML(burialSite.burialSiteName)}
                </td><td>
                  ${cityssm.escapeHTML(burialSite.cemeteryName ?? '')}
                </td><td>
                  ${cityssm.escapeHTML(burialSite.burialSiteType ?? '')}
                </td><td>
                  ${cityssm.escapeHTML(burialSite.burialSiteStatus ?? '')}
                </td>`

              rowElement
                .querySelector('.button--addBurialSite')
                ?.addEventListener('click', doAddBurialSite)

              searchResultsContainerElement
                .querySelector('tbody')
                ?.append(rowElement)
            }
          }
        )
      }

      cityssm.openHtmlModal('workOrder-addBurialSite', {
        onshow(modalElement) {
          sunrise.populateAliases(modalElement)

          searchFormElement = modalElement.querySelector(
            'form'
          ) as HTMLFormElement

          searchResultsContainerElement = modalElement.querySelector(
            '#resultsContainer--burialSiteAdd'
          ) as HTMLElement
          ;(
            modalElement.querySelector(
              '#burialSiteSearch--notWorkOrderId'
            ) as HTMLInputElement
          ).value = workOrderId

          const burialSiteStatusElement = modalElement.querySelector(
            '#burialSiteSearch--burialSiteStatusId'
          ) as HTMLSelectElement

          for (const burialSiteStatus of exports.burialSiteStatuses) {
            const optionElement = document.createElement('option')
            optionElement.value = burialSiteStatus.burialSiteStatusId.toString()
            optionElement.textContent = burialSiteStatus.burialSiteStatus
            burialSiteStatusElement.append(optionElement)
          }

          doSearch()
        },
        onshown(modalElement) {
          bulmaJS.toggleHtmlClipped()

          const burialSiteNameElement = modalElement.querySelector(
            '#burialSiteSearch--burialSiteName'
          ) as HTMLInputElement

          burialSiteNameElement.addEventListener('change', doSearch)
          burialSiteNameElement.focus()

          modalElement
            .querySelector('#burialSiteSearch--burialSiteStatusId')
            ?.addEventListener('change', doSearch)

          searchFormElement.addEventListener('submit', doSearch)
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
          ;(
            document.querySelector(
              '#button--addBurialSite'
            ) as HTMLButtonElement
          ).focus()
        }
      })
    })
})()
