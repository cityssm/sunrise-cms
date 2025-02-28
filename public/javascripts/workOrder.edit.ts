import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../../types/globalTypes.js'
import type {
  Lot,
  LotOccupancy,
  LotStatus,
  WorkOrderComment,
  WorkOrderMilestone,
  WorkOrderMilestoneType
} from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as LOS

  const workOrderId = (
    document.querySelector('#workOrderEdit--workOrderId') as HTMLInputElement
  ).value

  const isCreate = workOrderId === ''

  const workOrderFormElement = document.querySelector(
    '#form--workOrderEdit'
  ) as HTMLFormElement

  los.initializeDatePickers(
    workOrderFormElement
      .querySelector('#workOrderEdit--workOrderOpenDateString')
      ?.closest('.field') as HTMLElement
  )
  los.initializeUnlockFieldButtons(workOrderFormElement)

  function setUnsavedChanges(): void {
    los.setUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--workOrderEdit']")
      ?.classList.remove('is-light')
  }

  function clearUnsavedChanges(): void {
    los.clearUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--workOrderEdit']")
      ?.classList.add('is-light')
  }

  workOrderFormElement.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault()

    cityssm.postJSON(
      `${los.urlPrefix}/workOrders/${isCreate ? 'doCreateWorkOrder' : 'doUpdateWorkOrder'}`,
      submitEvent.currentTarget,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          workOrderId?: number
          errorMessage?: string
        }

        if (responseJSON.success) {
          clearUnsavedChanges()

          if (isCreate) {
            globalThis.location.href = los.getWorkOrderURL(
              responseJSON.workOrderId,
              true
            )
          } else {
            bulmaJS.alert({
              message: 'Work Order Updated Successfully',
              contextualColorName: 'success'
            })
          }
        } else {
          bulmaJS.alert({
            title: 'Error Updating Work Order',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  })

  const inputElements: NodeListOf<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = workOrderFormElement.querySelectorAll('input, select, textarea')

  for (const inputElement of inputElements) {
    inputElement.addEventListener('change', setUnsavedChanges)
  }

  /*
   * Work Order Options
   */

  function doClose(): void {
    cityssm.postJSON(
      `${los.urlPrefix}/workOrders/doCloseWorkOrder`,
      {
        workOrderId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          errorMessage?: string
        }

        if (responseJSON.success) {
          clearUnsavedChanges()
          globalThis.location.href = los.getWorkOrderURL(workOrderId)
        } else {
          bulmaJS.alert({
            title: 'Error Closing Work Order',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function doDelete(): void {
    cityssm.postJSON(
      `${los.urlPrefix}/workOrders/doDeleteWorkOrder`,
      {
        workOrderId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          errorMessage?: string
        }

        if (responseJSON.success) {
          clearUnsavedChanges()
          globalThis.location.href = `${los.urlPrefix}/workOrders`
        } else {
          bulmaJS.alert({
            title: 'Error Deleting Work Order',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  let workOrderMilestones: WorkOrderMilestone[]

  document
    .querySelector('#button--closeWorkOrder')
    ?.addEventListener('click', () => {
      const hasOpenMilestones = workOrderMilestones.some(
        (milestone) => !milestone.workOrderMilestoneCompletionDate
      )

      if (hasOpenMilestones) {
        bulmaJS.alert({
          title: 'Outstanding Milestones',
          message: `You cannot close a work order with outstanding milestones.
            Either complete the outstanding milestones, or remove them from the work order.`,
          contextualColorName: 'warning'
        })

        /*
          // Disable closing work orders with open milestones
          bulmaJS.confirm({
            title: "Close Work Order with Outstanding Milestones",
            message:
              "Are you sure you want to close this work order with outstanding milestones?",
            contextualColorName: "danger",
            okButton: {
              text: "Yes, Close Work Order",
              callbackFunction: doClose
            }
          });
      */
      } else {
        bulmaJS.confirm({
          title: 'Close Work Order',
          message: los.hasUnsavedChanges()
            ? 'Are you sure you want to close this work order with unsaved changes?'
            : 'Are you sure you want to close this work order?',
          contextualColorName: los.hasUnsavedChanges() ? 'warning' : 'info',
          okButton: {
            text: 'Yes, Close Work Order',
            callbackFunction: doClose
          }
        })
      }
    })

  document
    .querySelector('#button--deleteWorkOrder')
    ?.addEventListener('click', (clickEvent: Event) => {
      clickEvent.preventDefault()

      bulmaJS.confirm({
        title: 'Delete Work Order',
        message: 'Are you sure you want to delete this work order?',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Delete Work Order',
          callbackFunction: doDelete
        }
      })
    })

  /**
   * Related Lots
   */
  if (!isCreate) {
    ;(() => {
      let workOrderLots = exports.workOrderLots as Lot[]
      delete exports.workOrderLots

      let workOrderContracts =
        exports.workOrderContracts as LotOccupancy[]
      delete exports.workOrderContracts

      function deleteLotOccupancy(clickEvent: Event): void {
        const contractId = (
          (clickEvent.currentTarget as HTMLElement).closest(
            '.container--contract'
          ) as HTMLElement
        ).dataset.contractId

        function doDelete(): void {
          cityssm.postJSON(
            `${los.urlPrefix}/workOrders/doDeleteWorkOrderContract`,
            {
              workOrderId,
              contractId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                workOrderContracts: LotOccupancy[]
              }

              if (responseJSON.success) {
                workOrderContracts = responseJSON.workOrderContracts
                renderRelatedLotsAndOccupancies()
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
          title: `Delete ${los.escapedAliases.Occupancy} Relationship`,
          message: `Are you sure you want to remove the relationship to this ${los.escapedAliases.occupancy} record from this work order?  Note that the record will remain.`,
          contextualColorName: 'warning',
          okButton: {
            text: 'Yes, Delete Relationship',
            callbackFunction: doDelete
          }
        })
      }

      function addBurialSite(
        lotId: number | string,
        callbackFunction?: (success: boolean) => void
      ): void {
        cityssm.postJSON(
          `${los.urlPrefix}/workOrders/doAddWorkOrderBurialSite`,
          {
            workOrderId,
            lotId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
              workOrderLots: Lot[]
            }

            if (responseJSON.success) {
              workOrderLots = responseJSON.workOrderLots
              renderRelatedLotsAndOccupancies()
            } else {
              bulmaJS.alert({
                title: `Error Adding ${los.escapedAliases.Lot}`,
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
          `${los.urlPrefix}/workOrders/doAddWorkOrderContract`,
          {
            workOrderId,
            contractId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
              workOrderContracts: LotOccupancy[]
            }

            if (responseJSON.success) {
              workOrderContracts = responseJSON.workOrderContracts
              renderRelatedLotsAndOccupancies()
            } else {
              bulmaJS.alert({
                title: `Error Adding ${los.escapedAliases.Occupancy}`,
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

      function addBurialSiteFromLotOccupancy(clickEvent: Event): void {
        const lotId =
          (clickEvent.currentTarget as HTMLElement).dataset.lotId ?? ''
        addBurialSite(lotId)
      }

      function renderRelatedOccupancies(): void {
        const occupanciesContainerElement = document.querySelector(
          '#container--lotOccupancies'
        ) as HTMLElement

        ;(
          document.querySelector(
            ".tabs a[href='#relatedTab--lotOccupancies'] .tag"
          ) as HTMLElement
        ).textContent = workOrderContracts.length.toString()

        if (workOrderContracts.length === 0) {
          // eslint-disable-next-line no-unsanitized/property
          occupanciesContainerElement.innerHTML = `<div class="message is-info">
            <p class="message-body">There are no ${los.escapedAliases.occupancies} associated with this work order.</p>
            </div>`

          return
        }

        // eslint-disable-next-line no-unsanitized/property
        occupanciesContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
          <thead><tr>
            <th class="has-width-1"></th>
            <th>${los.escapedAliases.Occupancy} Type</th>
            <th>${los.escapedAliases.Lot}</th>
            <th>${los.escapedAliases.contractStartDate}</th>
            <th>End Date</th>
            <th>${los.escapedAliases.Occupants}</th>
            <th class="has-width-1"></th>
          </tr></thead>
          <tbody></tbody>
          </table>`

        const currentDateString = cityssm.dateToString(new Date())

        for (const contract of workOrderContracts) {
          const rowElement = document.createElement('tr')
          rowElement.className = 'container--contract'
          rowElement.dataset.contractId =
            contract.contractId.toString()

          const isActive = !(
            contract.contractEndDate &&
            contract.contractEndDateString! < currentDateString
          )

          const hasLotRecord =
            contract.lotId &&
            workOrderLots.some((lot) => contract.lotId === lot.lotId)

          // eslint-disable-next-line no-unsanitized/property
          rowElement.innerHTML = `<td class="is-width-1 has-text-centered">
      ${
        isActive
          ? `<i class="fas fa-play" title="Current ${los.escapedAliases.Occupancy}"></i>`
          : `<i class="fas fa-stop" title="Previous ${los.escapedAliases.Occupancy}"></i>`
      }
      </td><td>
        <a class="has-text-weight-bold" href="${los.getContractURL(contract.contractId)}">
          ${cityssm.escapeHTML(contract.occupancyType ?? '')}
        </a><br />
        <span class="is-size-7">#${contract.contractId}</span>
      </td>`

          if (contract.lotId) {
            // eslint-disable-next-line no-unsanitized/method
            rowElement.insertAdjacentHTML(
              'beforeend',
              `<td>
          ${cityssm.escapeHTML(contract.lotName ?? '')}
          ${
            hasLotRecord
              ? ''
              : ` <button class="button is-small is-light is-success button--addBurialSite"
                  data-lot-id="${contract.lotId.toString()}"
                  data-tooltip="Add ${los.escapedAliases.Lot}"
                  aria-label="Add ${los.escapedAliases.Lot}" type="button">
                  <i class="fas fa-plus" aria-hidden="true"></i>
                  </button>`
          }
        </td>`
            )
          } else {
            // eslint-disable-next-line no-unsanitized/method
            rowElement.insertAdjacentHTML(
              'beforeend',
              `<td><span class="has-text-grey">(No ${los.escapedAliases.Lot})</span></td>`
            )
          }

          let occupantsHTML = ''

          for (const occupant of contract.contractOccupants!) {
            occupantsHTML += `<li class="has-tooltip-left"
              data-tooltip="${cityssm.escapeHTML(occupant.lotOccupantType ?? '')}">
              <span class="fa-li">
              <i class="fas fa-fw fa-${cityssm.escapeHTML(
                (occupant.fontAwesomeIconClass ?? '') === ''
                  ? 'user'
                  : occupant.fontAwesomeIconClass ?? ''
              )}" aria-label="${los.escapedAliases.Occupant}"></i>
              </span>
              ${cityssm.escapeHTML(occupant.occupantName ?? '')}
              ${cityssm.escapeHTML(occupant.occupantFamilyName ?? '')}
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
            contract.contractOccupants!.length === 0
              ? `<span class="has-text-grey">(No ${los.escapedAliases.Occupants})</span>`
              : `<ul class="fa-ul ml-5">${occupantsHTML}</ul>`
          }
        </td><td>
          <button class="button is-small is-light is-danger button--deleteLotOccupancy" data-tooltip="Delete Relationship" type="button">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </td>`
          )

          rowElement
            .querySelector('.button--addBurialSite')
            ?.addEventListener('click', addBurialSiteFromLotOccupancy)

          rowElement
            .querySelector('.button--deleteLotOccupancy')
            ?.addEventListener('click', deleteLotOccupancy)

          occupanciesContainerElement.querySelector('tbody')?.append(rowElement)
        }
      }

      function openEditLotStatus(clickEvent: Event): void {
        const lotId = Number.parseInt(
          (
            (clickEvent.currentTarget as HTMLElement).closest(
              '.container--lot'
            ) as HTMLElement
          ).dataset.lotId ?? '',
          10
        )

        const lot = workOrderLots.find(
          (possibleLot) => possibleLot.lotId === lotId
        ) as Lot

        let editCloseModalFunction: () => void

        function doUpdateBurialSiteStatus(submitEvent: SubmitEvent): void {
          submitEvent.preventDefault()

          cityssm.postJSON(
            `${los.urlPrefix}/workOrders/doUpdateBurialSiteStatus`,
            submitEvent.currentTarget,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                workOrderLots: Lot[]
              }

              if (responseJSON.success) {
                workOrderLots = responseJSON.workOrderLots
                renderRelatedLotsAndOccupancies()
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

        cityssm.openHtmlModal('lot-editLotStatus', {
          onshow(modalElement) {
            los.populateAliases(modalElement)
            ;(
              modalElement.querySelector(
                '#lotStatusEdit--lotId'
              ) as HTMLInputElement
            ).value = lotId.toString()
            ;(
              modalElement.querySelector(
                '#lotStatusEdit--lotName'
              ) as HTMLInputElement
            ).value = lot.lotName ?? ''

            const lotStatusElement = modalElement.querySelector(
              '#lotStatusEdit--burialSiteStatusId'
            ) as HTMLSelectElement

            let lotStatusFound = false

            for (const lotStatus of exports.lotStatuses as LotStatus[]) {
              const optionElement = document.createElement('option')
              optionElement.value = lotStatus.burialSiteStatusId.toString()
              optionElement.textContent = lotStatus.lotStatus

              if (lotStatus.burialSiteStatusId === lot.burialSiteStatusId) {
                lotStatusFound = true
              }

              lotStatusElement.append(optionElement)
            }

            if (!lotStatusFound && lot.burialSiteStatusId) {
              const optionElement = document.createElement('option')
              optionElement.value = lot.burialSiteStatusId.toString()
              optionElement.textContent = lot.lotStatus ?? ''
              lotStatusElement.append(optionElement)
            }

            if (lot.burialSiteStatusId) {
              lotStatusElement.value = lot.burialSiteStatusId.toString()
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

      function deleteLot(clickEvent: Event): void {
        const lotId = (
          (clickEvent.currentTarget as HTMLElement).closest(
            '.container--lot'
          ) as HTMLElement
        ).dataset.lotId

        function doDelete(): void {
          cityssm.postJSON(
            `${los.urlPrefix}/workOrders/doDeleteWorkOrderBurialSite`,
            {
              workOrderId,
              lotId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                workOrderLots: Lot[]
              }

              if (responseJSON.success) {
                workOrderLots = responseJSON.workOrderLots
                renderRelatedLotsAndOccupancies()
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
          title: `Delete ${los.escapedAliases.Occupancy} Relationship`,
          message: `Are you sure you want to remove the relationship to this ${los.escapedAliases.occupancy} record from this work order?  Note that the record will remain.`,
          contextualColorName: 'warning',
          okButton: {
            text: 'Yes, Delete Relationship',
            callbackFunction: doDelete
          }
        })
      }

      function renderRelatedLots(): void {
        const lotsContainerElement = document.querySelector(
          '#container--lots'
        ) as HTMLElement

        ;(
          document.querySelector(
            ".tabs a[href='#relatedTab--lots'] .tag"
          ) as HTMLElement
        ).textContent = workOrderLots.length.toString()

        if (workOrderLots.length === 0) {
          // eslint-disable-next-line no-unsanitized/property
          lotsContainerElement.innerHTML = `<div class="message is-info">
            <p class="message-body">There are no ${los.escapedAliases.lots} associated with this work order.</p>
            </div>`

          return
        }

        // eslint-disable-next-line no-unsanitized/property
        lotsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
          <thead><tr>
            <th>${los.escapedAliases.Lot}</th>
            <th>${los.escapedAliases.Map}</th>
            <th>${los.escapedAliases.Lot} Type</th>
            <th>Status</th>
            <th class="has-width-1"></th>
          </tr></thead>
          <tbody></tbody>
          </table>`

        for (const lot of workOrderLots) {
          const rowElement = document.createElement('tr')
          rowElement.className = 'container--lot'

          rowElement.dataset.lotId = lot.lotId.toString()

          // eslint-disable-next-line no-unsanitized/property
          rowElement.innerHTML = `<td>
              <a class="has-text-weight-bold" href="${los.getBurialSiteURL(lot.lotId)}">
                ${cityssm.escapeHTML(lot.lotName ?? '')}
              </a>
            </td><td>
              ${cityssm.escapeHTML(lot.cemeteryName ?? '')}
            </td><td>
              ${cityssm.escapeHTML(lot.lotType ?? '')}
            </td><td>
              ${
                lot.burialSiteStatusId
                  ? cityssm.escapeHTML(lot.lotStatus ?? '')
                  : '<span class="has-text-grey">(No Status)</span>'
              }
            </td><td class="is-nowrap">
              <button class="button is-small is-light is-info button--editLotStatus" data-tooltip="Update Status" type="button">
              <i class="fas fa-pencil-alt" aria-hidden="true"></i>
              </button>
              <button class="button is-small is-light is-danger button--deleteLot" data-tooltip="Delete Relationship" type="button">
              <i class="fas fa-trash" aria-hidden="true"></i>
              </button>
            </td>`

          rowElement
            .querySelector('.button--editLotStatus')
            ?.addEventListener('click', openEditLotStatus)

          rowElement
            .querySelector('.button--deleteLot')
            ?.addEventListener('click', deleteLot)

          lotsContainerElement.querySelector('tbody')?.append(rowElement)
        }
      }

      function renderRelatedLotsAndOccupancies(): void {
        renderRelatedOccupancies()
        renderRelatedLots()
      }

      renderRelatedLotsAndOccupancies()

      function doAddLotOccupancy(clickEvent: Event): void {
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
              los.getLoadingParagraphHTML('Searching...')

            cityssm.postJSON(
              `${los.urlPrefix}/contracts/doSearchLotOccupancies`,
              searchFormElement,
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as {
                  lotOccupancies: LotOccupancy[]
                }

                if (responseJSON.lotOccupancies.length === 0) {
                  searchResultsContainerElement.innerHTML = `<div class="message is-info">
                    <p class="message-body">There are no records that meet the search criteria.</p>
                    </div>`

                  return
                }

                // eslint-disable-next-line no-unsanitized/property
                searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
                  <thead><tr>
                    <th class="has-width-1"></th>
                    <th>${los.escapedAliases.Occupancy} Type</th>
                    <th>${los.escapedAliases.Lot}</th>
                    <th>${los.escapedAliases.contractStartDate}</th>
                    <th>End Date</th>
                    <th>${los.escapedAliases.Occupants}</th>
                  </tr></thead>
                  <tbody></tbody>
                  </table>`

                for (const contract of responseJSON.lotOccupancies) {
                  const rowElement = document.createElement('tr')
                  rowElement.className = 'container--contract'
                  rowElement.dataset.contractId =
                    contract.contractId.toString()

                  rowElement.innerHTML = `<td class="has-text-centered">
                      <button class="button is-small is-success button--addContract" data-tooltip="Add" type="button" aria-label="Add">
                        <i class="fas fa-plus" aria-hidden="true"></i>
                      </button>
                    </td>
                    <td class="has-text-weight-bold">
                      ${cityssm.escapeHTML(contract.occupancyType ?? '')}
                    </td>`

                  if (contract.lotId) {
                    rowElement.insertAdjacentHTML(
                      'beforeend',
                      `<td>${cityssm.escapeHTML(contract.lotName ?? '')}</td>`
                    )
                  } else {
                    // eslint-disable-next-line no-unsanitized/method
                    rowElement.insertAdjacentHTML(
                      'beforeend',
                      `<td><span class="has-text-grey">(No ${los.escapedAliases.Lot})</span></td>`
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
                    contract.contractOccupants!.length === 0
                      ? `<span class="has-text-grey">
                          (No ${cityssm.escapeHTML(
                            los.escapedAliases.Occupants
                          )})
                          </span>`
                      : cityssm.escapeHTML(
                          `${contract.contractOccupants![0].occupantName}
                            ${
                              contract.contractOccupants![0]
                                .occupantFamilyName
                            }`
                        ) +
                        (contract.contractOccupants!.length > 1
                          ? ` plus
                              ${(
                                contract.contractOccupants!.length - 1
                              ).toString()}`
                          : '')
                  }</td>`
                  )

                  rowElement
                    .querySelector('.button--addContract')
                    ?.addEventListener('click', doAddLotOccupancy)

                  searchResultsContainerElement
                    .querySelector('tbody')
                    ?.append(rowElement)
                }
              }
            )
          }

          cityssm.openHtmlModal('workOrder-addContract', {
            onshow(modalElement) {
              los.populateAliases(modalElement)

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
                  '#contractSearch--occupancyEffectiveDateString'
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

              const occupantNameElement = modalElement.querySelector(
                '#contractSearch--occupantName'
              ) as HTMLInputElement

              occupantNameElement.addEventListener('change', doSearch)
              occupantNameElement.focus()
              ;(
                modalElement.querySelector(
                  '#contractSearch--lotName'
                ) as HTMLInputElement
              ).addEventListener('change', doSearch)

              searchFormElement.addEventListener('submit', doSearch)
            },
            onremoved() {
              bulmaJS.toggleHtmlClipped()
              ;(
                document.querySelector(
                  '#button--addContract'
                ) as HTMLButtonElement
              ).focus()
            }
          })
        })

      function doAddLot(clickEvent: Event): void {
        const rowElement = (clickEvent.currentTarget as HTMLElement).closest(
          'tr'
        ) as HTMLTableRowElement

        const lotId = rowElement.dataset.lotId ?? ''

        addBurialSite(lotId, (success) => {
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
              los.getLoadingParagraphHTML('Searching...')

            cityssm.postJSON(
              `${los.urlPrefix}/burialSites/doSearchBurialSites`,
              searchFormElement,
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as { lots: Lot[] }

                if (responseJSON.lots.length === 0) {
                  searchResultsContainerElement.innerHTML = `<div class="message is-info">
            <p class="message-body">There are no records that meet the search criteria.</p>
            </div>`

                  return
                }

                // eslint-disable-next-line no-unsanitized/property
                searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
                  <thead><tr>
                    <th class="has-width-1"></th>
                    <th>${los.escapedAliases.Lot}</th>
                    <th>${los.escapedAliases.Map}</th>
                    <th>${los.escapedAliases.Lot} Type</th>
                    <th>Status</th>
                  </tr></thead>
                  <tbody></tbody>
                  </table>`

                for (const lot of responseJSON.lots) {
                  const rowElement = document.createElement('tr')
                  rowElement.className = 'container--lot'
                  rowElement.dataset.lotId = lot.lotId.toString()

                  rowElement.innerHTML = `<td class="has-text-centered">
                      <button class="button is-small is-success button--addBurialSite" data-tooltip="Add" type="button" aria-label="Add">
                        <i class="fas fa-plus" aria-hidden="true"></i>
                      </button>
                    </td><td class="has-text-weight-bold">
                      ${cityssm.escapeHTML(lot.lotName ?? '')}
                    </td><td>
                      ${cityssm.escapeHTML(lot.cemeteryName ?? '')}
                    </td><td>
                      ${cityssm.escapeHTML(lot.lotType ?? '')}
                    </td><td>
                      ${cityssm.escapeHTML(lot.lotStatus ?? '')}
                    </td>`

                  rowElement
                    .querySelector('.button--addBurialSite')
                    ?.addEventListener('click', doAddLot)

                  searchResultsContainerElement
                    .querySelector('tbody')
                    ?.append(rowElement)
                }
              }
            )
          }

          cityssm.openHtmlModal('workOrder-addBurialSite', {
            onshow(modalElement) {
              los.populateAliases(modalElement)

              searchFormElement = modalElement.querySelector(
                'form'
              ) as HTMLFormElement

              searchResultsContainerElement = modalElement.querySelector(
                '#resultsContainer--lotAdd'
              ) as HTMLElement
              ;(
                modalElement.querySelector(
                  '#lotSearch--notWorkOrderId'
                ) as HTMLInputElement
              ).value = workOrderId

              const lotStatusElement = modalElement.querySelector(
                '#lotSearch--burialSiteStatusId'
              ) as HTMLSelectElement

              for (const lotStatus of exports.lotStatuses as LotStatus[]) {
                const optionElement = document.createElement('option')
                optionElement.value = lotStatus.burialSiteStatusId.toString()
                optionElement.textContent = lotStatus.lotStatus
                lotStatusElement.append(optionElement)
              }

              doSearch()
            },
            onshown(modalElement) {
              bulmaJS.toggleHtmlClipped()

              const lotNameElement = modalElement.querySelector(
                '#lotSearch--lotName'
              ) as HTMLInputElement

              lotNameElement.addEventListener('change', doSearch)
              lotNameElement.focus()

              modalElement
                .querySelector('#lotSearch--burialSiteStatusId')
                ?.addEventListener('change', doSearch)

              searchFormElement.addEventListener('submit', doSearch)
            },
            onremoved() {
              bulmaJS.toggleHtmlClipped()
              ;(
                document.querySelector('#button--addBurialSite') as HTMLButtonElement
              ).focus()
            }
          })
        })
    })()
  }

  /**
   * Comments
   */
  ;(() => {
    let workOrderComments = exports.workOrderComments as WorkOrderComment[]
    delete exports.workOrderComments

    function openEditWorkOrderComment(clickEvent: Event): void {
      const workOrderCommentId = Number.parseInt(
        (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
          .workOrderCommentId ?? '',
        10
      )

      const workOrderComment = workOrderComments.find(
        (currentComment) =>
          currentComment.workOrderCommentId === workOrderCommentId
      ) as WorkOrderComment

      let editFormElement: HTMLFormElement
      let editCloseModalFunction: () => void

      function editComment(submitEvent: SubmitEvent): void {
        submitEvent.preventDefault()

        cityssm.postJSON(
          `${los.urlPrefix}/workOrders/doUpdateWorkOrderComment`,
          editFormElement,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
              workOrderComments: WorkOrderComment[]
            }

            if (responseJSON.success) {
              workOrderComments = responseJSON.workOrderComments
              editCloseModalFunction()
              renderWorkOrderComments()
            } else {
              bulmaJS.alert({
                title: 'Error Updating Comment',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('workOrder-editComment', {
        onshow(modalElement) {
          ;(
            modalElement.querySelector(
              '#workOrderCommentEdit--workOrderId'
            ) as HTMLInputElement
          ).value = workOrderId
          ;(
            modalElement.querySelector(
              '#workOrderCommentEdit--workOrderCommentId'
            ) as HTMLInputElement
          ).value = workOrderCommentId.toString()
          ;(
            modalElement.querySelector(
              '#workOrderCommentEdit--workOrderComment'
            ) as HTMLInputElement
          ).value = workOrderComment.workOrderComment ?? ''

          const workOrderCommentDateStringElement = modalElement.querySelector(
            '#workOrderCommentEdit--workOrderCommentDateString'
          ) as HTMLInputElement

          workOrderCommentDateStringElement.value =
            workOrderComment.workOrderCommentDateString ?? ''

          const currentDateString = cityssm.dateToString(new Date())

          workOrderCommentDateStringElement.max =
            workOrderComment.workOrderCommentDateString! <= currentDateString
              ? currentDateString
              : workOrderComment.workOrderCommentDateString ?? ''
          ;(
            modalElement.querySelector(
              '#workOrderCommentEdit--workOrderCommentTimeString'
            ) as HTMLInputElement
          ).value = workOrderComment.workOrderCommentTimeString ?? ''
        },
        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()

          los.initializeDatePickers(modalElement)
          ;(
            modalElement.querySelector(
              '#workOrderCommentEdit--workOrderComment'
            ) as HTMLTextAreaElement
          ).focus()

          editFormElement = modalElement.querySelector(
            'form'
          ) as HTMLFormElement
          editFormElement.addEventListener('submit', editComment)

          editCloseModalFunction = closeModalFunction
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    }

    function deleteWorkOrderComment(clickEvent: Event): void {
      const workOrderCommentId = Number.parseInt(
        (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
          .workOrderCommentId ?? '',
        10
      )

      function doDelete(): void {
        cityssm.postJSON(
          `${los.urlPrefix}/workOrders/doDeleteWorkOrderComment`,
          {
            workOrderId,
            workOrderCommentId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
              workOrderComments: WorkOrderComment[]
            }

            if (responseJSON.success) {
              workOrderComments = responseJSON.workOrderComments
              renderWorkOrderComments()
            } else {
              bulmaJS.alert({
                title: 'Error Removing Comment',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: 'Remove Comment?',
        message: 'Are you sure you want to remove this comment?',
        okButton: {
          text: 'Yes, Remove Comment',
          callbackFunction: doDelete
        },
        contextualColorName: 'warning'
      })
    }

    function renderWorkOrderComments(): void {
      const containerElement = document.querySelector(
        '#container--workOrderComments'
      ) as HTMLElement

      if (workOrderComments.length === 0) {
        containerElement.innerHTML = `<div class="message is-info">
      <p class="message-body">There are no comments to display.</p>
      </div>`
        return
      }

      const tableElement = document.createElement('table')
      tableElement.className = 'table is-fullwidth is-striped is-hoverable'
      tableElement.innerHTML = `<thead><tr>
        <th>Commentor</th>
        <th>Comment Date</th>
        <th>Comment</th>
        <th class="is-hidden-print"><span class="is-sr-only">Options</span></th>
        </tr></thead>
        <tbody></tbody>`

      for (const workOrderComment of workOrderComments) {
        const tableRowElement = document.createElement('tr')

        tableRowElement.dataset.workOrderCommentId =
          workOrderComment.workOrderCommentId?.toString()

        // eslint-disable-next-line no-unsanitized/property
        tableRowElement.innerHTML = `<td>
            ${cityssm.escapeHTML(workOrderComment.recordCreate_userName ?? '')}
          </td><td>
            ${workOrderComment.workOrderCommentDateString}
            ${
              workOrderComment.workOrderCommentTime === 0
                ? ''
                : workOrderComment.workOrderCommentTimePeriodString
            }
          </td><td>
            ${cityssm.escapeHTML(workOrderComment.workOrderComment ?? '')}
          </td><td class="is-hidden-print">
            <div class="buttons are-small is-justify-content-end">
              <button class="button is-primary button--edit" type="button">
                <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
                <span>Edit</span>
              </button>
              <button class="button is-light is-danger button--delete" data-tooltip="Delete Comment" type="button" aria-label="Delete">
                <i class="fas fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </td>`

        tableRowElement
          .querySelector('.button--edit')
          ?.addEventListener('click', openEditWorkOrderComment)

        tableRowElement
          .querySelector('.button--delete')
          ?.addEventListener('click', deleteWorkOrderComment)

        tableElement.querySelector('tbody')?.append(tableRowElement)
      }

      containerElement.innerHTML = ''
      containerElement.append(tableElement)
    }

    function openAddCommentModal(): void {
      let addCommentCloseModalFunction: () => void

      function doAddComment(formEvent: SubmitEvent): void {
        formEvent.preventDefault()

        cityssm.postJSON(
          `${los.urlPrefix}/workOrders/doAddWorkOrderComment`,
          formEvent.currentTarget,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              workOrderComments: WorkOrderComment[]
            }

            if (responseJSON.success) {
              workOrderComments = responseJSON.workOrderComments
              renderWorkOrderComments()
              addCommentCloseModalFunction()
            }
          }
        )
      }

      cityssm.openHtmlModal('workOrder-addComment', {
        onshow(modalElement) {
          los.populateAliases(modalElement)
          ;(
            modalElement.querySelector(
              '#workOrderCommentAdd--workOrderId'
            ) as HTMLInputElement
          ).value = workOrderId

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doAddComment)
        },
        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          addCommentCloseModalFunction = closeModalFunction
          ;(
            modalElement.querySelector(
              '#workOrderCommentAdd--workOrderComment'
            ) as HTMLTextAreaElement
          ).focus()
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
          ;(
            document.querySelector(
              '#workOrderComments--add'
            ) as HTMLButtonElement
          ).focus()
        }
      })
    }

    document
      .querySelector('#workOrderComments--add')
      ?.addEventListener('click', openAddCommentModal)

    if (!isCreate) {
      renderWorkOrderComments()
    }
  })()

  /*
   * Milestones
   */

  function clearPanelBlockElements(panelElement: HTMLElement): void {
    for (const panelBlockElement of panelElement.querySelectorAll(
      '.panel-block'
    )) {
      panelBlockElement.remove()
    }
  }

  function refreshConflictingMilestones(
    workOrderMilestoneDateString: string,
    targetPanelElement: HTMLElement
  ): void {
    // Clear panel-block elements
    clearPanelBlockElements(targetPanelElement)

    // eslint-disable-next-line no-unsanitized/method
    targetPanelElement.insertAdjacentHTML(
      'beforeend',
      `<div class="panel-block is-block">
      ${los.getLoadingParagraphHTML('Loading conflicting milestones...')}
      </div>`
    )

    cityssm.postJSON(
      `${los.urlPrefix}/workOrders/doGetWorkOrderMilestones`,
      {
        workOrderMilestoneDateFilter: 'date',
        workOrderMilestoneDateString
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          workOrderMilestones: WorkOrderMilestone[]
        }

        const workOrderMilestones = responseJSON.workOrderMilestones.filter(
          (possibleMilestone) =>
            possibleMilestone.workOrderId.toString() !== workOrderId
        )

        clearPanelBlockElements(targetPanelElement)

        for (const milestone of workOrderMilestones) {
          targetPanelElement.insertAdjacentHTML(
            'beforeend',
            `<div class="panel-block is-block">
              <div class="columns">
                <div class="column is-5">
                  ${cityssm.escapeHTML(milestone.workOrderMilestoneTime === 0 ? 'No Time' : milestone.workOrderMilestoneTimePeriodString ?? '')}<br />
                  <strong>${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}</strong>
                </div>
                <div class="column">
                  ${cityssm.escapeHTML(milestone.workOrderNumber ?? '')}<br />
                  <span class="is-size-7">
                    ${cityssm.escapeHTML(milestone.workOrderDescription ?? '')}
                  </span>
                </div>
              </div>
              </div>`
          )
        }

        if (workOrderMilestones.length === 0) {
          targetPanelElement.insertAdjacentHTML(
            'beforeend',
            `<div class="panel-block is-block">
              <div class="message is-info">
                <p class="message-body">
                  There are no milestones on other work orders scheduled for
                  ${cityssm.escapeHTML(workOrderMilestoneDateString)}.
                </p>
              </div>
              </div>`
          )
        }
      }
    )
  }

  function processMilestoneResponse(rawResponseJSON: unknown): void {
    const responseJSON = rawResponseJSON as {
      success: boolean
      errorMessage?: string
      workOrderMilestones: WorkOrderMilestone[]
    }

    if (responseJSON.success) {
      workOrderMilestones = responseJSON.workOrderMilestones
      renderMilestones()
    } else {
      bulmaJS.alert({
        title: 'Error Reopening Milestone',
        message: responseJSON.errorMessage ?? '',
        contextualColorName: 'danger'
      })
    }
  }

  function completeMilestone(clickEvent: Event): void {
    clickEvent.preventDefault()

    const currentDateString = cityssm.dateToString(new Date())

    const workOrderMilestoneId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--milestone'
        ) as HTMLElement
      ).dataset.workOrderMilestoneId ?? '',
      10
    )

    const workOrderMilestone = workOrderMilestones.find(
      (currentMilestone) =>
        currentMilestone.workOrderMilestoneId === workOrderMilestoneId
    ) as WorkOrderMilestone

    function doComplete(): void {
      cityssm.postJSON(
        `${los.urlPrefix}/workOrders/doCompleteWorkOrderMilestone`,
        {
          workOrderId,
          workOrderMilestoneId
        },
        processMilestoneResponse
      )
    }

    bulmaJS.confirm({
      title: 'Complete Milestone',
      message: `Are you sure you want to complete this milestone?
        ${
          workOrderMilestone.workOrderMilestoneDateString !== undefined &&
          workOrderMilestone.workOrderMilestoneDateString !== '' &&
          workOrderMilestone.workOrderMilestoneDateString > currentDateString
            ? '<br /><strong>Note that this milestone is expected to be completed in the future.</strong>'
            : ''
        }`,
      messageIsHtml: true,
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Complete Milestone',
        callbackFunction: doComplete
      }
    })
  }

  function reopenMilestone(clickEvent: Event): void {
    clickEvent.preventDefault()

    const workOrderMilestoneId = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--milestone'
      ) as HTMLElement
    ).dataset.workOrderMilestoneId

    function doReopen(): void {
      cityssm.postJSON(
        `${los.urlPrefix}/workOrders/doReopenWorkOrderMilestone`,
        {
          workOrderId,
          workOrderMilestoneId
        },
        processMilestoneResponse
      )
    }

    bulmaJS.confirm({
      title: 'Reopen Milestone',
      message:
        'Are you sure you want to remove the completion status from this milestone, and reopen it?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Reopen Milestone',
        callbackFunction: doReopen
      }
    })
  }

  function deleteMilestone(clickEvent: Event): void {
    clickEvent.preventDefault()

    const workOrderMilestoneId = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--milestone'
      ) as HTMLElement
    ).dataset.workOrderMilestoneId

    function doDelete(): void {
      cityssm.postJSON(
        `${los.urlPrefix}/workOrders/doDeleteWorkOrderMilestone`,
        {
          workOrderMilestoneId,
          workOrderId
        },
        processMilestoneResponse
      )
    }

    bulmaJS.confirm({
      title: 'Delete Milestone',
      message: 'Are you sure you want to delete this milestone?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete Milestone',
        callbackFunction: doDelete
      }
    })
  }

  function editMilestone(clickEvent: Event): void {
    clickEvent.preventDefault()

    const workOrderMilestoneId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--milestone'
        ) as HTMLElement
      ).dataset.workOrderMilestoneId ?? '',
      10
    )

    const workOrderMilestone = workOrderMilestones.find(
      (currentMilestone) =>
        currentMilestone.workOrderMilestoneId === workOrderMilestoneId
    ) as WorkOrderMilestone

    let editCloseModalFunction: () => void
    let workOrderMilestoneDateStringElement: HTMLInputElement

    function doEdit(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/workOrders/doUpdateWorkOrderMilestone`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            errorMessage?: string
            workOrderMilestones?: WorkOrderMilestone[]
          }

          processMilestoneResponse(responseJSON)
          if (responseJSON.success) {
            editCloseModalFunction()
          }
        }
      )
    }

    cityssm.openHtmlModal('workOrder-editMilestone', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#milestoneEdit--workOrderId'
          ) as HTMLInputElement
        ).value = workOrderId
        ;(
          modalElement.querySelector(
            '#milestoneEdit--workOrderMilestoneId'
          ) as HTMLInputElement
        ).value = workOrderMilestone.workOrderMilestoneId?.toString() ?? ''

        const milestoneTypeElement = modalElement.querySelector(
          '#milestoneEdit--workOrderMilestoneTypeId'
        ) as HTMLSelectElement

        let milestoneTypeFound = false

        for (const milestoneType of exports.workOrderMilestoneTypes as WorkOrderMilestoneType[]) {
          const optionElement = document.createElement('option')

          optionElement.value =
            milestoneType.workOrderMilestoneTypeId.toString()
          optionElement.textContent = milestoneType.workOrderMilestoneType

          if (
            milestoneType.workOrderMilestoneTypeId ===
            workOrderMilestone.workOrderMilestoneTypeId
          ) {
            optionElement.selected = true
            milestoneTypeFound = true
          }

          milestoneTypeElement.append(optionElement)
        }

        if (
          !milestoneTypeFound &&
          workOrderMilestone.workOrderMilestoneTypeId
        ) {
          const optionElement = document.createElement('option')

          optionElement.value =
            workOrderMilestone.workOrderMilestoneTypeId.toString()

          optionElement.textContent =
            workOrderMilestone.workOrderMilestoneType ?? ''

          optionElement.selected = true

          milestoneTypeElement.append(optionElement)
        }

        workOrderMilestoneDateStringElement = modalElement.querySelector(
          '#milestoneEdit--workOrderMilestoneDateString'
        ) as HTMLInputElement

        workOrderMilestoneDateStringElement.value =
          workOrderMilestone.workOrderMilestoneDateString ?? ''

        if (workOrderMilestone.workOrderMilestoneTime) {
          ;(
            modalElement.querySelector(
              '#milestoneEdit--workOrderMilestoneTimeString'
            ) as HTMLInputElement
          ).value = workOrderMilestone.workOrderMilestoneTimeString ?? ''
        }

        ;(
          modalElement.querySelector(
            '#milestoneEdit--workOrderMilestoneDescription'
          ) as HTMLTextAreaElement
        ).value = workOrderMilestone.workOrderMilestoneDescription ?? ''
      },
      onshown(modalElement, closeModalFunction) {
        editCloseModalFunction = closeModalFunction

        bulmaJS.toggleHtmlClipped()

        los.initializeDatePickers(modalElement)
        // los.initializeTimePickers(modalElement);
        modalElement.querySelector('form')?.addEventListener('submit', doEdit)

        const conflictingMilestonePanelElement = document.querySelector(
          '#milestoneEdit--conflictingMilestonesPanel'
        ) as HTMLElement

        workOrderMilestoneDateStringElement.addEventListener('change', () => {
          refreshConflictingMilestones(
            workOrderMilestoneDateStringElement.value,
            conflictingMilestonePanelElement
          )
        })

        refreshConflictingMilestones(
          workOrderMilestoneDateStringElement.value,
          conflictingMilestonePanelElement
        )
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function renderMilestones(): void {
    // Clear milestones panel
    const milestonesPanelElement = document.querySelector(
      '#panel--milestones'
    ) as HTMLElement

    const panelBlockElementsToDelete =
      milestonesPanelElement.querySelectorAll('.panel-block')

    for (const panelBlockToDelete of panelBlockElementsToDelete) {
      panelBlockToDelete.remove()
    }

    for (const milestone of workOrderMilestones) {
      const panelBlockElement = document.createElement('div')
      panelBlockElement.className = 'panel-block is-block container--milestone'

      panelBlockElement.dataset.workOrderMilestoneId =
        milestone.workOrderMilestoneId?.toString()

      // eslint-disable-next-line no-unsanitized/property
      panelBlockElement.innerHTML = `<div class="columns is-mobile">
        <div class="column is-narrow">
          ${
            milestone.workOrderMilestoneCompletionDate
              ? `<span class="button is-static"
                  data-tooltip="Completed ${milestone.workOrderMilestoneCompletionDateString}"
                  aria-label="Completed ${milestone.workOrderMilestoneCompletionDateString}">
                  <span class="icon is-small"><i class="fas fa-check" aria-hidden="true"></i></span>
                  </span>`
              : `<button class="button button--completeMilestone" data-tooltip="Incomplete" type="button" aria-label="Incomplete">
                  <span class="icon is-small"><i class="far fa-square" aria-hidden="true"></i></span>
                  </button>`
          }
        </div><div class="column">
          ${
            milestone.workOrderMilestoneTypeId
              ? `<strong>${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}</strong><br />`
              : ''
          }
          ${
            milestone.workOrderMilestoneDate === 0
              ? '<span class="has-text-grey">(No Set Date)</span>'
              : milestone.workOrderMilestoneDateString
          }
          ${
            milestone.workOrderMilestoneTime
              ? ` ${milestone.workOrderMilestoneTimePeriodString}`
              : ''
          }<br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(milestone.workOrderMilestoneDescription ?? '')}
          </span>
        </div><div class="column is-narrow">
          <div class="dropdown is-right">
            <div class="dropdown-trigger">
              <button class="button is-small" data-tooltip="Options" type="button" aria-label="Options">
                <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
              </button>
            </div>
            <div class="dropdown-menu">
              <div class="dropdown-content">
                ${
                  milestone.workOrderMilestoneCompletionDate
                    ? `<a class="dropdown-item button--reopenMilestone" href="#">
                        <span class="icon is-small"><i class="fas fa-times" aria-hidden="true"></i></span>
                        <span>Reopen Milestone</span>
                        </a>`
                    : `<a class="dropdown-item button--editMilestone" href="#">
                        <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
                        <span>Edit Milestone</span>
                        </a>`
                }
                <hr class="dropdown-divider" />
                <a class="dropdown-item button--deleteMilestone" href="#">
                  <span class="icon is-small"><i class="fas fa-trash has-text-danger" aria-hidden="true"></i></span>
                  <span>Delete Milestone</span>
                </a>
              </div>
            </div>
          </div>
        </div></div>`

      panelBlockElement
        .querySelector('.button--reopenMilestone')
        ?.addEventListener('click', reopenMilestone)
      panelBlockElement
        .querySelector('.button--editMilestone')
        ?.addEventListener('click', editMilestone)

      panelBlockElement
        .querySelector('.button--completeMilestone')
        ?.addEventListener('click', completeMilestone)

      panelBlockElement
        .querySelector('.button--deleteMilestone')
        ?.addEventListener('click', deleteMilestone)

      milestonesPanelElement.append(panelBlockElement)
    }

    bulmaJS.init(milestonesPanelElement)
  }

  if (!isCreate) {
    workOrderMilestones = exports.workOrderMilestones as WorkOrderMilestone[]
    delete exports.workOrderMilestones

    renderMilestones()

    document
      .querySelector('#button--addMilestone')
      ?.addEventListener('click', () => {
        let addFormElement: HTMLFormElement
        let workOrderMilestoneDateStringElement: HTMLInputElement
        let addCloseModalFunction: () => void

        function doAdd(submitEvent: SubmitEvent): void {
          if (submitEvent) {
            submitEvent.preventDefault()
          }

          const currentDateString = cityssm.dateToString(new Date())

          function _doAdd(): void {
            cityssm.postJSON(
              `${los.urlPrefix}/workOrders/doAddWorkOrderMilestone`,
              addFormElement,
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as {
                  success: boolean
                  errorMessage?: string
                  workOrderMilestones?: WorkOrderMilestone[]
                }

                processMilestoneResponse(responseJSON)

                if (responseJSON.success) {
                  addCloseModalFunction()
                }
              }
            )
          }

          const milestoneDateString = workOrderMilestoneDateStringElement.value

          if (
            milestoneDateString !== '' &&
            milestoneDateString < currentDateString
          ) {
            bulmaJS.confirm({
              title: 'Milestone Date in the Past',
              message:
                'Are you sure you want to create a milestone with a date in the past?',
              contextualColorName: 'warning',
              okButton: {
                text: 'Yes, Create a Past Milestone',
                callbackFunction: _doAdd
              }
            })
          } else {
            _doAdd()
          }
        }

        cityssm.openHtmlModal('workOrder-addMilestone', {
          onshow(modalElement) {
            ;(
              modalElement.querySelector(
                '#milestoneAdd--workOrderId'
              ) as HTMLInputElement
            ).value = workOrderId

            const milestoneTypeElement = modalElement.querySelector(
              '#milestoneAdd--workOrderMilestoneTypeId'
            ) as HTMLSelectElement

            for (const milestoneType of exports.workOrderMilestoneTypes as WorkOrderMilestoneType[]) {
              const optionElement = document.createElement('option')

              optionElement.value =
                milestoneType.workOrderMilestoneTypeId.toString()
              optionElement.textContent = milestoneType.workOrderMilestoneType

              milestoneTypeElement.append(optionElement)
            }

            workOrderMilestoneDateStringElement = modalElement.querySelector(
              '#milestoneAdd--workOrderMilestoneDateString'
            ) as HTMLInputElement

            workOrderMilestoneDateStringElement.valueAsDate = new Date()
          },
          onshown(modalElement, closeModalFunction) {
            addCloseModalFunction = closeModalFunction

            los.initializeDatePickers(modalElement)
            // los.initializeTimePickers(modalElement);

            bulmaJS.toggleHtmlClipped()
            ;(
              modalElement.querySelector(
                '#milestoneAdd--workOrderMilestoneTypeId'
              ) as HTMLSelectElement
            ).focus()

            addFormElement = modalElement.querySelector(
              'form'
            ) as HTMLFormElement
            addFormElement.addEventListener('submit', doAdd)

            const conflictingMilestonePanelElement = document.querySelector(
              '#milestoneAdd--conflictingMilestonesPanel'
            ) as HTMLElement

            workOrderMilestoneDateStringElement.addEventListener(
              'change',
              () => {
                refreshConflictingMilestones(
                  workOrderMilestoneDateStringElement.value,
                  conflictingMilestonePanelElement
                )
              }
            )

            refreshConflictingMilestones(
              workOrderMilestoneDateStringElement.value,
              conflictingMilestonePanelElement
            )
          },
          onremoved() {
            bulmaJS.toggleHtmlClipped()
            ;(
              document.querySelector(
                '#button--addMilestone'
              ) as HTMLButtonElement
            ).focus()
          }
        })
      })
  }
})()
