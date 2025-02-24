import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../../types/globalTypes.js'
import type {
  DynamicsGPDocument,
  Fee,
  FeeCategory,
  Lot,
  LotOccupancyComment,
  LotOccupancyFee,
  LotOccupancyOccupant,
  LotOccupancyTransaction,
  LotOccupantType,
  LotStatus,
  LotType,
  MapRecord,
  OccupancyTypeField,
  WorkOrderType
} from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as LOS

  const burialSiteContractId = (
    document.querySelector('#lotOccupancy--burialSiteContractId') as HTMLInputElement
  ).value
  const isCreate = burialSiteContractId === ''

  /*
   * Main form
   */

  let refreshAfterSave = isCreate

  function setUnsavedChanges(): void {
    los.setUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--lotOccupancy']")
      ?.classList.remove('is-light')
  }

  function clearUnsavedChanges(): void {
    los.clearUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--lotOccupancy']")
      ?.classList.add('is-light')
  }

  const formElement = document.querySelector(
    '#form--lotOccupancy'
  ) as HTMLFormElement

  formElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${los.urlPrefix}/lotOccupancies/${isCreate ? 'doCreateLotOccupancy' : 'doUpdateLotOccupancy'}`,
      formElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          burialSiteContractId?: number
          errorMessage?: string
        }

        if (responseJSON.success) {
          clearUnsavedChanges()

          if (isCreate || refreshAfterSave) {
            globalThis.location.href = los.getLotOccupancyURL(
              responseJSON.burialSiteContractId,
              true,
              true
            )
          } else {
            bulmaJS.alert({
              message: `${los.escapedAliases.Occupancy} Updated Successfully`,
              contextualColorName: 'success'
            })
          }
        } else {
          bulmaJS.alert({
            title: `Error Saving ${los.escapedAliases.Occupancy}`,
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  })

  const formInputElements = formElement.querySelectorAll('input, select')

  for (const formInputElement of formInputElements) {
    formInputElement.addEventListener('change', setUnsavedChanges)
  }

  function doCopy(): void {
    cityssm.postJSON(
      `${los.urlPrefix}/lotOccupancies/doCopyLotOccupancy`,
      {
        burialSiteContractId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          errorMessage?: string
          burialSiteContractId?: number
        }

        if (responseJSON.success) {
          clearUnsavedChanges()

          globalThis.location.href = los.getLotOccupancyURL(
            responseJSON.burialSiteContractId,
            true
          )
        } else {
          bulmaJS.alert({
            title: 'Error Copying Record',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  document
    .querySelector('#button--copyLotOccupancy')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      if (los.hasUnsavedChanges()) {
        bulmaJS.alert({
          title: 'Unsaved Changes',
          message: 'Please save all unsaved changes before continuing.',
          contextualColorName: 'warning'
        })
      } else {
        bulmaJS.confirm({
          title: `Copy ${los.escapedAliases.Occupancy} Record as New`,
          message: 'Are you sure you want to copy this record to a new record?',
          contextualColorName: 'info',
          okButton: {
            text: 'Yes, Copy',
            callbackFunction: doCopy
          }
        })
      }
    })

  document
    .querySelector('#button--deleteLotOccupancy')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      function doDelete(): void {
        cityssm.postJSON(
          `${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancy`,
          {
            burialSiteContractId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
            }

            if (responseJSON.success) {
              clearUnsavedChanges()
              globalThis.location.href = los.getLotOccupancyURL()
            } else {
              bulmaJS.alert({
                title: 'Error Deleting Record',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: `Delete ${los.escapedAliases.Occupancy} Record`,
        message: 'Are you sure you want to delete this record?',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Delete',
          callbackFunction: doDelete
        }
      })
    })

  document
    .querySelector('#button--createWorkOrder')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      let createCloseModalFunction: () => void

      function doCreate(formEvent: SubmitEvent): void {
        formEvent.preventDefault()

        cityssm.postJSON(
          `${los.urlPrefix}/workOrders/doCreateWorkOrder`,
          formEvent.currentTarget,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
              workOrderId?: number
            }

            if (responseJSON.success) {
              createCloseModalFunction()

              bulmaJS.confirm({
                title: 'Work Order Created Successfully',
                message: 'Would you like to open the work order now?',
                contextualColorName: 'success',
                okButton: {
                  text: 'Yes, Open the Work Order',
                  callbackFunction: () => {
                    globalThis.location.href = los.getWorkOrderURL(
                      responseJSON.workOrderId,
                      true
                    )
                  }
                }
              })
            } else {
              bulmaJS.alert({
                title: 'Error Creating Work Order',
                message: responseJSON.errorMessage as string,
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('lotOccupancy-createWorkOrder', {
        onshow(modalElement) {
          ;(
            modalElement.querySelector(
              '#workOrderCreate--burialSiteContractId'
            ) as HTMLInputElement
          ).value = burialSiteContractId
          ;(
            modalElement.querySelector(
              '#workOrderCreate--workOrderOpenDateString'
            ) as HTMLInputElement
          ).value = cityssm.dateToString(new Date())

          const workOrderTypeSelectElement = modalElement.querySelector(
            '#workOrderCreate--workOrderTypeId'
          ) as HTMLSelectElement

          const workOrderTypes = (exports as Record<string, unknown>)
            .workOrderTypes as WorkOrderType[]

          if (workOrderTypes.length === 1) {
            workOrderTypeSelectElement.innerHTML = ''
          }

          for (const workOrderType of workOrderTypes) {
            const optionElement = document.createElement('option')
            optionElement.value = workOrderType.workOrderTypeId.toString()
            optionElement.textContent = workOrderType.workOrderType ?? ''
            workOrderTypeSelectElement.append(optionElement)
          }
        },
        onshown(modalElement, closeModalFunction) {
          createCloseModalFunction = closeModalFunction
          bulmaJS.toggleHtmlClipped()
          ;(
            modalElement.querySelector(
              '#workOrderCreate--workOrderTypeId'
            ) as HTMLSelectElement
          ).focus()

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doCreate)
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
          ;(
            document.querySelector(
              '#button--createWorkOrder'
            ) as HTMLButtonElement
          ).focus()
        }
      })
    })

  // Occupancy Type

  const contractTypeIdElement = document.querySelector(
    '#lotOccupancy--contractTypeId'
  ) as HTMLSelectElement

  if (isCreate) {
    const lotOccupancyFieldsContainerElement = document.querySelector(
      '#container--lotOccupancyFields'
    ) as HTMLElement

    contractTypeIdElement.addEventListener('change', () => {
      if (contractTypeIdElement.value === '') {
        // eslint-disable-next-line no-unsanitized/property
        lotOccupancyFieldsContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">Select the ${los.escapedAliases.occupancy} type to load the available fields.</p>
          </div>`

        return
      }

      cityssm.postJSON(
        `${los.urlPrefix}/lotOccupancies/doGetContractTypeFields`,
        {
          contractTypeId: contractTypeIdElement.value
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            ContractTypeFields: OccupancyTypeField[]
          }

          if (responseJSON.ContractTypeFields.length === 0) {
            // eslint-disable-next-line no-unsanitized/property
            lotOccupancyFieldsContainerElement.innerHTML = `<div class="message is-info">
              <p class="message-body">There are no additional fields for this ${los.escapedAliases.occupancy} type.</p>
              </div>`

            return
          }

          lotOccupancyFieldsContainerElement.innerHTML = ''

          let contractTypeFieldIds = ''

          for (const occupancyTypeField of responseJSON.ContractTypeFields) {
            contractTypeFieldIds += `,${occupancyTypeField.contractTypeFieldId.toString()}`

            const fieldName = `lotOccupancyFieldValue_${occupancyTypeField.contractTypeFieldId.toString()}`

            const fieldId = `lotOccupancy--${fieldName}`

            const fieldElement = document.createElement('div')
            fieldElement.className = 'field'
            fieldElement.innerHTML = `<label class="label" for="${cityssm.escapeHTML(fieldId)}"></label><div class="control"></div>`
            ;(
              fieldElement.querySelector('label') as HTMLLabelElement
            ).textContent = occupancyTypeField.occupancyTypeField as string

            if (
              occupancyTypeField.fieldType === 'select' ||
              (occupancyTypeField.occupancyTypeFieldValues ?? '') !== ''
            ) {
              ;(
                fieldElement.querySelector('.control') as HTMLElement
              ).innerHTML = `<div class="select is-fullwidth">
                  <select id="${cityssm.escapeHTML(fieldId)}" name="${cityssm.escapeHTML(fieldName)}">
                  <option value="">(Not Set)</option>
                  </select>
                  </div>`

              const selectElement = fieldElement.querySelector(
                'select'
              ) as HTMLSelectElement

              selectElement.required = occupancyTypeField.isRequired as boolean

              const optionValues = (
                occupancyTypeField.occupancyTypeFieldValues as string
              ).split('\n')

              for (const optionValue of optionValues) {
                const optionElement = document.createElement('option')
                optionElement.value = optionValue
                optionElement.textContent = optionValue
                selectElement.append(optionElement)
              }
            } else {
              const inputElement = document.createElement('input')

              inputElement.className = 'input'

              inputElement.id = fieldId

              inputElement.name = fieldName

              inputElement.type = occupancyTypeField.fieldType

              inputElement.required = occupancyTypeField.isRequired as boolean

              inputElement.minLength =
                occupancyTypeField.minimumLength as number

              inputElement.maxLength =
                occupancyTypeField.maximumLength as number

              if ((occupancyTypeField.pattern ?? '') !== '') {
                inputElement.pattern = occupancyTypeField.pattern as string
              }

              ;(fieldElement.querySelector('.control') as HTMLElement).append(
                inputElement
              )
            }

            console.log(fieldElement)

            lotOccupancyFieldsContainerElement.append(fieldElement)
          }

          lotOccupancyFieldsContainerElement.insertAdjacentHTML(
            'beforeend',
            // eslint-disable-next-line no-secrets/no-secrets
            `<input name="contractTypeFieldIds" type="hidden"
              value="${cityssm.escapeHTML(contractTypeFieldIds.slice(1))}" />`
          )
        }
      )
    })
  } else {
    const originalcontractTypeId = contractTypeIdElement.value

    contractTypeIdElement.addEventListener('change', () => {
      if (contractTypeIdElement.value !== originalcontractTypeId) {
        bulmaJS.confirm({
          title: 'Confirm Change',
          message: `Are you sure you want to change the ${los.escapedAliases.occupancy} type?\n
            This change affects the additional fields associated with this record, and may also affect the available fees.`,
          contextualColorName: 'warning',
          okButton: {
            text: 'Yes, Keep the Change',
            callbackFunction: () => {
              refreshAfterSave = true
            }
          },
          cancelButton: {
            text: 'Revert the Change',
            callbackFunction: () => {
              contractTypeIdElement.value = originalcontractTypeId
            }
          }
        })
      }
    })
  }

  // Lot Selector

  const lotNameElement = document.querySelector(
    '#lotOccupancy--lotName'
  ) as HTMLInputElement

  lotNameElement.addEventListener('click', (clickEvent) => {
    const currentLotName = (clickEvent.currentTarget as HTMLInputElement).value

    let lotSelectCloseModalFunction: () => void
    let lotSelectModalElement: HTMLElement

    let lotSelectFormElement: HTMLFormElement
    let lotSelectResultsElement: HTMLElement

    function renderSelectedLotAndClose(
      lotId: number | string,
      lotName: string
    ): void {
      ;(
        document.querySelector('#lotOccupancy--lotId') as HTMLInputElement
      ).value = lotId.toString()
      ;(
        document.querySelector('#lotOccupancy--lotName') as HTMLInputElement
      ).value = lotName

      setUnsavedChanges()
      lotSelectCloseModalFunction()
    }

    function selectExistingLot(clickEvent: Event): void {
      clickEvent.preventDefault()

      const selectedLotElement = clickEvent.currentTarget as HTMLElement

      renderSelectedLotAndClose(
        selectedLotElement.dataset.lotId ?? '',
        selectedLotElement.dataset.lotName ?? ''
      )
    }

    function searchLots(): void {
      // eslint-disable-next-line no-unsanitized/property
      lotSelectResultsElement.innerHTML =
        los.getLoadingParagraphHTML('Searching...')

      cityssm.postJSON(
        `${los.urlPrefix}/lots/doSearchLots`,
        lotSelectFormElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            count: number
            lots: Lot[]
          }

          if (responseJSON.count === 0) {
            lotSelectResultsElement.innerHTML = `<div class="message is-info">
              <p class="message-body">No results.</p>
              </div>`

            return
          }

          const panelElement = document.createElement('div')
          panelElement.className = 'panel'

          for (const lot of responseJSON.lots) {
            const panelBlockElement = document.createElement('a')
            panelBlockElement.className = 'panel-block is-block'
            panelBlockElement.href = '#'

            panelBlockElement.dataset.lotId = lot.lotId.toString()
            panelBlockElement.dataset.lotName = lot.lotName

            // eslint-disable-next-line no-unsanitized/property
            panelBlockElement.innerHTML = `<div class="columns">
              <div class="column">
                ${cityssm.escapeHTML(lot.lotName ?? '')}<br />
                <span class="is-size-7">${cityssm.escapeHTML(lot.cemeteryName ?? '')}</span>
              </div>
              <div class="column">
                ${cityssm.escapeHTML(lot.lotStatus as string)}<br />
                <span class="is-size-7">
                  ${lot.lotOccupancyCount! > 0 ? 'Currently Occupied' : ''}
                </span>
              </div>
              </div>`

            panelBlockElement.addEventListener('click', selectExistingLot)

            panelElement.append(panelBlockElement)
          }

          lotSelectResultsElement.innerHTML = ''
          lotSelectResultsElement.append(panelElement)
        }
      )
    }

    function createLotAndSelect(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      const lotName = (
        lotSelectModalElement.querySelector(
          '#lotCreate--lotName'
        ) as HTMLInputElement
      ).value

      cityssm.postJSON(
        `${los.urlPrefix}/lots/doCreateLot`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            errorMessage?: string
            lotId?: number
          }

          if (responseJSON.success) {
            renderSelectedLotAndClose(responseJSON.lotId ?? '', lotName)
          } else {
            bulmaJS.alert({
              title: `Error Creating ${los.escapedAliases.Lot}`,
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('lotOccupancy-selectLot', {
      onshow(modalElement) {
        los.populateAliases(modalElement)
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()

        lotSelectModalElement = modalElement
        lotSelectCloseModalFunction = closeModalFunction

        bulmaJS.init(modalElement)

        // search Tab

        const lotNameFilterElement = modalElement.querySelector(
          '#lotSelect--lotName'
        ) as HTMLInputElement

        if (
          (document.querySelector('#lotOccupancy--lotId') as HTMLInputElement)
            .value !== ''
        ) {
          lotNameFilterElement.value = currentLotName
        }

        lotNameFilterElement.focus()
        lotNameFilterElement.addEventListener('change', searchLots)

        const occupancyStatusFilterElement = modalElement.querySelector(
          '#lotSelect--occupancyStatus'
        ) as HTMLSelectElement
        occupancyStatusFilterElement.addEventListener('change', searchLots)

        if (currentLotName !== '') {
          occupancyStatusFilterElement.value = ''
        }

        lotSelectFormElement = modalElement.querySelector(
          '#form--lotSelect'
        ) as HTMLFormElement
        lotSelectResultsElement = modalElement.querySelector(
          '#resultsContainer--lotSelect'
        ) as HTMLElement

        lotSelectFormElement.addEventListener('submit', (submitEvent) => {
          submitEvent.preventDefault()
        })

        searchLots()

        // Create Tab

        if (exports.lotNamePattern) {
          const regex = exports.lotNamePattern as RegExp

          ;(
            modalElement.querySelector(
              '#lotCreate--lotName'
            ) as HTMLInputElement
          ).pattern = regex.source
        }

        const lotTypeElement = modalElement.querySelector(
          '#lotCreate--burialSiteTypeId'
        ) as HTMLSelectElement

        for (const lotType of exports.lotTypes as LotType[]) {
          const optionElement = document.createElement('option')
          optionElement.value = lotType.burialSiteTypeId.toString()
          optionElement.textContent = lotType.lotType
          lotTypeElement.append(optionElement)
        }

        const lotStatusElement = modalElement.querySelector(
          '#lotCreate--burialSiteStatusId'
        ) as HTMLSelectElement

        for (const lotStatus of exports.lotStatuses as LotStatus[]) {
          const optionElement = document.createElement('option')
          optionElement.value = lotStatus.burialSiteStatusId.toString()
          optionElement.textContent = lotStatus.lotStatus
          lotStatusElement.append(optionElement)
        }

        const mapElement = modalElement.querySelector(
          '#lotCreate--cemeteryId'
        ) as HTMLSelectElement

        for (const map of exports.maps as MapRecord[]) {
          const optionElement = document.createElement('option')
          optionElement.value = map.cemeteryId!.toString()
          optionElement.textContent =
            (map.cemeteryName ?? '') === '' ? '(No Name)' : map.cemeteryName ?? ''
          mapElement.append(optionElement)
        }

        ;(
          modalElement.querySelector('#form--lotCreate') as HTMLFormElement
        ).addEventListener('submit', createLotAndSelect)
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  })

  document
    .querySelector('.is-lot-view-button')
    ?.addEventListener('click', () => {
      const lotId = (
        document.querySelector('#lotOccupancy--lotId') as HTMLInputElement
      ).value

      if (lotId === '') {
        bulmaJS.alert({
          message: `No ${los.escapedAliases.lot} selected.`,
          contextualColorName: 'info'
        })
      } else {
        window.open(`${los.urlPrefix}/lots/${lotId}`)
      }
    })

  document
    .querySelector('.is-clear-lot-button')
    ?.addEventListener('click', () => {
      if (lotNameElement.disabled) {
        bulmaJS.alert({
          message: 'You need to unlock the field before clearing it.',
          contextualColorName: 'info'
        })
      } else {
        lotNameElement.value = `(No ${los.escapedAliases.Lot})`
        ;(
          document.querySelector('#lotOccupancy--lotId') as HTMLInputElement
        ).value = ''

        setUnsavedChanges()
      }
    })

  // Start Date

  los.initializeDatePickers(formElement)

  document
    .querySelector('#lotOccupancy--contractStartDateString')
    ?.addEventListener('change', () => {
      const endDatePicker = (
        document.querySelector(
          '#lotOccupancy--contractEndDateString'
        ) as HTMLInputElement
      ).bulmaCalendar.datePicker

      endDatePicker.min = (
        document.querySelector(
          '#lotOccupancy--contractStartDateString'
        ) as HTMLInputElement
      ).value

      endDatePicker.refresh()
    })

  los.initializeUnlockFieldButtons(formElement)

  /**
   * Occupants
   */
  ;(() => {
    let lotOccupancyOccupants =
      exports.lotOccupancyOccupants as LotOccupancyOccupant[]

    delete exports.lotOccupancyOccupants

    function openEditLotOccupancyOccupant(clickEvent: Event): void {
      const lotOccupantIndex = Number.parseInt(
        (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
          .lotOccupantIndex ?? '',
        10
      )

      const lotOccupancyOccupant = lotOccupancyOccupants.find(
        (currentLotOccupancyOccupant) => {
          return (
            currentLotOccupancyOccupant.lotOccupantIndex === lotOccupantIndex
          )
        }
      ) as LotOccupancyOccupant

      let editFormElement: HTMLFormElement
      let editCloseModalFunction: () => void

      function editOccupant(submitEvent: SubmitEvent): void {
        submitEvent.preventDefault()

        cityssm.postJSON(
          `${los.urlPrefix}/lotOccupancies/doUpdateLotOccupancyOccupant`,
          editFormElement,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
              lotOccupancyOccupants: LotOccupancyOccupant[]
            }

            if (responseJSON.success) {
              lotOccupancyOccupants = responseJSON.lotOccupancyOccupants
              editCloseModalFunction()
              renderLotOccupancyOccupants()
            } else {
              bulmaJS.alert({
                title: `Error Updating ${los.escapedAliases.Occupant}`,
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('lotOccupancy-editOccupant', {
        onshow(modalElement) {
          los.populateAliases(modalElement)
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--burialSiteContractId'
            ) as HTMLInputElement
          ).value = burialSiteContractId
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--lotOccupantIndex'
            ) as HTMLInputElement
          ).value = lotOccupantIndex.toString()

          const lotOccupantTypeSelectElement = modalElement.querySelector(
            '#lotOccupancyOccupantEdit--lotOccupantTypeId'
          ) as HTMLSelectElement

          let lotOccupantTypeSelected = false

          for (const lotOccupantType of exports.lotOccupantTypes as LotOccupantType[]) {
            const optionElement = document.createElement('option')
            optionElement.value = lotOccupantType.lotOccupantTypeId.toString()
            optionElement.textContent = lotOccupantType.lotOccupantType

            optionElement.dataset.occupantCommentTitle =
              lotOccupantType.occupantCommentTitle

            optionElement.dataset.fontAwesomeIconClass =
              lotOccupantType.fontAwesomeIconClass

            if (
              lotOccupantType.lotOccupantTypeId ===
              lotOccupancyOccupant.lotOccupantTypeId
            ) {
              optionElement.selected = true
              lotOccupantTypeSelected = true
            }

            lotOccupantTypeSelectElement.append(optionElement)
          }

          if (!lotOccupantTypeSelected) {
            const optionElement = document.createElement('option')

            optionElement.value =
              lotOccupancyOccupant.lotOccupantTypeId?.toString() ?? ''
            optionElement.textContent =
              lotOccupancyOccupant.lotOccupantType ?? ''

            optionElement.dataset.occupantCommentTitle =
              lotOccupancyOccupant.occupantCommentTitle

            optionElement.dataset.fontAwesomeIconClass =
              lotOccupancyOccupant.fontAwesomeIconClass

            optionElement.selected = true

            lotOccupantTypeSelectElement.append(optionElement)
          }

          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--fontAwesomeIconClass'
            ) as HTMLElement
          ).innerHTML =
            `<i class="fas fa-fw fa-${cityssm.escapeHTML(lotOccupancyOccupant.fontAwesomeIconClass ?? '')}" aria-hidden="true"></i>`
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--occupantName'
            ) as HTMLInputElement
          ).value = lotOccupancyOccupant.occupantName ?? ''
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--occupantFamilyName'
            ) as HTMLInputElement
          ).value = lotOccupancyOccupant.occupantFamilyName ?? ''
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--occupantAddress1'
            ) as HTMLInputElement
          ).value = lotOccupancyOccupant.occupantAddress1 ?? ''
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--occupantAddress2'
            ) as HTMLInputElement
          ).value = lotOccupancyOccupant.occupantAddress2 ?? ''
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--occupantCity'
            ) as HTMLInputElement
          ).value = lotOccupancyOccupant.occupantCity ?? ''
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--occupantProvince'
            ) as HTMLInputElement
          ).value = lotOccupancyOccupant.occupantProvince ?? ''
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--occupantPostalCode'
            ) as HTMLInputElement
          ).value = lotOccupancyOccupant.occupantPostalCode ?? ''
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--occupantPhoneNumber'
            ) as HTMLInputElement
          ).value = lotOccupancyOccupant.occupantPhoneNumber ?? ''
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--occupantEmailAddress'
            ) as HTMLInputElement
          ).value = lotOccupancyOccupant.occupantEmailAddress ?? ''
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--occupantCommentTitle'
            ) as HTMLLabelElement
          ).textContent =
            (lotOccupancyOccupant.occupantCommentTitle ?? '') === ''
              ? 'Comment'
              : lotOccupancyOccupant.occupantCommentTitle ?? ''
          ;(
            modalElement.querySelector(
              '#lotOccupancyOccupantEdit--occupantComment'
            ) as HTMLTextAreaElement
          ).value = lotOccupancyOccupant.occupantComment ?? ''
        },
        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()

          const lotOccupantTypeIdElement = modalElement.querySelector(
            '#lotOccupancyOccupantEdit--lotOccupantTypeId'
          ) as HTMLSelectElement

          lotOccupantTypeIdElement.focus()

          lotOccupantTypeIdElement.addEventListener('change', () => {
            const fontAwesomeIconClass =
              lotOccupantTypeIdElement.selectedOptions[0].dataset
                .fontAwesomeIconClass ?? 'user'

            ;(
              modalElement.querySelector(
                '#lotOccupancyOccupantEdit--fontAwesomeIconClass'
              ) as HTMLElement
            ).innerHTML =
              `<i class="fas fa-fw fa-${cityssm.escapeHTML(fontAwesomeIconClass)}" aria-hidden="true"></i>`

            let occupantCommentTitle =
              lotOccupantTypeIdElement.selectedOptions[0].dataset
                .occupantCommentTitle ?? ''
            if (occupantCommentTitle === '') {
              occupantCommentTitle = 'Comment'
            }

            ;(
              modalElement.querySelector(
                '#lotOccupancyOccupantEdit--occupantCommentTitle'
              ) as HTMLLabelElement
            ).textContent = occupantCommentTitle
          })

          editFormElement = modalElement.querySelector(
            'form'
          ) as HTMLFormElement
          editFormElement.addEventListener('submit', editOccupant)

          editCloseModalFunction = closeModalFunction
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    }

    function deleteLotOccupancyOccupant(clickEvent: Event): void {
      const lotOccupantIndex = (
        clickEvent.currentTarget as HTMLElement
      ).closest('tr')?.dataset.lotOccupantIndex

      function doDelete(): void {
        cityssm.postJSON(
          `${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancyOccupant`,
          {
            burialSiteContractId,
            lotOccupantIndex
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
              lotOccupancyOccupants: LotOccupancyOccupant[]
            }

            if (responseJSON.success) {
              lotOccupancyOccupants = responseJSON.lotOccupancyOccupants
              renderLotOccupancyOccupants()
            } else {
              bulmaJS.alert({
                title: `Error Removing ${los.escapedAliases.Occupant}`,
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: `Remove ${los.escapedAliases.Occupant}?`,
        message: `Are you sure you want to remove this ${los.escapedAliases.occupant}?`,
        okButton: {
          text: `Yes, Remove ${los.escapedAliases.Occupant}`,
          callbackFunction: doDelete
        },
        contextualColorName: 'warning'
      })
    }

    function renderLotOccupancyOccupants(): void {
      const occupantsContainer = document.querySelector(
        '#container--lotOccupancyOccupants'
      ) as HTMLElement

      cityssm.clearElement(occupantsContainer)

      if (lotOccupancyOccupants.length === 0) {
        // eslint-disable-next-line no-unsanitized/property
        occupantsContainer.innerHTML = `<div class="message is-warning">
        <p class="message-body">There are no ${los.escapedAliases.occupants} associated with this record.</p>
        </div>`

        return
      }

      const tableElement = document.createElement('table')
      tableElement.className = 'table is-fullwidth is-striped is-hoverable'

      // eslint-disable-next-line no-unsanitized/property
      tableElement.innerHTML = `<thead><tr>
      <th>${los.escapedAliases.Occupant}</th>
      <th>Address</th>
      <th>Other Contact</th>
      <th>Comment</th>
      <th class="is-hidden-print"><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>`

      for (const lotOccupancyOccupant of lotOccupancyOccupants) {
        const tableRowElement = document.createElement('tr')
        tableRowElement.dataset.lotOccupantIndex =
          lotOccupancyOccupant.lotOccupantIndex?.toString()

        // eslint-disable-next-line no-unsanitized/property
        tableRowElement.innerHTML = `<td>
        ${cityssm.escapeHTML(
          (lotOccupancyOccupant.occupantName ?? '') === '' &&
            (lotOccupancyOccupant.occupantFamilyName ?? '') === ''
            ? '(No Name)'
            : `${lotOccupancyOccupant.occupantName} ${lotOccupancyOccupant.occupantFamilyName}`
        )}<br />
        <span class="tag">
          <i class="fas fa-fw fa-${cityssm.escapeHTML(lotOccupancyOccupant.fontAwesomeIconClass ?? '')}" aria-hidden="true"></i>
          <span class="ml-1">${cityssm.escapeHTML(lotOccupancyOccupant.lotOccupantType ?? '')}</span>
        </span>
      </td><td>
        ${
          (lotOccupancyOccupant.occupantAddress1 ?? '') === ''
            ? ''
            : `${cityssm.escapeHTML(lotOccupancyOccupant.occupantAddress1 ?? '')}<br />`
        }
        ${
          (lotOccupancyOccupant.occupantAddress2 ?? '') === ''
            ? ''
            : `${cityssm.escapeHTML(lotOccupancyOccupant.occupantAddress2 ?? '')}<br />`
        }
        ${
          (lotOccupancyOccupant.occupantCity ?? '') === ''
            ? ''
            : `${cityssm.escapeHTML(lotOccupancyOccupant.occupantCity ?? '')}, `
        }
        ${cityssm.escapeHTML(lotOccupancyOccupant.occupantProvince ?? '')}<br />
        ${cityssm.escapeHTML(lotOccupancyOccupant.occupantPostalCode ?? '')}
      </td><td>
        ${
          (lotOccupancyOccupant.occupantPhoneNumber ?? '') === ''
            ? ''
            : `${cityssm.escapeHTML(
                lotOccupancyOccupant.occupantPhoneNumber ?? ''
              )}<br />`
        }
        ${
          (lotOccupancyOccupant.occupantEmailAddress ?? '') === ''
            ? ''
            : cityssm.escapeHTML(
                lotOccupancyOccupant.occupantEmailAddress ?? ''
              )
        }
      </td><td>
        <span data-tooltip="${cityssm.escapeHTML(
          (lotOccupancyOccupant.occupantCommentTitle ?? '') === ''
            ? 'Comment'
            : lotOccupancyOccupant.occupantCommentTitle ?? ''
        )}">
        ${cityssm.escapeHTML(lotOccupancyOccupant.occupantComment ?? '')}
        </span>
      </td><td class="is-hidden-print">
        <div class="buttons are-small is-justify-content-end">
          <button class="button is-primary button--edit" type="button">
            <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
            <span>Edit</span>
          </button>
          <button class="button is-light is-danger button--delete" data-tooltip="Delete ${los.escapedAliases.Occupant}" type="button" aria-label="Delete">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      </td>`

        tableRowElement
          .querySelector('.button--edit')
          ?.addEventListener('click', openEditLotOccupancyOccupant)

        tableRowElement
          .querySelector('.button--delete')
          ?.addEventListener('click', deleteLotOccupancyOccupant)

        tableElement.querySelector('tbody')?.append(tableRowElement)
      }

      occupantsContainer.append(tableElement)
    }

    if (isCreate) {
      const lotOccupantTypeIdElement = document.querySelector(
        '#lotOccupancy--lotOccupantTypeId'
      ) as HTMLSelectElement

      lotOccupantTypeIdElement.addEventListener('change', () => {
        const occupantFields: NodeListOf<
          HTMLInputElement | HTMLTextAreaElement
        > = formElement.querySelectorAll("[data-table='LotOccupancyOccupant']")

        for (const occupantField of occupantFields) {
          occupantField.disabled = lotOccupantTypeIdElement.value === ''
        }

        let occupantCommentTitle =
          lotOccupantTypeIdElement.selectedOptions[0].dataset
            .occupantCommentTitle ?? ''
        if (occupantCommentTitle === '') {
          occupantCommentTitle = 'Comment'
        }

        ;(
          formElement.querySelector(
            '#lotOccupancy--occupantCommentTitle'
          ) as HTMLElement
        ).textContent = occupantCommentTitle
      })
    } else {
      renderLotOccupancyOccupants()
    }

    document
      .querySelector('#button--addOccupant')
      ?.addEventListener('click', () => {
        let addCloseModalFunction: () => void

        let addFormElement: HTMLFormElement

        let searchFormElement: HTMLFormElement
        let searchResultsElement: HTMLElement

        function addOccupant(
          formOrObject: HTMLFormElement | LotOccupancyOccupant
        ): void {
          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doAddLotOccupancyOccupant`,
            formOrObject,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                lotOccupancyOccupants: LotOccupancyOccupant[]
              }

              if (responseJSON.success) {
                lotOccupancyOccupants = responseJSON.lotOccupancyOccupants
                addCloseModalFunction()
                renderLotOccupancyOccupants()
              } else {
                bulmaJS.alert({
                  title: `Error Adding ${los.escapedAliases.Occupant}`,
                  message: responseJSON.errorMessage ?? '',
                  contextualColorName: 'danger'
                })
              }
            }
          )
        }

        function addOccupantFromForm(submitEvent: SubmitEvent): void {
          submitEvent.preventDefault()
          addOccupant(addFormElement)
        }

        let pastOccupantSearchResults: LotOccupancyOccupant[] = []

        function addOccupantFromCopy(clickEvent: MouseEvent): void {
          clickEvent.preventDefault()

          const panelBlockElement = clickEvent.currentTarget as HTMLElement

          const occupant =
            pastOccupantSearchResults[
              Number.parseInt(panelBlockElement.dataset.index ?? '', 10)
            ]

          const lotOccupantTypeId = (
            panelBlockElement
              .closest('.modal')
              ?.querySelector(
                '#lotOccupancyOccupantCopy--lotOccupantTypeId'
              ) as HTMLSelectElement
          ).value

          if (lotOccupantTypeId === '') {
            bulmaJS.alert({
              title: `No ${los.escapedAliases.Occupant} Type Selected`,
              message: `Select a type to apply to the newly added ${los.escapedAliases.occupant}.`,
              contextualColorName: 'warning'
            })
          } else {
            occupant.lotOccupantTypeId = Number.parseInt(lotOccupantTypeId, 10)
            occupant.burialSiteContractId = Number.parseInt(burialSiteContractId, 10)
            addOccupant(occupant)
          }
        }

        function searchOccupants(event: Event): void {
          event.preventDefault()

          if (
            (
              searchFormElement.querySelector(
                '#lotOccupancyOccupantCopy--searchFilter'
              ) as HTMLInputElement
            ).value === ''
          ) {
            searchResultsElement.innerHTML = `<div class="message is-info">
          <p class="message-body">Enter a partial name or address in the search field above.</p>
          </div>`

            return
          }

          // eslint-disable-next-line no-unsanitized/property
          searchResultsElement.innerHTML =
            los.getLoadingParagraphHTML('Searching...')

          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doSearchPastOccupants`,
            searchFormElement,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                occupants: LotOccupancyOccupant[]
              }

              pastOccupantSearchResults = responseJSON.occupants

              const panelElement = document.createElement('div')
              panelElement.className = 'panel'

              for (const [
                index,
                occupant
              ] of pastOccupantSearchResults.entries()) {
                const panelBlockElement = document.createElement('a')
                panelBlockElement.className = 'panel-block is-block'
                panelBlockElement.href = '#'
                panelBlockElement.dataset.index = index.toString()

                // eslint-disable-next-line no-unsanitized/property
                panelBlockElement.innerHTML = `<strong>
                ${cityssm.escapeHTML(occupant.occupantName ?? '')} ${cityssm.escapeHTML(occupant.occupantFamilyName ?? '')}
              </strong><br />
              <div class="columns">
                <div class="column">
                  ${cityssm.escapeHTML(occupant.occupantAddress1 ?? '')}<br />
                  ${
                    (occupant.occupantAddress2 ?? '') === ''
                      ? ''
                      : `${cityssm.escapeHTML(occupant.occupantAddress2 ?? '')}<br />`
                  }${cityssm.escapeHTML(occupant.occupantCity ?? '')}, ${cityssm.escapeHTML(occupant.occupantProvince ?? '')}<br />
                  ${cityssm.escapeHTML(occupant.occupantPostalCode ?? '')}
                </div>
                <div class="column">
                ${
                  (occupant.occupantPhoneNumber ?? '') === ''
                    ? ''
                    : `${cityssm.escapeHTML(occupant.occupantPhoneNumber ?? '')}<br />`
                }
                ${cityssm.escapeHTML(occupant.occupantEmailAddress ?? '')}<br />
                </div>
                </div>`

                panelBlockElement.addEventListener('click', addOccupantFromCopy)

                panelElement.append(panelBlockElement)
              }

              searchResultsElement.innerHTML = ''
              searchResultsElement.append(panelElement)
            }
          )
        }

        cityssm.openHtmlModal('lotOccupancy-addOccupant', {
          onshow(modalElement) {
            los.populateAliases(modalElement)
            ;(
              modalElement.querySelector(
                '#lotOccupancyOccupantAdd--burialSiteContractId'
              ) as HTMLInputElement
            ).value = burialSiteContractId

            const lotOccupantTypeSelectElement = modalElement.querySelector(
              '#lotOccupancyOccupantAdd--lotOccupantTypeId'
            ) as HTMLSelectElement

            const lotOccupantTypeCopySelectElement = modalElement.querySelector(
              '#lotOccupancyOccupantCopy--lotOccupantTypeId'
            ) as HTMLSelectElement

            for (const lotOccupantType of exports.lotOccupantTypes as LotOccupantType[]) {
              const optionElement = document.createElement('option')
              optionElement.value = lotOccupantType.lotOccupantTypeId.toString()
              optionElement.textContent = lotOccupantType.lotOccupantType

              optionElement.dataset.occupantCommentTitle =
                lotOccupantType.occupantCommentTitle

              optionElement.dataset.fontAwesomeIconClass =
                lotOccupantType.fontAwesomeIconClass

              lotOccupantTypeSelectElement.append(optionElement)

              lotOccupantTypeCopySelectElement.append(
                optionElement.cloneNode(true)
              )
            }

            ;(
              modalElement.querySelector(
                '#lotOccupancyOccupantAdd--occupantCity'
              ) as HTMLInputElement
            ).value = exports.occupantCityDefault as string
            ;(
              modalElement.querySelector(
                '#lotOccupancyOccupantAdd--occupantProvince'
              ) as HTMLInputElement
            ).value = exports.occupantProvinceDefault as string
          },
          onshown(modalElement, closeModalFunction) {
            bulmaJS.toggleHtmlClipped()
            bulmaJS.init(modalElement)

            const lotOccupantTypeIdElement = modalElement.querySelector(
              '#lotOccupancyOccupantAdd--lotOccupantTypeId'
            ) as HTMLSelectElement

            lotOccupantTypeIdElement.focus()

            lotOccupantTypeIdElement.addEventListener('change', () => {
              const fontAwesomeIconClass =
                lotOccupantTypeIdElement.selectedOptions[0].dataset
                  .fontAwesomeIconClass ?? 'user'

              ;(
                modalElement.querySelector(
                  '#lotOccupancyOccupantAdd--fontAwesomeIconClass'
                ) as HTMLElement
              ).innerHTML =
                `<i class="fas fa-fw fa-${cityssm.escapeHTML(fontAwesomeIconClass)}" aria-hidden="true"></i>`

              let occupantCommentTitle =
                lotOccupantTypeIdElement.selectedOptions[0].dataset
                  .occupantCommentTitle ?? ''

              if (occupantCommentTitle === '') {
                occupantCommentTitle = 'Comment'
              }

              ;(
                modalElement.querySelector(
                  '#lotOccupancyOccupantAdd--occupantCommentTitle'
                ) as HTMLElement
              ).textContent = occupantCommentTitle
            })

            addFormElement = modalElement.querySelector(
              '#form--lotOccupancyOccupantAdd'
            ) as HTMLFormElement
            addFormElement.addEventListener('submit', addOccupantFromForm)

            searchResultsElement = modalElement.querySelector(
              '#lotOccupancyOccupantCopy--searchResults'
            ) as HTMLElement

            searchFormElement = modalElement.querySelector(
              '#form--lotOccupancyOccupantCopy'
            ) as HTMLFormElement
            searchFormElement.addEventListener('submit', (formEvent) => {
              formEvent.preventDefault()
            })
            ;(
              modalElement.querySelector(
                '#lotOccupancyOccupantCopy--searchFilter'
              ) as HTMLInputElement
            ).addEventListener('change', searchOccupants)

            addCloseModalFunction = closeModalFunction
          },
          onremoved() {
            bulmaJS.toggleHtmlClipped()
            ;(
              document.querySelector(
                '#button--addOccupant'
              ) as HTMLButtonElement
            ).focus()
          }
        })
      })
  })()

  if (!isCreate) {
    /**
     * Comments
     */
    ;(() => {
      let lotOccupancyComments =
        exports.lotOccupancyComments as LotOccupancyComment[]
      delete exports.lotOccupancyComments

      function openEditLotOccupancyComment(clickEvent: Event): void {
        const burialSiteContractCommentId = Number.parseInt(
          (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
            .burialSiteContractCommentId ?? '',
          10
        )

        const lotOccupancyComment = lotOccupancyComments.find(
          (currentLotOccupancyComment) => {
            return (
              currentLotOccupancyComment.burialSiteContractCommentId ===
              burialSiteContractCommentId
            )
          }
        ) as LotOccupancyComment

        let editFormElement: HTMLFormElement
        let editCloseModalFunction: () => void

        function editComment(submitEvent: SubmitEvent): void {
          submitEvent.preventDefault()

          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doUpdateLotOccupancyComment`,
            editFormElement,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                lotOccupancyComments?: LotOccupancyComment[]
              }

              if (responseJSON.success) {
                lotOccupancyComments = responseJSON.lotOccupancyComments ?? []
                editCloseModalFunction()
                renderLotOccupancyComments()
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

        cityssm.openHtmlModal('lotOccupancy-editComment', {
          onshow(modalElement) {
            los.populateAliases(modalElement)
            ;(
              modalElement.querySelector(
                '#lotOccupancyCommentEdit--burialSiteContractId'
              ) as HTMLInputElement
            ).value = burialSiteContractId
            ;(
              modalElement.querySelector(
                '#lotOccupancyCommentEdit--burialSiteContractCommentId'
              ) as HTMLInputElement
            ).value = burialSiteContractCommentId.toString()
            ;(
              modalElement.querySelector(
                '#lotOccupancyCommentEdit--lotOccupancyComment'
              ) as HTMLInputElement
            ).value = lotOccupancyComment.lotOccupancyComment ?? ''

            const lotOccupancyCommentDateStringElement =
              modalElement.querySelector(
                '#lotOccupancyCommentEdit--lotOccupancyCommentDateString'
              ) as HTMLInputElement

            lotOccupancyCommentDateStringElement.value =
              lotOccupancyComment.lotOccupancyCommentDateString ?? ''

            const currentDateString = cityssm.dateToString(new Date())

            lotOccupancyCommentDateStringElement.max =
              lotOccupancyComment.lotOccupancyCommentDateString! <=
              currentDateString
                ? currentDateString
                : lotOccupancyComment.lotOccupancyCommentDateString ?? ''
            ;(
              modalElement.querySelector(
                '#lotOccupancyCommentEdit--lotOccupancyCommentTimeString'
              ) as HTMLInputElement
            ).value = lotOccupancyComment.lotOccupancyCommentTimeString ?? ''
          },
          onshown(modalElement, closeModalFunction) {
            bulmaJS.toggleHtmlClipped()

            los.initializeDatePickers(modalElement)
            ;(
              modalElement.querySelector(
                '#lotOccupancyCommentEdit--lotOccupancyComment'
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

      function deleteLotOccupancyComment(clickEvent: Event): void {
        const burialSiteContractCommentId = Number.parseInt(
          (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
            .burialSiteContractCommentId ?? '',
          10
        )

        function doDelete(): void {
          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancyComment`,
            {
              burialSiteContractId,
              burialSiteContractCommentId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                lotOccupancyComments: LotOccupancyComment[]
              }

              if (responseJSON.success) {
                lotOccupancyComments = responseJSON.lotOccupancyComments
                renderLotOccupancyComments()
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

      function renderLotOccupancyComments(): void {
        const containerElement = document.querySelector(
          '#container--lotOccupancyComments'
        ) as HTMLElement

        if (lotOccupancyComments.length === 0) {
          containerElement.innerHTML = `<div class="message is-info">
      <p class="message-body">There are no comments associated with this record.</p>
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

        for (const lotOccupancyComment of lotOccupancyComments) {
          const tableRowElement = document.createElement('tr')
          tableRowElement.dataset.burialSiteContractCommentId =
            lotOccupancyComment.burialSiteContractCommentId?.toString()

          tableRowElement.innerHTML = `<td>${cityssm.escapeHTML(lotOccupancyComment.recordCreate_userName ?? '')}</td>
      <td>
      ${cityssm.escapeHTML(
        lotOccupancyComment.lotOccupancyCommentDateString ?? ''
      )}
      ${cityssm.escapeHTML(
        lotOccupancyComment.lotOccupancyCommentTime === 0
          ? ''
          : lotOccupancyComment.lotOccupancyCommentTimePeriodString ?? ''
      )}
      </td>
      <td>${cityssm.escapeHTML(lotOccupancyComment.lotOccupancyComment ?? '')}</td>
      <td class="is-hidden-print">
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
            ?.addEventListener('click', openEditLotOccupancyComment)

          tableRowElement
            .querySelector('.button--delete')
            ?.addEventListener('click', deleteLotOccupancyComment)

          tableElement.querySelector('tbody')?.append(tableRowElement)
        }

        containerElement.innerHTML = ''
        containerElement.append(tableElement)
      }

      document
        .querySelector('#button--addComment')
        ?.addEventListener('click', () => {
          let addFormElement: HTMLFormElement
          let addCloseModalFunction: () => void

          function addComment(submitEvent: SubmitEvent): void {
            submitEvent.preventDefault()

            cityssm.postJSON(
              `${los.urlPrefix}/lotOccupancies/doAddLotOccupancyComment`,
              addFormElement,
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as {
                  success: boolean
                  errorMessage?: string
                  lotOccupancyComments: LotOccupancyComment[]
                }

                if (responseJSON.success) {
                  lotOccupancyComments = responseJSON.lotOccupancyComments
                  addCloseModalFunction()
                  renderLotOccupancyComments()
                } else {
                  bulmaJS.alert({
                    title: 'Error Adding Comment',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                  })
                }
              }
            )
          }

          cityssm.openHtmlModal('lotOccupancy-addComment', {
            onshow(modalElement) {
              los.populateAliases(modalElement)
              ;(
                modalElement.querySelector(
                  '#lotOccupancyCommentAdd--burialSiteContractId'
                ) as HTMLInputElement
              ).value = burialSiteContractId
            },
            onshown(modalElement, closeModalFunction) {
              bulmaJS.toggleHtmlClipped()
              ;(
                modalElement.querySelector(
                  '#lotOccupancyCommentAdd--lotOccupancyComment'
                ) as HTMLTextAreaElement
              ).focus()

              addFormElement = modalElement.querySelector(
                'form'
              ) as HTMLFormElement

              addFormElement.addEventListener('submit', addComment)

              addCloseModalFunction = closeModalFunction
            },
            onremoved: () => {
              bulmaJS.toggleHtmlClipped()
              ;(
                document.querySelector(
                  '#button--addComment'
                ) as HTMLButtonElement
              ).focus()
            }
          })
        })

      renderLotOccupancyComments()
    })()

    /**
     * Fees
     */
    ;(() => {
      let lotOccupancyFees = exports.lotOccupancyFees as LotOccupancyFee[]
      delete exports.lotOccupancyFees

      const lotOccupancyFeesContainerElement = document.querySelector(
        '#container--lotOccupancyFees'
      ) as HTMLElement

      function getFeeGrandTotal(): number {
        let feeGrandTotal = 0

        for (const lotOccupancyFee of lotOccupancyFees) {
          feeGrandTotal +=
            ((lotOccupancyFee.feeAmount ?? 0) +
              (lotOccupancyFee.taxAmount ?? 0)) *
            (lotOccupancyFee.quantity ?? 0)
        }

        return feeGrandTotal
      }

      function editLotOccupancyFeeQuantity(clickEvent: Event): void {
        const feeId = Number.parseInt(
          (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
            .feeId ?? '',
          10
        )

        const fee = lotOccupancyFees.find((possibleFee) => {
          return possibleFee.feeId === feeId
        }) as LotOccupancyFee

        let updateCloseModalFunction: () => void

        function doUpdateQuantity(formEvent: SubmitEvent): void {
          formEvent.preventDefault()

          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doUpdateLotOccupancyFeeQuantity`,
            formEvent.currentTarget,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                lotOccupancyFees: LotOccupancyFee[]
              }

              if (responseJSON.success) {
                lotOccupancyFees = responseJSON.lotOccupancyFees
                renderLotOccupancyFees()
                updateCloseModalFunction()
              } else {
                bulmaJS.alert({
                  title: 'Error Updating Quantity',
                  message: 'Please try again.',
                  contextualColorName: 'danger'
                })
              }
            }
          )
        }

        cityssm.openHtmlModal('lotOccupancy-editFeeQuantity', {
          onshow(modalElement) {
            ;(
              modalElement.querySelector(
                '#lotOccupancyFeeQuantity--burialSiteContractId'
              ) as HTMLInputElement
            ).value = burialSiteContractId
            ;(
              modalElement.querySelector(
                '#lotOccupancyFeeQuantity--feeId'
              ) as HTMLInputElement
            ).value = fee.feeId.toString()
            ;(
              modalElement.querySelector(
                '#lotOccupancyFeeQuantity--quantity'
              ) as HTMLInputElement
            ).valueAsNumber = fee.quantity ?? 0
            ;(
              modalElement.querySelector(
                '#lotOccupancyFeeQuantity--quantityUnit'
              ) as HTMLElement
            ).textContent = fee.quantityUnit ?? ''
          },
          onshown(modalElement, closeModalFunction) {
            bulmaJS.toggleHtmlClipped()

            updateCloseModalFunction = closeModalFunction
            ;(
              modalElement.querySelector(
                '#lotOccupancyFeeQuantity--quantity'
              ) as HTMLInputElement
            ).focus()

            modalElement
              .querySelector('form')
              ?.addEventListener('submit', doUpdateQuantity)
          },
          onremoved() {
            bulmaJS.toggleHtmlClipped()
          }
        })
      }

      function deleteLotOccupancyFee(clickEvent: Event): void {
        const feeId = (
          (clickEvent.currentTarget as HTMLElement).closest(
            '.container--lotOccupancyFee'
          ) as HTMLElement
        ).dataset.feeId

        function doDelete(): void {
          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancyFee`,
            {
              burialSiteContractId,
              feeId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                lotOccupancyFees: LotOccupancyFee[]
              }

              if (responseJSON.success) {
                lotOccupancyFees = responseJSON.lotOccupancyFees
                renderLotOccupancyFees()
              } else {
                bulmaJS.alert({
                  title: 'Error Deleting Fee',
                  message: responseJSON.errorMessage ?? '',
                  contextualColorName: 'danger'
                })
              }
            }
          )
        }

        bulmaJS.confirm({
          title: 'Delete Fee',
          message: 'Are you sure you want to delete this fee?',
          contextualColorName: 'warning',
          okButton: {
            text: 'Yes, Delete Fee',
            callbackFunction: doDelete
          }
        })
      }

      function renderLotOccupancyFees(): void {
        if (lotOccupancyFees.length === 0) {
          lotOccupancyFeesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no fees associated with this record.</p>
        </div>`

          renderLotOccupancyTransactions()

          return
        }

        // eslint-disable-next-line no-secrets/no-secrets
        lotOccupancyFeesContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
      <thead><tr>
        <th>Fee</th>
        <th><span class="is-sr-only">Unit Cost</span></th>
        <th class="has-width-1"><span class="is-sr-only">&times;</span></th>
        <th class="has-width-1"><span class="is-sr-only">Quantity</span></th>
        <th class="has-width-1"><span class="is-sr-only">equals</span></th>
        <th class="has-width-1 has-text-right">Total</th>
        <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>
      <tfoot><tr>
        <th colspan="5">Subtotal</th>
        <td class="has-text-weight-bold has-text-right" id="lotOccupancyFees--feeAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Tax</th>
        <td class="has-text-right" id="lotOccupancyFees--taxAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Grand Total</th>
        <td class="has-text-weight-bold has-text-right" id="lotOccupancyFees--grandTotal"></td>
        <td class="is-hidden-print"></td>
      </tr></tfoot></table>`

        let feeAmountTotal = 0
        let taxAmountTotal = 0

        for (const lotOccupancyFee of lotOccupancyFees) {
          const tableRowElement = document.createElement('tr')
          tableRowElement.className = 'container--lotOccupancyFee'
          tableRowElement.dataset.feeId = lotOccupancyFee.feeId.toString()
          tableRowElement.dataset.includeQuantity =
            lotOccupancyFee.includeQuantity ?? false ? '1' : '0'

          // eslint-disable-next-line no-unsanitized/property
          tableRowElement.innerHTML = `<td colspan="${lotOccupancyFee.quantity === 1 ? '5' : '1'}">
      ${cityssm.escapeHTML(lotOccupancyFee.feeName ?? '')}<br />
      <span class="tag">${cityssm.escapeHTML(lotOccupancyFee.feeCategory ?? '')}</span>
      </td>
      ${
        lotOccupancyFee.quantity === 1
          ? ''
          : `<td class="has-text-right">
              $${lotOccupancyFee.feeAmount?.toFixed(2)}
              </td>
              <td>&times;</td>
              <td class="has-text-right">${lotOccupancyFee.quantity?.toString()}</td>
              <td>=</td>`
      }
      <td class="has-text-right">
        $${((lotOccupancyFee.feeAmount ?? 0) * (lotOccupancyFee.quantity ?? 0)).toFixed(2)}
      </td>
      <td class="is-hidden-print">
      <div class="buttons are-small is-flex-wrap-nowrap is-justify-content-end">
      ${
        lotOccupancyFee.includeQuantity ?? false
          ? `<button class="button is-primary button--editQuantity">
              <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
              <span>Edit</span>
              </button>`
          : ''
      }
      <button class="button is-danger is-light button--delete" data-tooltip="Delete Fee" type="button">
        <i class="fas fa-trash" aria-hidden="true"></i>
      </button>
      </div>
      </td>`

          tableRowElement
            .querySelector('.button--editQuantity')
            ?.addEventListener('click', editLotOccupancyFeeQuantity)

          tableRowElement
            .querySelector('.button--delete')
            ?.addEventListener('click', deleteLotOccupancyFee)

          lotOccupancyFeesContainerElement
            .querySelector('tbody')
            ?.append(tableRowElement)

          feeAmountTotal +=
            (lotOccupancyFee.feeAmount ?? 0) * (lotOccupancyFee.quantity ?? 0)

          taxAmountTotal +=
            (lotOccupancyFee.taxAmount ?? 0) * (lotOccupancyFee.quantity ?? 0)
        }

        ;(
          lotOccupancyFeesContainerElement.querySelector(
            '#lotOccupancyFees--feeAmountTotal'
          ) as HTMLElement
        ).textContent = `$${feeAmountTotal.toFixed(2)}`
        ;(
          lotOccupancyFeesContainerElement.querySelector(
            '#lotOccupancyFees--taxAmountTotal'
          ) as HTMLElement
        ).textContent = `$${taxAmountTotal.toFixed(2)}`
        ;(
          lotOccupancyFeesContainerElement.querySelector(
            '#lotOccupancyFees--grandTotal'
          ) as HTMLElement
        ).textContent = `$${(feeAmountTotal + taxAmountTotal).toFixed(2)}`

        renderLotOccupancyTransactions()
      }

      const addFeeButtonElement = document.querySelector(
        '#button--addFee'
      ) as HTMLButtonElement

      addFeeButtonElement.addEventListener('click', () => {
        if (los.hasUnsavedChanges()) {
          bulmaJS.alert({
            message: 'Please save all unsaved changes before adding fees.',
            contextualColorName: 'warning'
          })
          return
        }

        let feeCategories: FeeCategory[]

        let feeFilterElement: HTMLInputElement
        let feeFilterResultsElement: HTMLElement

        function doAddFeeCategory(clickEvent: Event): void {
          clickEvent.preventDefault()

          const feeCategoryId = Number.parseInt(
            (clickEvent.currentTarget as HTMLElement).dataset.feeCategoryId ??
              '',
            10
          )

          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doAddLotOccupancyFeeCategory`,
            {
              burialSiteContractId,
              feeCategoryId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                lotOccupancyFees: LotOccupancyFee[]
              }

              if (responseJSON.success) {
                lotOccupancyFees = responseJSON.lotOccupancyFees
                renderLotOccupancyFees()

                bulmaJS.alert({
                  message: 'Fee Group Added Successfully',
                  contextualColorName: 'success'
                })
              } else {
                bulmaJS.alert({
                  title: 'Error Adding Fee',
                  message: responseJSON.errorMessage ?? '',
                  contextualColorName: 'danger'
                })
              }
            }
          )
        }

        function doAddFee(feeId: number, quantity: number | string = 1): void {
          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doAddLotOccupancyFee`,
            {
              burialSiteContractId,
              feeId,
              quantity
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                lotOccupancyFees: LotOccupancyFee[]
              }

              if (responseJSON.success) {
                lotOccupancyFees = responseJSON.lotOccupancyFees
                renderLotOccupancyFees()
                filterFees()
              } else {
                bulmaJS.alert({
                  title: 'Error Adding Fee',
                  message: responseJSON.errorMessage ?? '',
                  contextualColorName: 'danger'
                })
              }
            }
          )
        }

        function doSetQuantityAndAddFee(fee: Fee): void {
          let quantityElement: HTMLInputElement
          let quantityCloseModalFunction: () => void

          function doSetQuantity(submitEvent: SubmitEvent): void {
            submitEvent.preventDefault()
            doAddFee(fee.feeId, quantityElement.value)
            quantityCloseModalFunction()
          }

          cityssm.openHtmlModal('lotOccupancy-setFeeQuantity', {
            onshow(modalElement) {
              ;(
                modalElement.querySelector(
                  '#lotOccupancyFeeQuantity--quantityUnit'
                ) as HTMLElement
              ).textContent = fee.quantityUnit ?? ''
            },
            onshown(modalElement, closeModalFunction) {
              quantityCloseModalFunction = closeModalFunction

              quantityElement = modalElement.querySelector(
                '#lotOccupancyFeeQuantity--quantity'
              ) as HTMLInputElement

              modalElement
                .querySelector('form')
                ?.addEventListener('submit', doSetQuantity)
            }
          })
        }

        function tryAddFee(clickEvent: Event): void {
          clickEvent.preventDefault()

          const feeId = Number.parseInt(
            (clickEvent.currentTarget as HTMLElement).dataset.feeId ?? '',
            10
          )
          const feeCategoryId = Number.parseInt(
            (clickEvent.currentTarget as HTMLElement).dataset.feeCategoryId ??
              '',
            10
          )

          const feeCategory = feeCategories.find((currentFeeCategory) => {
            return currentFeeCategory.feeCategoryId === feeCategoryId
          }) as FeeCategory

          const fee = feeCategory.fees.find((currentFee) => {
            return currentFee.feeId === feeId
          }) as Fee

          if (fee.includeQuantity ?? false) {
            doSetQuantityAndAddFee(fee)
          } else {
            doAddFee(feeId)
          }
        }

        function filterFees(): void {
          const filterStringPieces = feeFilterElement.value
            .trim()
            .toLowerCase()
            .split(' ')

          feeFilterResultsElement.innerHTML = ''

          for (const feeCategory of feeCategories) {
            const categoryContainerElement = document.createElement('div')

            categoryContainerElement.className = 'container--feeCategory'

            categoryContainerElement.dataset.feeCategoryId =
              feeCategory.feeCategoryId.toString()

            categoryContainerElement.innerHTML = `<div class="columns is-vcentered">
        <div class="column">
          <h4 class="title is-5">
          ${cityssm.escapeHTML(feeCategory.feeCategory ?? '')}
          </h4>
        </div>
        </div>
        <div class="panel mb-5"></div>`

            if (feeCategory.isGroupedFee) {
              // eslint-disable-next-line no-unsanitized/method
              categoryContainerElement
                .querySelector('.columns')
                ?.insertAdjacentHTML(
                  'beforeend',
                  `<div class="column is-narrow has-text-right">
                    <button class="button is-small is-success" type="button" data-fee-category-id="${feeCategory.feeCategoryId}">
                      <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
                      <span>Add Fee Group</span>
                    </button>
                    </div>`
                )

              categoryContainerElement
                .querySelector('button')
                ?.addEventListener('click', doAddFeeCategory)
            }

            let hasFees = false

            for (const fee of feeCategory.fees) {
              // Don't include already applied fees that limit quantity
              if (
                lotOccupancyFeesContainerElement.querySelector(
                  `.container--lotOccupancyFee[data-fee-id='${fee.feeId}'][data-include-quantity='0']`
                ) !== null
              ) {
                continue
              }

              let includeFee = true

              const feeSearchString =
                `${feeCategory.feeCategory ?? ''} ${fee.feeName ?? ''} ${fee.feeDescription ?? ''}`.toLowerCase()

              for (const filterStringPiece of filterStringPieces) {
                if (!feeSearchString.includes(filterStringPiece)) {
                  includeFee = false
                  break
                }
              }

              if (!includeFee) {
                continue
              }

              hasFees = true

              const panelBlockElement = document.createElement(
                feeCategory.isGroupedFee ? 'div' : 'a'
              )
              panelBlockElement.className =
                'panel-block is-block container--fee'
              panelBlockElement.dataset.feeId = fee.feeId.toString()
              panelBlockElement.dataset.feeCategoryId =
                feeCategory.feeCategoryId.toString()

              // eslint-disable-next-line no-unsanitized/property
              panelBlockElement.innerHTML = `<strong>${cityssm.escapeHTML(fee.feeName ?? '')}</strong><br />
          <small>
          ${
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            cityssm
              .escapeHTML(fee.feeDescription ?? '')
              .replaceAll('\n', '<br />')
          }
          </small>`

              if (!feeCategory.isGroupedFee) {
                ;(panelBlockElement as HTMLAnchorElement).href = '#'
                panelBlockElement.addEventListener('click', tryAddFee)
              }
              ;(
                categoryContainerElement.querySelector('.panel') as HTMLElement
              ).append(panelBlockElement)
            }

            if (hasFees) {
              feeFilterResultsElement.append(categoryContainerElement)
            }
          }
        }

        cityssm.openHtmlModal('lotOccupancy-addFee', {
          onshow(modalElement) {
            feeFilterElement = modalElement.querySelector(
              '#feeSelect--feeName'
            ) as HTMLInputElement

            feeFilterResultsElement = modalElement.querySelector(
              '#resultsContainer--feeSelect'
            ) as HTMLElement

            cityssm.postJSON(
              `${los.urlPrefix}/lotOccupancies/doGetFees`,
              {
                burialSiteContractId
              },
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as {
                  feeCategories: FeeCategory[]
                }

                feeCategories = responseJSON.feeCategories

                feeFilterElement.disabled = false
                feeFilterElement.addEventListener('keyup', filterFees)
                feeFilterElement.focus()

                filterFees()
              }
            )
          },
          onshown() {
            bulmaJS.toggleHtmlClipped()
          },
          onhidden() {
            renderLotOccupancyFees()
          },
          onremoved() {
            bulmaJS.toggleHtmlClipped()
            addFeeButtonElement.focus()
          }
        })
      })

      let lotOccupancyTransactions =
        exports.lotOccupancyTransactions as LotOccupancyTransaction[]
      delete exports.lotOccupancyTransactions

      const lotOccupancyTransactionsContainerElement = document.querySelector(
        '#container--lotOccupancyTransactions'
      ) as HTMLElement

      function getTransactionGrandTotal(): number {
        let transactionGrandTotal = 0

        for (const lotOccupancyTransaction of lotOccupancyTransactions) {
          transactionGrandTotal += lotOccupancyTransaction.transactionAmount
        }

        return transactionGrandTotal
      }

      function editLotOccupancyTransaction(clickEvent: Event): void {
        const transactionIndex = Number.parseInt(
          (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
            .transactionIndex ?? '',
          10
        )

        const transaction = lotOccupancyTransactions.find(
          (possibleTransaction) => {
            return possibleTransaction.transactionIndex === transactionIndex
          }
        ) as LotOccupancyTransaction

        let editCloseModalFunction: () => void

        function doEdit(formEvent: SubmitEvent): void {
          formEvent.preventDefault()

          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doUpdateLotOccupancyTransaction`,
            formEvent.currentTarget,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                lotOccupancyTransactions: LotOccupancyTransaction[]
              }

              if (responseJSON.success) {
                lotOccupancyTransactions = responseJSON.lotOccupancyTransactions
                renderLotOccupancyTransactions()
                editCloseModalFunction()
              } else {
                bulmaJS.alert({
                  title: 'Error Updating Transaction',
                  message: 'Please try again.',
                  contextualColorName: 'danger'
                })
              }
            }
          )
        }

        cityssm.openHtmlModal('lotOccupancy-editTransaction', {
          onshow(modalElement) {
            los.populateAliases(modalElement)
            ;(
              modalElement.querySelector(
                '#lotOccupancyTransactionEdit--burialSiteContractId'
              ) as HTMLInputElement
            ).value = burialSiteContractId
            ;(
              modalElement.querySelector(
                '#lotOccupancyTransactionEdit--transactionIndex'
              ) as HTMLInputElement
            ).value = transaction.transactionIndex?.toString() ?? ''
            ;(
              modalElement.querySelector(
                '#lotOccupancyTransactionEdit--transactionAmount'
              ) as HTMLInputElement
            ).value = transaction.transactionAmount.toFixed(2)
            ;(
              modalElement.querySelector(
                '#lotOccupancyTransactionEdit--externalReceiptNumber'
              ) as HTMLInputElement
            ).value = transaction.externalReceiptNumber ?? ''
            ;(
              modalElement.querySelector(
                '#lotOccupancyTransactionEdit--transactionNote'
              ) as HTMLTextAreaElement
            ).value = transaction.transactionNote ?? ''
            ;(
              modalElement.querySelector(
                '#lotOccupancyTransactionEdit--transactionDateString'
              ) as HTMLInputElement
            ).value = transaction.transactionDateString ?? ''
            ;(
              modalElement.querySelector(
                '#lotOccupancyTransactionEdit--transactionTimeString'
              ) as HTMLInputElement
            ).value = transaction.transactionTimeString ?? ''
          },
          onshown(modalElement, closeModalFunction) {
            bulmaJS.toggleHtmlClipped()

            los.initializeDatePickers(modalElement)
            ;(
              modalElement.querySelector(
                '#lotOccupancyTransactionEdit--transactionAmount'
              ) as HTMLInputElement
            ).focus()

            modalElement
              .querySelector('form')
              ?.addEventListener('submit', doEdit)

            editCloseModalFunction = closeModalFunction
          },
          onremoved() {
            bulmaJS.toggleHtmlClipped()
          }
        })
      }

      function deleteLotOccupancyTransaction(clickEvent: Event): void {
        const transactionIndex = (
          (clickEvent.currentTarget as HTMLElement).closest(
            '.container--lotOccupancyTransaction'
          ) as HTMLElement
        ).dataset.transactionIndex

        function doDelete(): void {
          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancyTransaction`,
            {
              burialSiteContractId,
              transactionIndex
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                lotOccupancyTransactions: LotOccupancyTransaction[]
              }

              if (responseJSON.success) {
                lotOccupancyTransactions = responseJSON.lotOccupancyTransactions
                renderLotOccupancyTransactions()
              } else {
                bulmaJS.alert({
                  title: 'Error Deleting Transaction',
                  message: responseJSON.errorMessage ?? '',
                  contextualColorName: 'danger'
                })
              }
            }
          )
        }

        bulmaJS.confirm({
          title: 'Delete Transaction',
          message: 'Are you sure you want to delete this transaction?',
          contextualColorName: 'warning',
          okButton: {
            text: 'Yes, Delete Transaction',
            callbackFunction: doDelete
          }
        })
      }

      function renderLotOccupancyTransactions(): void {
        if (lotOccupancyTransactions.length === 0) {
          // eslint-disable-next-line no-unsanitized/property
          lotOccupancyTransactionsContainerElement.innerHTML = `<div class="message ${lotOccupancyFees.length === 0 ? 'is-info' : 'is-warning'}">
      <p class="message-body">There are no transactions associated with this record.</p>
      </div>`

          return
        }

        // eslint-disable-next-line no-unsanitized/property
        lotOccupancyTransactionsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
      <thead><tr>
        <th class="has-width-1">Date</th>
        <th>${los.escapedAliases.ExternalReceiptNumber}</th>
        <th class="has-text-right has-width-1">Amount</th>
        <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>
      <tfoot><tr>
        <th colspan="2">Transaction Total</th>
        <td class="has-text-weight-bold has-text-right" id="lotOccupancyTransactions--grandTotal"></td>
        <td class="is-hidden-print"></td>
      </tr></tfoot>
      </table>`

        let transactionGrandTotal = 0

        for (const lotOccupancyTransaction of lotOccupancyTransactions) {
          transactionGrandTotal += lotOccupancyTransaction.transactionAmount

          const tableRowElement = document.createElement('tr')
          tableRowElement.className = 'container--lotOccupancyTransaction'
          tableRowElement.dataset.transactionIndex =
            lotOccupancyTransaction.transactionIndex?.toString()

          let externalReceiptNumberHTML = ''

          if (lotOccupancyTransaction.externalReceiptNumber !== '') {
            externalReceiptNumberHTML = cityssm.escapeHTML(
              lotOccupancyTransaction.externalReceiptNumber ?? ''
            )

            if (los.dynamicsGPIntegrationIsEnabled) {
              if (lotOccupancyTransaction.dynamicsGPDocument === undefined) {
                externalReceiptNumberHTML += ` <span data-tooltip="No Matching Document Found">
            <i class="fas fa-times-circle has-text-danger" aria-label="No Matching Document Found"></i>
            </span>`
              } else if (
                lotOccupancyTransaction.dynamicsGPDocument.documentTotal.toFixed(
                  2
                ) === lotOccupancyTransaction.transactionAmount.toFixed(2)
              ) {
                externalReceiptNumberHTML += ` <span data-tooltip="Matching Document Found">
            <i class="fas fa-check-circle has-text-success" aria-label="Matching Document Found"></i>
            </span>`
              } else {
                externalReceiptNumberHTML += ` <span data-tooltip="Matching Document: $${lotOccupancyTransaction.dynamicsGPDocument.documentTotal.toFixed(
                  2
                )}">
            <i class="fas fa-check-circle has-text-warning" aria-label="Matching Document: $${lotOccupancyTransaction.dynamicsGPDocument.documentTotal.toFixed(
              2
            )}"></i>
            </span>`
              }
            }

            externalReceiptNumberHTML += '<br />'
          }

          // eslint-disable-next-line no-unsanitized/property
          tableRowElement.innerHTML = `<td>
      ${cityssm.escapeHTML(lotOccupancyTransaction.transactionDateString ?? '')}
      </td>
      <td>
        ${externalReceiptNumberHTML}
        <small>${cityssm.escapeHTML(lotOccupancyTransaction.transactionNote ?? '')}</small>
      </td>
      <td class="has-text-right">
        $${cityssm.escapeHTML(lotOccupancyTransaction.transactionAmount.toFixed(2))}
      </td>
      <td class="is-hidden-print">
        <div class="buttons are-small is-flex-wrap-nowrap is-justify-content-end">
          <button class="button is-primary button--edit" type="button">
            <span class="icon"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
            <span>Edit</span>
          </button>
          <button class="button is-danger is-light button--delete" data-tooltip="Delete Transaction" type="button">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      </td>`

          tableRowElement
            .querySelector('.button--edit')
            ?.addEventListener('click', editLotOccupancyTransaction)

          tableRowElement
            .querySelector('.button--delete')
            ?.addEventListener('click', deleteLotOccupancyTransaction)

          lotOccupancyTransactionsContainerElement
            .querySelector('tbody')
            ?.append(tableRowElement)
        }

        ;(
          lotOccupancyTransactionsContainerElement.querySelector(
            '#lotOccupancyTransactions--grandTotal'
          ) as HTMLElement
        ).textContent = `$${transactionGrandTotal.toFixed(2)}`

        const feeGrandTotal = getFeeGrandTotal()

        if (feeGrandTotal.toFixed(2) !== transactionGrandTotal.toFixed(2)) {
          lotOccupancyTransactionsContainerElement.insertAdjacentHTML(
            'afterbegin',
            `<div class="message is-warning">
        <div class="message-body">
        <div class="level">
          <div class="level-left">
            <div class="level-item">Outstanding Balance</div>
          </div>
          <div class="level-right">
            <div class="level-item">
              $${cityssm.escapeHTML((feeGrandTotal - transactionGrandTotal).toFixed(2))}
            </div>
          </div>
        </div>
        </div></div>`
          )
        }
      }

      const addTransactionButtonElement = document.querySelector(
        '#button--addTransaction'
      ) as HTMLButtonElement

      addTransactionButtonElement.addEventListener('click', () => {
        let transactionAmountElement: HTMLInputElement
        let externalReceiptNumberElement: HTMLInputElement

        let addCloseModalFunction: () => void

        function doAddTransaction(submitEvent: SubmitEvent): void {
          submitEvent.preventDefault()

          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doAddLotOccupancyTransaction`,
            submitEvent.currentTarget,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                lotOccupancyTransactions: LotOccupancyTransaction[]
              }

              if (responseJSON.success) {
                lotOccupancyTransactions = responseJSON.lotOccupancyTransactions
                addCloseModalFunction()
                renderLotOccupancyTransactions()
              } else {
                bulmaJS.confirm({
                  title: 'Error Adding Transaction',
                  message: responseJSON.errorMessage ?? '',
                  contextualColorName: 'danger'
                })
              }
            }
          )
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention
        function dynamicsGP_refreshExternalReceiptNumberIcon(): void {
          const externalReceiptNumber = externalReceiptNumberElement.value

          const iconElement = externalReceiptNumberElement
            .closest('.control')
            ?.querySelector('.icon') as HTMLElement

          const helpTextElement = externalReceiptNumberElement
            .closest('.field')
            ?.querySelector('.help') as HTMLElement

          if (externalReceiptNumber === '') {
            helpTextElement.innerHTML = '&nbsp;'
            iconElement.innerHTML =
              '<i class="fas fa-minus" aria-hidden="true"></i>'
            return
          }

          cityssm.postJSON(
            `${los.urlPrefix}/lotOccupancies/doGetDynamicsGPDocument`,
            {
              externalReceiptNumber
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                dynamicsGPDocument?: DynamicsGPDocument
              }

              if (
                !responseJSON.success ||
                responseJSON.dynamicsGPDocument === undefined
              ) {
                helpTextElement.textContent = 'No Matching Document Found'
                iconElement.innerHTML =
                  '<i class="fas fa-times-circle" aria-hidden="true"></i>'
              } else if (
                transactionAmountElement.valueAsNumber ===
                responseJSON.dynamicsGPDocument.documentTotal
              ) {
                helpTextElement.textContent = 'Matching Document Found'
                iconElement.innerHTML =
                  '<i class="fas fa-check-circle" aria-hidden="true"></i>'
              } else {
                helpTextElement.textContent = `Matching Document: $${responseJSON.dynamicsGPDocument.documentTotal.toFixed(2)}`
                iconElement.innerHTML =
                  '<i class="fas fa-exclamation-triangle" aria-hidden="true"></i>'
              }
            }
          )
        }

        cityssm.openHtmlModal('lotOccupancy-addTransaction', {
          onshow(modalElement) {
            los.populateAliases(modalElement)
            ;(
              modalElement.querySelector(
                '#lotOccupancyTransactionAdd--burialSiteContractId'
              ) as HTMLInputElement
            ).value = burialSiteContractId.toString()

            const feeGrandTotal = getFeeGrandTotal()
            const transactionGrandTotal = getTransactionGrandTotal()

            transactionAmountElement = modalElement.querySelector(
              '#lotOccupancyTransactionAdd--transactionAmount'
            ) as HTMLInputElement

            transactionAmountElement.min = (-1 * transactionGrandTotal).toFixed(
              2
            )

            transactionAmountElement.max = Math.max(
              feeGrandTotal - transactionGrandTotal,
              0
            ).toFixed(2)

            transactionAmountElement.value = Math.max(
              feeGrandTotal - transactionGrandTotal,
              0
            ).toFixed(2)

            if (los.dynamicsGPIntegrationIsEnabled) {
              externalReceiptNumberElement = modalElement.querySelector(
                // eslint-disable-next-line no-secrets/no-secrets
                '#lotOccupancyTransactionAdd--externalReceiptNumber'
              ) as HTMLInputElement

              const externalReceiptNumberControlElement =
                externalReceiptNumberElement.closest('.control') as HTMLElement

              externalReceiptNumberControlElement.classList.add(
                'has-icons-right'
              )

              externalReceiptNumberControlElement.insertAdjacentHTML(
                'beforeend',
                '<span class="icon is-small is-right"></span>'
              )

              externalReceiptNumberControlElement.insertAdjacentHTML(
                'afterend',
                '<p class="help has-text-right"></p>'
              )

              externalReceiptNumberElement.addEventListener(
                'change',
                dynamicsGP_refreshExternalReceiptNumberIcon
              )

              transactionAmountElement.addEventListener(
                'change',
                dynamicsGP_refreshExternalReceiptNumberIcon
              )

              dynamicsGP_refreshExternalReceiptNumberIcon()
            }
          },
          onshown(modalElement, closeModalFunction) {
            bulmaJS.toggleHtmlClipped()

            transactionAmountElement.focus()

            addCloseModalFunction = closeModalFunction

            modalElement
              .querySelector('form')
              ?.addEventListener('submit', doAddTransaction)
          },
          onremoved() {
            bulmaJS.toggleHtmlClipped()
            addTransactionButtonElement.focus()
          }
        })
      })

      renderLotOccupancyFees()
    })()
  }
})()
