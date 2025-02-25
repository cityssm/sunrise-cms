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
    document.querySelector('#burialSiteContract--burialSiteContractId') as HTMLInputElement
  ).value
  const isCreate = burialSiteContractId === ''

  /*
   * Main form
   */

  let refreshAfterSave = isCreate

  function setUnsavedChanges(): void {
    los.setUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--burialSiteContract']")
      ?.classList.remove('is-light')
  }

  function clearUnsavedChanges(): void {
    los.clearUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--burialSiteContract']")
      ?.classList.add('is-light')
  }

  const formElement = document.querySelector(
    '#form--burialSiteContract'
  ) as HTMLFormElement

  formElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${los.urlPrefix}/contracts/${isCreate ? 'doCreateLotOccupancy' : 'doUpdateLotOccupancy'}`,
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
            globalThis.location.href = los.getBurialSiteContractURL(
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
      `${los.urlPrefix}/contracts/doCopyLotOccupancy`,
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

          globalThis.location.href = los.getBurialSiteContractURL(
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
    .querySelector('#button--copyBurialSiteContract')
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
          `${los.urlPrefix}/contracts/doDeleteLotOccupancy`,
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
              globalThis.location.href = los.getBurialSiteContractURL()
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

      cityssm.openHtmlModal('burialSiteContract-createWorkOrder', {
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
    '#burialSiteContract--contractTypeId'
  ) as HTMLSelectElement

  if (isCreate) {
    const burialSiteContractFieldsContainerElement = document.querySelector(
      '#container--burialSiteContractFields'
    ) as HTMLElement

    contractTypeIdElement.addEventListener('change', () => {
      if (contractTypeIdElement.value === '') {
        // eslint-disable-next-line no-unsanitized/property
        burialSiteContractFieldsContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">Select the ${los.escapedAliases.occupancy} type to load the available fields.</p>
          </div>`

        return
      }

      cityssm.postJSON(
        `${los.urlPrefix}/contracts/doGetContractTypeFields`,
        {
          contractTypeId: contractTypeIdElement.value
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            ContractTypeFields: OccupancyTypeField[]
          }

          if (responseJSON.ContractTypeFields.length === 0) {
            // eslint-disable-next-line no-unsanitized/property
            burialSiteContractFieldsContainerElement.innerHTML = `<div class="message is-info">
              <p class="message-body">There are no additional fields for this ${los.escapedAliases.occupancy} type.</p>
              </div>`

            return
          }

          burialSiteContractFieldsContainerElement.innerHTML = ''

          let contractTypeFieldIds = ''

          for (const occupancyTypeField of responseJSON.ContractTypeFields) {
            contractTypeFieldIds += `,${occupancyTypeField.contractTypeFieldId.toString()}`

            const fieldName = `burialSiteContractFieldValue_${occupancyTypeField.contractTypeFieldId.toString()}`

            const fieldId = `burialSiteContract--${fieldName}`

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

            burialSiteContractFieldsContainerElement.append(fieldElement)
          }

          burialSiteContractFieldsContainerElement.insertAdjacentHTML(
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
    '#burialSiteContract--lotName'
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
        document.querySelector('#burialSiteContract--lotId') as HTMLInputElement
      ).value = lotId.toString()
      ;(
        document.querySelector('#burialSiteContract--lotName') as HTMLInputElement
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
                  ${lot.burialSiteContractCount! > 0 ? 'Currently Occupied' : ''}
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

    cityssm.openHtmlModal('burialSiteContract-selectLot', {
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
          (document.querySelector('#burialSiteContract--lotId') as HTMLInputElement)
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
        document.querySelector('#burialSiteContract--lotId') as HTMLInputElement
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
          document.querySelector('#burialSiteContract--lotId') as HTMLInputElement
        ).value = ''

        setUnsavedChanges()
      }
    })

  // Start Date

  los.initializeDatePickers(formElement)

  document
    .querySelector('#burialSiteContract--contractStartDateString')
    ?.addEventListener('change', () => {
      const endDatePicker = (
        document.querySelector(
          '#burialSiteContract--contractEndDateString'
        ) as HTMLInputElement
      ).bulmaCalendar.datePicker

      endDatePicker.min = (
        document.querySelector(
          '#burialSiteContract--contractStartDateString'
        ) as HTMLInputElement
      ).value

      endDatePicker.refresh()
    })

  los.initializeUnlockFieldButtons(formElement)

  /**
   * Occupants
   */
  ;(() => {
    let burialSiteContractOccupants =
      exports.burialSiteContractOccupants as LotOccupancyOccupant[]

    delete exports.burialSiteContractOccupants

    function openEditLotOccupancyOccupant(clickEvent: Event): void {
      const lotOccupantIndex = Number.parseInt(
        (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
          .lotOccupantIndex ?? '',
        10
      )

      const burialSiteContractOccupant = burialSiteContractOccupants.find(
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
          `${los.urlPrefix}/contracts/doUpdateLotOccupancyOccupant`,
          editFormElement,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
              burialSiteContractOccupants: LotOccupancyOccupant[]
            }

            if (responseJSON.success) {
              burialSiteContractOccupants = responseJSON.burialSiteContractOccupants
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

      cityssm.openHtmlModal('burialSiteContract-editOccupant', {
        onshow(modalElement) {
          los.populateAliases(modalElement)
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--burialSiteContractId'
            ) as HTMLInputElement
          ).value = burialSiteContractId
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--lotOccupantIndex'
            ) as HTMLInputElement
          ).value = lotOccupantIndex.toString()

          const lotOccupantTypeSelectElement = modalElement.querySelector(
            '#burialSiteContractOccupantEdit--lotOccupantTypeId'
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
              burialSiteContractOccupant.lotOccupantTypeId
            ) {
              optionElement.selected = true
              lotOccupantTypeSelected = true
            }

            lotOccupantTypeSelectElement.append(optionElement)
          }

          if (!lotOccupantTypeSelected) {
            const optionElement = document.createElement('option')

            optionElement.value =
              burialSiteContractOccupant.lotOccupantTypeId?.toString() ?? ''
            optionElement.textContent =
              burialSiteContractOccupant.lotOccupantType ?? ''

            optionElement.dataset.occupantCommentTitle =
              burialSiteContractOccupant.occupantCommentTitle

            optionElement.dataset.fontAwesomeIconClass =
              burialSiteContractOccupant.fontAwesomeIconClass

            optionElement.selected = true

            lotOccupantTypeSelectElement.append(optionElement)
          }

          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--fontAwesomeIconClass'
            ) as HTMLElement
          ).innerHTML =
            `<i class="fas fa-fw fa-${cityssm.escapeHTML(burialSiteContractOccupant.fontAwesomeIconClass ?? '')}" aria-hidden="true"></i>`
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--occupantName'
            ) as HTMLInputElement
          ).value = burialSiteContractOccupant.occupantName ?? ''
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--occupantFamilyName'
            ) as HTMLInputElement
          ).value = burialSiteContractOccupant.occupantFamilyName ?? ''
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--occupantAddress1'
            ) as HTMLInputElement
          ).value = burialSiteContractOccupant.occupantAddress1 ?? ''
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--occupantAddress2'
            ) as HTMLInputElement
          ).value = burialSiteContractOccupant.occupantAddress2 ?? ''
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--occupantCity'
            ) as HTMLInputElement
          ).value = burialSiteContractOccupant.occupantCity ?? ''
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--occupantProvince'
            ) as HTMLInputElement
          ).value = burialSiteContractOccupant.occupantProvince ?? ''
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--occupantPostalCode'
            ) as HTMLInputElement
          ).value = burialSiteContractOccupant.occupantPostalCode ?? ''
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--occupantPhoneNumber'
            ) as HTMLInputElement
          ).value = burialSiteContractOccupant.occupantPhoneNumber ?? ''
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--occupantEmailAddress'
            ) as HTMLInputElement
          ).value = burialSiteContractOccupant.occupantEmailAddress ?? ''
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--occupantCommentTitle'
            ) as HTMLLabelElement
          ).textContent =
            (burialSiteContractOccupant.occupantCommentTitle ?? '') === ''
              ? 'Comment'
              : burialSiteContractOccupant.occupantCommentTitle ?? ''
          ;(
            modalElement.querySelector(
              '#burialSiteContractOccupantEdit--occupantComment'
            ) as HTMLTextAreaElement
          ).value = burialSiteContractOccupant.occupantComment ?? ''
        },
        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()

          const lotOccupantTypeIdElement = modalElement.querySelector(
            '#burialSiteContractOccupantEdit--lotOccupantTypeId'
          ) as HTMLSelectElement

          lotOccupantTypeIdElement.focus()

          lotOccupantTypeIdElement.addEventListener('change', () => {
            const fontAwesomeIconClass =
              lotOccupantTypeIdElement.selectedOptions[0].dataset
                .fontAwesomeIconClass ?? 'user'

            ;(
              modalElement.querySelector(
                '#burialSiteContractOccupantEdit--fontAwesomeIconClass'
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
                '#burialSiteContractOccupantEdit--occupantCommentTitle'
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
          `${los.urlPrefix}/contracts/doDeleteLotOccupancyOccupant`,
          {
            burialSiteContractId,
            lotOccupantIndex
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
              burialSiteContractOccupants: LotOccupancyOccupant[]
            }

            if (responseJSON.success) {
              burialSiteContractOccupants = responseJSON.burialSiteContractOccupants
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
        '#container--burialSiteContractOccupants'
      ) as HTMLElement

      cityssm.clearElement(occupantsContainer)

      if (burialSiteContractOccupants.length === 0) {
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

      for (const burialSiteContractOccupant of burialSiteContractOccupants) {
        const tableRowElement = document.createElement('tr')
        tableRowElement.dataset.lotOccupantIndex =
          burialSiteContractOccupant.lotOccupantIndex?.toString()

        // eslint-disable-next-line no-unsanitized/property
        tableRowElement.innerHTML = `<td>
        ${cityssm.escapeHTML(
          (burialSiteContractOccupant.occupantName ?? '') === '' &&
            (burialSiteContractOccupant.occupantFamilyName ?? '') === ''
            ? '(No Name)'
            : `${burialSiteContractOccupant.occupantName} ${burialSiteContractOccupant.occupantFamilyName}`
        )}<br />
        <span class="tag">
          <i class="fas fa-fw fa-${cityssm.escapeHTML(burialSiteContractOccupant.fontAwesomeIconClass ?? '')}" aria-hidden="true"></i>
          <span class="ml-1">${cityssm.escapeHTML(burialSiteContractOccupant.lotOccupantType ?? '')}</span>
        </span>
      </td><td>
        ${
          (burialSiteContractOccupant.occupantAddress1 ?? '') === ''
            ? ''
            : `${cityssm.escapeHTML(burialSiteContractOccupant.occupantAddress1 ?? '')}<br />`
        }
        ${
          (burialSiteContractOccupant.occupantAddress2 ?? '') === ''
            ? ''
            : `${cityssm.escapeHTML(burialSiteContractOccupant.occupantAddress2 ?? '')}<br />`
        }
        ${
          (burialSiteContractOccupant.occupantCity ?? '') === ''
            ? ''
            : `${cityssm.escapeHTML(burialSiteContractOccupant.occupantCity ?? '')}, `
        }
        ${cityssm.escapeHTML(burialSiteContractOccupant.occupantProvince ?? '')}<br />
        ${cityssm.escapeHTML(burialSiteContractOccupant.occupantPostalCode ?? '')}
      </td><td>
        ${
          (burialSiteContractOccupant.occupantPhoneNumber ?? '') === ''
            ? ''
            : `${cityssm.escapeHTML(
                burialSiteContractOccupant.occupantPhoneNumber ?? ''
              )}<br />`
        }
        ${
          (burialSiteContractOccupant.occupantEmailAddress ?? '') === ''
            ? ''
            : cityssm.escapeHTML(
                burialSiteContractOccupant.occupantEmailAddress ?? ''
              )
        }
      </td><td>
        <span data-tooltip="${cityssm.escapeHTML(
          (burialSiteContractOccupant.occupantCommentTitle ?? '') === ''
            ? 'Comment'
            : burialSiteContractOccupant.occupantCommentTitle ?? ''
        )}">
        ${cityssm.escapeHTML(burialSiteContractOccupant.occupantComment ?? '')}
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
        '#burialSiteContract--lotOccupantTypeId'
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
            '#burialSiteContract--occupantCommentTitle'
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
            `${los.urlPrefix}/contracts/doAddLotOccupancyOccupant`,
            formOrObject,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                burialSiteContractOccupants: LotOccupancyOccupant[]
              }

              if (responseJSON.success) {
                burialSiteContractOccupants = responseJSON.burialSiteContractOccupants
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
                '#burialSiteContractOccupantCopy--lotOccupantTypeId'
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
                '#burialSiteContractOccupantCopy--searchFilter'
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
            `${los.urlPrefix}/contracts/doSearchPastOccupants`,
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

        cityssm.openHtmlModal('burialSiteContract-addOccupant', {
          onshow(modalElement) {
            los.populateAliases(modalElement)
            ;(
              modalElement.querySelector(
                '#burialSiteContractOccupantAdd--burialSiteContractId'
              ) as HTMLInputElement
            ).value = burialSiteContractId

            const lotOccupantTypeSelectElement = modalElement.querySelector(
              '#burialSiteContractOccupantAdd--lotOccupantTypeId'
            ) as HTMLSelectElement

            const lotOccupantTypeCopySelectElement = modalElement.querySelector(
              '#burialSiteContractOccupantCopy--lotOccupantTypeId'
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
                '#burialSiteContractOccupantAdd--occupantCity'
              ) as HTMLInputElement
            ).value = exports.occupantCityDefault as string
            ;(
              modalElement.querySelector(
                '#burialSiteContractOccupantAdd--occupantProvince'
              ) as HTMLInputElement
            ).value = exports.occupantProvinceDefault as string
          },
          onshown(modalElement, closeModalFunction) {
            bulmaJS.toggleHtmlClipped()
            bulmaJS.init(modalElement)

            const lotOccupantTypeIdElement = modalElement.querySelector(
              '#burialSiteContractOccupantAdd--lotOccupantTypeId'
            ) as HTMLSelectElement

            lotOccupantTypeIdElement.focus()

            lotOccupantTypeIdElement.addEventListener('change', () => {
              const fontAwesomeIconClass =
                lotOccupantTypeIdElement.selectedOptions[0].dataset
                  .fontAwesomeIconClass ?? 'user'

              ;(
                modalElement.querySelector(
                  '#burialSiteContractOccupantAdd--fontAwesomeIconClass'
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
                  '#burialSiteContractOccupantAdd--occupantCommentTitle'
                ) as HTMLElement
              ).textContent = occupantCommentTitle
            })

            addFormElement = modalElement.querySelector(
              '#form--burialSiteContractOccupantAdd'
            ) as HTMLFormElement
            addFormElement.addEventListener('submit', addOccupantFromForm)

            searchResultsElement = modalElement.querySelector(
              '#burialSiteContractOccupantCopy--searchResults'
            ) as HTMLElement

            searchFormElement = modalElement.querySelector(
              '#form--burialSiteContractOccupantCopy'
            ) as HTMLFormElement
            searchFormElement.addEventListener('submit', (formEvent) => {
              formEvent.preventDefault()
            })
            ;(
              modalElement.querySelector(
                '#burialSiteContractOccupantCopy--searchFilter'
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
      let burialSiteContractComments =
        exports.burialSiteContractComments as LotOccupancyComment[]
      delete exports.burialSiteContractComments

      function openEditLotOccupancyComment(clickEvent: Event): void {
        const burialSiteContractCommentId = Number.parseInt(
          (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
            .burialSiteContractCommentId ?? '',
          10
        )

        const burialSiteContractComment = burialSiteContractComments.find(
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
            `${los.urlPrefix}/contracts/doUpdateLotOccupancyComment`,
            editFormElement,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                burialSiteContractComments?: LotOccupancyComment[]
              }

              if (responseJSON.success) {
                burialSiteContractComments = responseJSON.burialSiteContractComments ?? []
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

        cityssm.openHtmlModal('burialSiteContract-editComment', {
          onshow(modalElement) {
            los.populateAliases(modalElement)
            ;(
              modalElement.querySelector(
                '#burialSiteContractCommentEdit--burialSiteContractId'
              ) as HTMLInputElement
            ).value = burialSiteContractId
            ;(
              modalElement.querySelector(
                '#burialSiteContractCommentEdit--burialSiteContractCommentId'
              ) as HTMLInputElement
            ).value = burialSiteContractCommentId.toString()
            ;(
              modalElement.querySelector(
                '#burialSiteContractCommentEdit--burialSiteContractComment'
              ) as HTMLInputElement
            ).value = burialSiteContractComment.burialSiteContractComment ?? ''

            const burialSiteContractCommentDateStringElement =
              modalElement.querySelector(
                '#burialSiteContractCommentEdit--burialSiteContractCommentDateString'
              ) as HTMLInputElement

            burialSiteContractCommentDateStringElement.value =
              burialSiteContractComment.burialSiteContractCommentDateString ?? ''

            const currentDateString = cityssm.dateToString(new Date())

            burialSiteContractCommentDateStringElement.max =
              burialSiteContractComment.burialSiteContractCommentDateString! <=
              currentDateString
                ? currentDateString
                : burialSiteContractComment.burialSiteContractCommentDateString ?? ''
            ;(
              modalElement.querySelector(
                '#burialSiteContractCommentEdit--burialSiteContractCommentTimeString'
              ) as HTMLInputElement
            ).value = burialSiteContractComment.burialSiteContractCommentTimeString ?? ''
          },
          onshown(modalElement, closeModalFunction) {
            bulmaJS.toggleHtmlClipped()

            los.initializeDatePickers(modalElement)
            ;(
              modalElement.querySelector(
                '#burialSiteContractCommentEdit--burialSiteContractComment'
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
            `${los.urlPrefix}/contracts/doDeleteLotOccupancyComment`,
            {
              burialSiteContractId,
              burialSiteContractCommentId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                burialSiteContractComments: LotOccupancyComment[]
              }

              if (responseJSON.success) {
                burialSiteContractComments = responseJSON.burialSiteContractComments
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
          '#container--burialSiteContractComments'
        ) as HTMLElement

        if (burialSiteContractComments.length === 0) {
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

        for (const burialSiteContractComment of burialSiteContractComments) {
          const tableRowElement = document.createElement('tr')
          tableRowElement.dataset.burialSiteContractCommentId =
            burialSiteContractComment.burialSiteContractCommentId?.toString()

          tableRowElement.innerHTML = `<td>${cityssm.escapeHTML(burialSiteContractComment.recordCreate_userName ?? '')}</td>
      <td>
      ${cityssm.escapeHTML(
        burialSiteContractComment.burialSiteContractCommentDateString ?? ''
      )}
      ${cityssm.escapeHTML(
        burialSiteContractComment.burialSiteContractCommentTime === 0
          ? ''
          : burialSiteContractComment.burialSiteContractCommentTimePeriodString ?? ''
      )}
      </td>
      <td>${cityssm.escapeHTML(burialSiteContractComment.burialSiteContractComment ?? '')}</td>
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
              `${los.urlPrefix}/contracts/doAddLotOccupancyComment`,
              addFormElement,
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as {
                  success: boolean
                  errorMessage?: string
                  burialSiteContractComments: LotOccupancyComment[]
                }

                if (responseJSON.success) {
                  burialSiteContractComments = responseJSON.burialSiteContractComments
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

          cityssm.openHtmlModal('burialSiteContract-addComment', {
            onshow(modalElement) {
              los.populateAliases(modalElement)
              ;(
                modalElement.querySelector(
                  '#burialSiteContractCommentAdd--burialSiteContractId'
                ) as HTMLInputElement
              ).value = burialSiteContractId
            },
            onshown(modalElement, closeModalFunction) {
              bulmaJS.toggleHtmlClipped()
              ;(
                modalElement.querySelector(
                  '#burialSiteContractCommentAdd--burialSiteContractComment'
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
      let burialSiteContractFees = exports.burialSiteContractFees as LotOccupancyFee[]
      delete exports.burialSiteContractFees

      const burialSiteContractFeesContainerElement = document.querySelector(
        '#container--burialSiteContractFees'
      ) as HTMLElement

      function getFeeGrandTotal(): number {
        let feeGrandTotal = 0

        for (const burialSiteContractFee of burialSiteContractFees) {
          feeGrandTotal +=
            ((burialSiteContractFee.feeAmount ?? 0) +
              (burialSiteContractFee.taxAmount ?? 0)) *
            (burialSiteContractFee.quantity ?? 0)
        }

        return feeGrandTotal
      }

      function editLotOccupancyFeeQuantity(clickEvent: Event): void {
        const feeId = Number.parseInt(
          (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
            .feeId ?? '',
          10
        )

        const fee = burialSiteContractFees.find((possibleFee) => {
          return possibleFee.feeId === feeId
        }) as LotOccupancyFee

        let updateCloseModalFunction: () => void

        function doUpdateQuantity(formEvent: SubmitEvent): void {
          formEvent.preventDefault()

          cityssm.postJSON(
            `${los.urlPrefix}/contracts/doUpdateLotOccupancyFeeQuantity`,
            formEvent.currentTarget,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                burialSiteContractFees: LotOccupancyFee[]
              }

              if (responseJSON.success) {
                burialSiteContractFees = responseJSON.burialSiteContractFees
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

        cityssm.openHtmlModal('burialSiteContract-editFeeQuantity', {
          onshow(modalElement) {
            ;(
              modalElement.querySelector(
                '#burialSiteContractFeeQuantity--burialSiteContractId'
              ) as HTMLInputElement
            ).value = burialSiteContractId
            ;(
              modalElement.querySelector(
                '#burialSiteContractFeeQuantity--feeId'
              ) as HTMLInputElement
            ).value = fee.feeId.toString()
            ;(
              modalElement.querySelector(
                '#burialSiteContractFeeQuantity--quantity'
              ) as HTMLInputElement
            ).valueAsNumber = fee.quantity ?? 0
            ;(
              modalElement.querySelector(
                '#burialSiteContractFeeQuantity--quantityUnit'
              ) as HTMLElement
            ).textContent = fee.quantityUnit ?? ''
          },
          onshown(modalElement, closeModalFunction) {
            bulmaJS.toggleHtmlClipped()

            updateCloseModalFunction = closeModalFunction
            ;(
              modalElement.querySelector(
                '#burialSiteContractFeeQuantity--quantity'
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

      function deleteBurialSiteContractFee(clickEvent: Event): void {
        const feeId = (
          (clickEvent.currentTarget as HTMLElement).closest(
            '.container--burialSiteContractFee'
          ) as HTMLElement
        ).dataset.feeId

        function doDelete(): void {
          cityssm.postJSON(
            `${los.urlPrefix}/contracts/doDeleteLotOccupancyFee`,
            {
              burialSiteContractId,
              feeId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                burialSiteContractFees: LotOccupancyFee[]
              }

              if (responseJSON.success) {
                burialSiteContractFees = responseJSON.burialSiteContractFees
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
        if (burialSiteContractFees.length === 0) {
          burialSiteContractFeesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no fees associated with this record.</p>
        </div>`

          renderLotOccupancyTransactions()

          return
        }

        // eslint-disable-next-line no-secrets/no-secrets
        burialSiteContractFeesContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
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
        <td class="has-text-weight-bold has-text-right" id="burialSiteContractFees--feeAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Tax</th>
        <td class="has-text-right" id="burialSiteContractFees--taxAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Grand Total</th>
        <td class="has-text-weight-bold has-text-right" id="burialSiteContractFees--grandTotal"></td>
        <td class="is-hidden-print"></td>
      </tr></tfoot></table>`

        let feeAmountTotal = 0
        let taxAmountTotal = 0

        for (const burialSiteContractFee of burialSiteContractFees) {
          const tableRowElement = document.createElement('tr')
          tableRowElement.className = 'container--burialSiteContractFee'
          tableRowElement.dataset.feeId = burialSiteContractFee.feeId.toString()
          tableRowElement.dataset.includeQuantity =
            burialSiteContractFee.includeQuantity ?? false ? '1' : '0'

          // eslint-disable-next-line no-unsanitized/property
          tableRowElement.innerHTML = `<td colspan="${burialSiteContractFee.quantity === 1 ? '5' : '1'}">
      ${cityssm.escapeHTML(burialSiteContractFee.feeName ?? '')}<br />
      <span class="tag">${cityssm.escapeHTML(burialSiteContractFee.feeCategory ?? '')}</span>
      </td>
      ${
        burialSiteContractFee.quantity === 1
          ? ''
          : `<td class="has-text-right">
              $${burialSiteContractFee.feeAmount?.toFixed(2)}
              </td>
              <td>&times;</td>
              <td class="has-text-right">${burialSiteContractFee.quantity?.toString()}</td>
              <td>=</td>`
      }
      <td class="has-text-right">
        $${((burialSiteContractFee.feeAmount ?? 0) * (burialSiteContractFee.quantity ?? 0)).toFixed(2)}
      </td>
      <td class="is-hidden-print">
      <div class="buttons are-small is-flex-wrap-nowrap is-justify-content-end">
      ${
        burialSiteContractFee.includeQuantity ?? false
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
            ?.addEventListener('click', deleteBurialSiteContractFee)

          burialSiteContractFeesContainerElement
            .querySelector('tbody')
            ?.append(tableRowElement)

          feeAmountTotal +=
            (burialSiteContractFee.feeAmount ?? 0) * (burialSiteContractFee.quantity ?? 0)

          taxAmountTotal +=
            (burialSiteContractFee.taxAmount ?? 0) * (burialSiteContractFee.quantity ?? 0)
        }

        ;(
          burialSiteContractFeesContainerElement.querySelector(
            '#burialSiteContractFees--feeAmountTotal'
          ) as HTMLElement
        ).textContent = `$${feeAmountTotal.toFixed(2)}`
        ;(
          burialSiteContractFeesContainerElement.querySelector(
            '#burialSiteContractFees--taxAmountTotal'
          ) as HTMLElement
        ).textContent = `$${taxAmountTotal.toFixed(2)}`
        ;(
          burialSiteContractFeesContainerElement.querySelector(
            '#burialSiteContractFees--grandTotal'
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
            `${los.urlPrefix}/contracts/doAddLotOccupancyFeeCategory`,
            {
              burialSiteContractId,
              feeCategoryId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                burialSiteContractFees: LotOccupancyFee[]
              }

              if (responseJSON.success) {
                burialSiteContractFees = responseJSON.burialSiteContractFees
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
            `${los.urlPrefix}/contracts/doAddLotOccupancyFee`,
            {
              burialSiteContractId,
              feeId,
              quantity
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                burialSiteContractFees: LotOccupancyFee[]
              }

              if (responseJSON.success) {
                burialSiteContractFees = responseJSON.burialSiteContractFees
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

          cityssm.openHtmlModal('burialSiteContract-setFeeQuantity', {
            onshow(modalElement) {
              ;(
                modalElement.querySelector(
                  '#burialSiteContractFeeQuantity--quantityUnit'
                ) as HTMLElement
              ).textContent = fee.quantityUnit ?? ''
            },
            onshown(modalElement, closeModalFunction) {
              quantityCloseModalFunction = closeModalFunction

              quantityElement = modalElement.querySelector(
                '#burialSiteContractFeeQuantity--quantity'
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
                burialSiteContractFeesContainerElement.querySelector(
                  `.container--burialSiteContractFee[data-fee-id='${fee.feeId}'][data-include-quantity='0']`
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

        cityssm.openHtmlModal('burialSiteContract-addFee', {
          onshow(modalElement) {
            feeFilterElement = modalElement.querySelector(
              '#feeSelect--feeName'
            ) as HTMLInputElement

            feeFilterResultsElement = modalElement.querySelector(
              '#resultsContainer--feeSelect'
            ) as HTMLElement

            cityssm.postJSON(
              `${los.urlPrefix}/contracts/doGetFees`,
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

      let burialSiteContractTransactions =
        exports.burialSiteContractTransactions as LotOccupancyTransaction[]
      delete exports.burialSiteContractTransactions

      const burialSiteContractTransactionsContainerElement = document.querySelector(
        '#container--burialSiteContractTransactions'
      ) as HTMLElement

      function getTransactionGrandTotal(): number {
        let transactionGrandTotal = 0

        for (const burialSiteContractTransaction of burialSiteContractTransactions) {
          transactionGrandTotal += burialSiteContractTransaction.transactionAmount
        }

        return transactionGrandTotal
      }

      function editLotOccupancyTransaction(clickEvent: Event): void {
        const transactionIndex = Number.parseInt(
          (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
            .transactionIndex ?? '',
          10
        )

        const transaction = burialSiteContractTransactions.find(
          (possibleTransaction) => {
            return possibleTransaction.transactionIndex === transactionIndex
          }
        ) as LotOccupancyTransaction

        let editCloseModalFunction: () => void

        function doEdit(formEvent: SubmitEvent): void {
          formEvent.preventDefault()

          cityssm.postJSON(
            `${los.urlPrefix}/contracts/doUpdateLotOccupancyTransaction`,
            formEvent.currentTarget,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                burialSiteContractTransactions: LotOccupancyTransaction[]
              }

              if (responseJSON.success) {
                burialSiteContractTransactions = responseJSON.burialSiteContractTransactions
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

        cityssm.openHtmlModal('burialSiteContract-editTransaction', {
          onshow(modalElement) {
            los.populateAliases(modalElement)
            ;(
              modalElement.querySelector(
                '#burialSiteContractTransactionEdit--burialSiteContractId'
              ) as HTMLInputElement
            ).value = burialSiteContractId
            ;(
              modalElement.querySelector(
                '#burialSiteContractTransactionEdit--transactionIndex'
              ) as HTMLInputElement
            ).value = transaction.transactionIndex?.toString() ?? ''
            ;(
              modalElement.querySelector(
                '#burialSiteContractTransactionEdit--transactionAmount'
              ) as HTMLInputElement
            ).value = transaction.transactionAmount.toFixed(2)
            ;(
              modalElement.querySelector(
                '#burialSiteContractTransactionEdit--externalReceiptNumber'
              ) as HTMLInputElement
            ).value = transaction.externalReceiptNumber ?? ''
            ;(
              modalElement.querySelector(
                '#burialSiteContractTransactionEdit--transactionNote'
              ) as HTMLTextAreaElement
            ).value = transaction.transactionNote ?? ''
            ;(
              modalElement.querySelector(
                '#burialSiteContractTransactionEdit--transactionDateString'
              ) as HTMLInputElement
            ).value = transaction.transactionDateString ?? ''
            ;(
              modalElement.querySelector(
                '#burialSiteContractTransactionEdit--transactionTimeString'
              ) as HTMLInputElement
            ).value = transaction.transactionTimeString ?? ''
          },
          onshown(modalElement, closeModalFunction) {
            bulmaJS.toggleHtmlClipped()

            los.initializeDatePickers(modalElement)
            ;(
              modalElement.querySelector(
                '#burialSiteContractTransactionEdit--transactionAmount'
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

      function deleteBurialSiteContractTransaction(clickEvent: Event): void {
        const transactionIndex = (
          (clickEvent.currentTarget as HTMLElement).closest(
            '.container--burialSiteContractTransaction'
          ) as HTMLElement
        ).dataset.transactionIndex

        function doDelete(): void {
          cityssm.postJSON(
            `${los.urlPrefix}/contracts/doDeleteLotOccupancyTransaction`,
            {
              burialSiteContractId,
              transactionIndex
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                burialSiteContractTransactions: LotOccupancyTransaction[]
              }

              if (responseJSON.success) {
                burialSiteContractTransactions = responseJSON.burialSiteContractTransactions
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
        if (burialSiteContractTransactions.length === 0) {
          // eslint-disable-next-line no-unsanitized/property
          burialSiteContractTransactionsContainerElement.innerHTML = `<div class="message ${burialSiteContractFees.length === 0 ? 'is-info' : 'is-warning'}">
      <p class="message-body">There are no transactions associated with this record.</p>
      </div>`

          return
        }

        // eslint-disable-next-line no-unsanitized/property
        burialSiteContractTransactionsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
      <thead><tr>
        <th class="has-width-1">Date</th>
        <th>${los.escapedAliases.ExternalReceiptNumber}</th>
        <th class="has-text-right has-width-1">Amount</th>
        <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>
      <tfoot><tr>
        <th colspan="2">Transaction Total</th>
        <td class="has-text-weight-bold has-text-right" id="burialSiteContractTransactions--grandTotal"></td>
        <td class="is-hidden-print"></td>
      </tr></tfoot>
      </table>`

        let transactionGrandTotal = 0

        for (const burialSiteContractTransaction of burialSiteContractTransactions) {
          transactionGrandTotal += burialSiteContractTransaction.transactionAmount

          const tableRowElement = document.createElement('tr')
          tableRowElement.className = 'container--burialSiteContractTransaction'
          tableRowElement.dataset.transactionIndex =
            burialSiteContractTransaction.transactionIndex?.toString()

          let externalReceiptNumberHTML = ''

          if (burialSiteContractTransaction.externalReceiptNumber !== '') {
            externalReceiptNumberHTML = cityssm.escapeHTML(
              burialSiteContractTransaction.externalReceiptNumber ?? ''
            )

            if (los.dynamicsGPIntegrationIsEnabled) {
              if (burialSiteContractTransaction.dynamicsGPDocument === undefined) {
                externalReceiptNumberHTML += ` <span data-tooltip="No Matching Document Found">
            <i class="fas fa-times-circle has-text-danger" aria-label="No Matching Document Found"></i>
            </span>`
              } else if (
                burialSiteContractTransaction.dynamicsGPDocument.documentTotal.toFixed(
                  2
                ) === burialSiteContractTransaction.transactionAmount.toFixed(2)
              ) {
                externalReceiptNumberHTML += ` <span data-tooltip="Matching Document Found">
            <i class="fas fa-check-circle has-text-success" aria-label="Matching Document Found"></i>
            </span>`
              } else {
                externalReceiptNumberHTML += ` <span data-tooltip="Matching Document: $${burialSiteContractTransaction.dynamicsGPDocument.documentTotal.toFixed(
                  2
                )}">
            <i class="fas fa-check-circle has-text-warning" aria-label="Matching Document: $${burialSiteContractTransaction.dynamicsGPDocument.documentTotal.toFixed(
              2
            )}"></i>
            </span>`
              }
            }

            externalReceiptNumberHTML += '<br />'
          }

          // eslint-disable-next-line no-unsanitized/property
          tableRowElement.innerHTML = `<td>
      ${cityssm.escapeHTML(burialSiteContractTransaction.transactionDateString ?? '')}
      </td>
      <td>
        ${externalReceiptNumberHTML}
        <small>${cityssm.escapeHTML(burialSiteContractTransaction.transactionNote ?? '')}</small>
      </td>
      <td class="has-text-right">
        $${cityssm.escapeHTML(burialSiteContractTransaction.transactionAmount.toFixed(2))}
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
            ?.addEventListener('click', deleteBurialSiteContractTransaction)

          burialSiteContractTransactionsContainerElement
            .querySelector('tbody')
            ?.append(tableRowElement)
        }

        ;(
          burialSiteContractTransactionsContainerElement.querySelector(
            '#burialSiteContractTransactions--grandTotal'
          ) as HTMLElement
        ).textContent = `$${transactionGrandTotal.toFixed(2)}`

        const feeGrandTotal = getFeeGrandTotal()

        if (feeGrandTotal.toFixed(2) !== transactionGrandTotal.toFixed(2)) {
          burialSiteContractTransactionsContainerElement.insertAdjacentHTML(
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
            `${los.urlPrefix}/contracts/doAddLotOccupancyTransaction`,
            submitEvent.currentTarget,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                burialSiteContractTransactions: LotOccupancyTransaction[]
              }

              if (responseJSON.success) {
                burialSiteContractTransactions = responseJSON.burialSiteContractTransactions
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
            `${los.urlPrefix}/contracts/doGetDynamicsGPDocument`,
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

        cityssm.openHtmlModal('burialSiteContract-addTransaction', {
          onshow(modalElement) {
            los.populateAliases(modalElement)
            ;(
              modalElement.querySelector(
                '#burialSiteContractTransactionAdd--burialSiteContractId'
              ) as HTMLInputElement
            ).value = burialSiteContractId.toString()

            const feeGrandTotal = getFeeGrandTotal()
            const transactionGrandTotal = getTransactionGrandTotal()

            transactionAmountElement = modalElement.querySelector(
              '#burialSiteContractTransactionAdd--transactionAmount'
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
                '#burialSiteContractTransactionAdd--externalReceiptNumber'
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
