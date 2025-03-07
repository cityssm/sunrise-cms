// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  BurialSite,
  BurialSiteStatus,
  Contract
} from '../../types/recordTypes.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

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
          workOrderId,
          contractId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            errorMessage?: string
            workOrderContracts: Contract[]
          }

          if (responseJSON.success) {
            workOrderContracts = responseJSON.workOrderContracts
            renderRelatedBurialSitesAndContracts()
          } else {
            bulmaJS.alert({
              title: 'Error Deleting Relationship',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: `Delete Contract Relationship`,
      message: `Are you sure you want to remove the relationship to this contract record from this work order?
        Note that the contract will remain.`,
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete Relationship',
        callbackFunction: doDelete
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
        workOrderId,
        burialSiteId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          errorMessage?: string
          workOrderBurialSites: BurialSite[]
        }

        if (responseJSON.success) {
          workOrderBurialSites = responseJSON.workOrderBurialSites
          renderRelatedBurialSitesAndContracts()
        } else {
          bulmaJS.alert({
            title: 'Error Adding Burial Site',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
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
        workOrderId,
        contractId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          errorMessage?: string
          workOrderContracts: Contract[]
        }

        if (responseJSON.success) {
          workOrderContracts = responseJSON.workOrderContracts
          renderRelatedBurialSitesAndContracts()
        } else {
          bulmaJS.alert({
            title: `Error Adding Contract`,
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
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

  // eslint-disable-next-line complexity
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
        <th>Interments</th>
        <th class="has-width-1"></th>
      </tr></thead>
      <tbody></tbody>
      </table>`

    const currentDateString = cityssm.dateToString(new Date())

    for (const contract of workOrderContracts) {
      const rowElement = document.createElement('tr')
      rowElement.className = 'container--contract'
      rowElement.dataset.contractId = contract.contractId.toString()

      const isActive = !(
        contract.contractEndDate &&
        contract.contractEndDateString! < currentDateString
      )

      const hasBurialSiteRecord =
        contract.burialSiteId &&
        workOrderBurialSites.some(
          (burialSite) => contract.burialSiteId === burialSite.burialSiteId
        )

      // eslint-disable-next-line no-unsanitized/property
      rowElement.innerHTML = `<td class="is-width-1 has-text-centered">
      ${
        isActive
          ? `<i class="fas fa-play" title="Current Contract"></i>`
          : `<i class="fas fa-stop" title="Previous Contract"></i>`
      }
      </td><td>
        <a class="has-text-weight-bold" href="${sunrise.getContractURL(contract.contractId)}">
          ${cityssm.escapeHTML(contract.contractType ?? '')}
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
                  <i class="fas fa-plus" aria-hidden="true"></i>
                  </button>`
          }
        </td>`
        )
      } else {
        rowElement.insertAdjacentHTML(
          'beforeend',
          `<td><span class="has-text-grey">(No Burial Site)</span></td>`
        )
      }

      let intermentsHTML = ''

      for (const interment of contract.contractInterments ?? []) {
        intermentsHTML += `<li class="has-tooltip-left"
          data-tooltip="${cityssm.escapeHTML(contract.isPreneed ?? false ? 'Recipient' : 'Deceased')}">
          <span class="fa-li">
            <i class="fas fa-fw fa-user" aria-label="${cityssm.escapeHTML(contract.isPreneed ?? false ? 'Recipient' : 'Deceased')}"></i>
          </span>
          ${cityssm.escapeHTML(interment.deceasedName ?? '')}
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
          ${
            contract.contractInterments!.length === 0
              ? `<span class="has-text-grey">(No Interments)</span>`
              : `<ul class="fa-ul ml-5">${intermentsHTML}</ul>`
          }
        </td><td>
          <button class="button is-small is-light is-danger button--deleteContract" data-tooltip="Delete Relationship" type="button">
            <i class="fas fa-trash" aria-hidden="true"></i>
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
            success: boolean
            errorMessage?: string
            workOrderBurialSites: BurialSite[]
          }

          if (responseJSON.success) {
            workOrderBurialSites = responseJSON.workOrderBurialSites
            renderRelatedBurialSitesAndContracts()
            editCloseModalFunction()
          } else {
            bulmaJS.alert({
              title: 'Error Deleting Relationship',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
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
        ).value = burialSite.burialSiteName ?? ''

        const burialSiteStatusElement = modalElement.querySelector(
          '#burialSiteStatusEdit--burialSiteStatusId'
        ) as HTMLSelectElement

        let statusFound = false

        for (const burialSiteStatus of exports.burialSiteStatuses as BurialSiteStatus[]) {
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
          workOrderId,
          burialSiteId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            errorMessage?: string
            workOrderBurialSites: BurialSite[]
          }

          if (responseJSON.success) {
            workOrderBurialSites = responseJSON.workOrderBurialSites
            renderRelatedBurialSitesAndContracts()
          } else {
            bulmaJS.alert({
              title: 'Error Deleting Relationship',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: `Delete Burial Site Relationship`,
      message: `Are you sure you want to remove the relationship to this burial site from this work order?
        Note that the record will remain.`,
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete Relationship',
        callbackFunction: doDelete
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
          <a class="has-text-weight-bold" href="${sunrise.getBurialSiteURL(burialSite.burialSiteId)}">
            ${cityssm.escapeHTML(burialSite.burialSiteName ?? '')}
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
        </td><td class="is-nowrap">
          <button class="button is-small is-light is-info button--editBurialSiteStatus" data-tooltip="Update Status" type="button">
          <i class="fas fa-pencil-alt" aria-hidden="true"></i>
          </button>
          <button class="button is-small is-light is-danger button--deleteBurialSite" data-tooltip="Delete Relationship" type="button">
          <i class="fas fa-trash" aria-hidden="true"></i>
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
    ?.addEventListener('click', () => {
      let searchFormElement: HTMLFormElement
      let searchResultsContainerElement: HTMLElement

      function doSearch(event?: Event): void {
        if (event) {
          event.preventDefault()
        }

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
                    <i class="fas fa-plus" aria-hidden="true"></i>
                  </button>
                </td>
                <td class="has-text-weight-bold">
                  ${cityssm.escapeHTML(contract.contractType ?? '')}
                </td>`

              if (contract.burialSiteId) {
                rowElement.insertAdjacentHTML(
                  'beforeend',
                  `<td>${cityssm.escapeHTML(contract.burialSiteName ?? '')}</td>`
                )
              } else {
                rowElement.insertAdjacentHTML(
                  'beforeend',
                  `<td><span class="has-text-grey">(No Burial Site)</span></td>`
                )
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
                  ${
                    (contract.contractInterments ?? []).length === 0
                      ? `<span class="has-text-grey">
                          (No ${cityssm.escapeHTML(
                            contract.isPreneed ?? false
                              ? 'Recipients'
                              : 'Deceased'
                          )})
                          </span>`
                      : cityssm.escapeHTML(
                          contract.contractInterments![0].deceasedName
                        ) +
                        (contract.contractInterments!.length > 1
                          ? ` plus
                              ${(
                                contract.contractInterments!.length - 1
                              ).toString()}`
                          : '')
                  }</td>`
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
    ?.addEventListener('click', () => {
      let searchFormElement: HTMLFormElement
      let searchResultsContainerElement: HTMLElement

      function doSearch(event?: Event): void {
        if (event) {
          event.preventDefault()
        }

        // eslint-disable-next-line no-unsanitized/property
        searchResultsContainerElement.innerHTML =
          sunrise.getLoadingParagraphHTML('Searching...')

        cityssm.postJSON(
          `${sunrise.urlPrefix}/burialSites/doSearchBurialSites`,
          searchFormElement,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as { burialSites: BurialSite[] }

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
              rowElement.dataset.burialSiteId = burialSite.burialSiteId.toString()

              rowElement.innerHTML = `<td class="has-text-centered">
                  <button class="button is-small is-success button--addBurialSite" data-tooltip="Add" type="button" aria-label="Add">
                    <i class="fas fa-plus" aria-hidden="true"></i>
                  </button>
                </td><td class="has-text-weight-bold">
                  ${cityssm.escapeHTML(burialSite.burialSiteName ?? '')}
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

          for (const burialSiteStatus of exports.burialSiteStatuses as BurialSiteStatus[]) {
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
