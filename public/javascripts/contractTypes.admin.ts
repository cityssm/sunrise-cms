import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../../types/globalTypes.js'
import type {
  OccupancyType,
  OccupancyTypeField
} from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>

type ResponseJSON =
  | {
      success: true
      occupancyTypes: OccupancyType[]
      allContractTypeFields: OccupancyTypeField[]
      contractTypeFieldId?: number
    }
  | {
      success: false
      errorMessage: string
    }
;(() => {
  const los = exports.los as LOS

  const occupancyTypesContainerElement = document.querySelector(
    '#container--occupancyTypes'
  ) as HTMLElement

  const ContractTypePrintsContainerElement = document.querySelector(
    '#container--ContractTypePrints'
  ) as HTMLElement

  let occupancyTypes = exports.occupancyTypes as OccupancyType[]
  delete exports.occupancyTypes

  let allContractTypeFields =
    exports.allContractTypeFields as OccupancyTypeField[]
  delete exports.allContractTypeFields

  const expandedOccupancyTypes = new Set<number>()

  function toggleContractTypeFields(clickEvent: Event): void {
    const toggleButtonElement = clickEvent.currentTarget as HTMLButtonElement

    const occupancyTypeElement = toggleButtonElement.closest(
      '.container--occupancyType'
    ) as HTMLElement

    const contractTypeId = Number.parseInt(
      occupancyTypeElement.dataset.contractTypeId ?? '',
      10
    )

    if (expandedOccupancyTypes.has(contractTypeId)) {
      expandedOccupancyTypes.delete(contractTypeId)
    } else {
      expandedOccupancyTypes.add(contractTypeId)
    }

    // eslint-disable-next-line no-unsanitized/property
    toggleButtonElement.innerHTML = expandedOccupancyTypes.has(contractTypeId)
      ? '<i class="fas fa-fw fa-minus" aria-hidden="true"></i>'
      : '<i class="fas fa-fw fa-plus" aria-hidden="true"></i>'

    const panelBlockElements =
      occupancyTypeElement.querySelectorAll('.panel-block')

    for (const panelBlockElement of panelBlockElements) {
      panelBlockElement.classList.toggle('is-hidden')
    }
  }

  function occupancyTypeResponseHandler(rawResponseJSON: unknown): void {
    const responseJSON = rawResponseJSON as {
      success: boolean
      errorMessage?: string
      occupancyTypes: OccupancyType[]
      allContractTypeFields: OccupancyTypeField[]
    }

    if (responseJSON.success) {
      occupancyTypes = responseJSON.occupancyTypes
      allContractTypeFields = responseJSON.allContractTypeFields
      renderOccupancyTypes()
    } else {
      bulmaJS.alert({
        title: `Error Updating ${los.escapedAliases.Occupancy} Type`,
        message: responseJSON.errorMessage ?? '',
        contextualColorName: 'danger'
      })
    }
  }

  function deleteOccupancyType(clickEvent: Event): void {
    const contractTypeId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--occupancyType'
        ) as HTMLElement
      ).dataset.contractTypeId ?? '',
      10
    )

    function doDelete(): void {
      cityssm.postJSON(
        `${los.urlPrefix}/admin/doDeleteContractType`,
        {
          contractTypeId
        },
        occupancyTypeResponseHandler
      )
    }

    bulmaJS.confirm({
      title: `Delete ${los.escapedAliases.Occupancy} Type`,
      message: `Are you sure you want to delete this ${los.escapedAliases.occupancy} type?`,
      contextualColorName: 'warning',
      okButton: {
        text: `Yes, Delete ${los.escapedAliases.Occupancy} Type`,
        callbackFunction: doDelete
      }
    })
  }

  function openEditOccupancyType(clickEvent: Event): void {
    const contractTypeId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--occupancyType'
        ) as HTMLElement
      ).dataset.contractTypeId ?? '',
      10
    )

    const occupancyType = occupancyTypes.find(
      (currentOccupancyType) =>
        contractTypeId === currentOccupancyType.contractTypeId
    ) as OccupancyType

    let editCloseModalFunction: () => void

    function doEdit(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doUpdateContractType`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          occupancyTypeResponseHandler(responseJSON)
          if (responseJSON.success) {
            editCloseModalFunction()
          }
        }
      )
    }

    cityssm.openHtmlModal('adminOccupancyTypes-editOccupancyType', {
      onshow(modalElement): void {
        los.populateAliases(modalElement)
        ;(
          modalElement.querySelector(
            '#occupancyTypeEdit--contractTypeId'
          ) as HTMLInputElement
        ).value = contractTypeId.toString()
        ;(
          modalElement.querySelector(
            '#occupancyTypeEdit--occupancyType'
          ) as HTMLInputElement
        ).value = occupancyType.occupancyType
      },
      onshown(modalElement, closeModalFunction) {
        editCloseModalFunction = closeModalFunction
        ;(
          modalElement.querySelector(
            '#occupancyTypeEdit--occupancyType'
          ) as HTMLInputElement
        ).focus()

        modalElement.querySelector('form')?.addEventListener('submit', doEdit)

        bulmaJS.toggleHtmlClipped()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function openAddOccupancyTypeField(clickEvent: Event): void {
    const contractTypeId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--occupancyType'
        ) as HTMLElement
      ).dataset.contractTypeId ?? '',
      10
    )

    let addCloseModalFunction: () => void

    function doAdd(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doAddContractTypeField`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          expandedOccupancyTypes.add(contractTypeId)
          occupancyTypeResponseHandler(responseJSON)

          if (responseJSON.success) {
            addCloseModalFunction()
            openEditOccupancyTypeField(
              contractTypeId,
              responseJSON.contractTypeFieldId ?? 0
            )
          }
        }
      )
    }

    cityssm.openHtmlModal('adminOccupancyTypes-addOccupancyTypeField', {
      onshow(modalElement) {
        los.populateAliases(modalElement)

        if (contractTypeId) {
          ;(
            modalElement.querySelector(
              '#occupancyTypeFieldAdd--contractTypeId'
            ) as HTMLInputElement
          ).value = contractTypeId.toString()
        }
      },
      onshown(modalElement, closeModalFunction) {
        addCloseModalFunction = closeModalFunction
        ;(
          modalElement.querySelector(
            '#occupancyTypeFieldAdd--occupancyTypeField'
          ) as HTMLInputElement
        ).focus()

        modalElement.querySelector('form')?.addEventListener('submit', doAdd)

        bulmaJS.toggleHtmlClipped()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function moveOccupancyType(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const contractTypeId = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--occupancyType'
      ) as HTMLElement
    ).dataset.contractTypeId

    cityssm.postJSON(
      `${los.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveContractTypeUp'
          : 'doMoveContractTypeDown'
      }`,
      {
        contractTypeId,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      occupancyTypeResponseHandler
    )
  }

  function openEditOccupancyTypeField(
    contractTypeId: number,
    contractTypeFieldId: number
  ): void {
    let occupancyType: OccupancyType | undefined

    if (contractTypeId) {
      occupancyType = occupancyTypes.find(
        (currentOccupancyType) =>
          currentOccupancyType.contractTypeId === contractTypeId
      )
    }

    const occupancyTypeField = (
      occupancyType
        ? occupancyType.ContractTypeFields ?? []
        : allContractTypeFields
    ).find(
      (currentOccupancyTypeField) =>
        currentOccupancyTypeField.contractTypeFieldId === contractTypeFieldId
    ) as OccupancyTypeField

    let fieldTypeElement: HTMLSelectElement
    let minimumLengthElement: HTMLInputElement
    let maximumLengthElement: HTMLInputElement
    let patternElement: HTMLInputElement
    let occupancyTypeFieldValuesElement: HTMLTextAreaElement

    let editCloseModalFunction: () => void

    function updateMaximumLengthMin(): void {
      maximumLengthElement.min = minimumLengthElement.value
    }

    function toggleInputFields(): void {
      switch (fieldTypeElement.value) {
        case 'date': {
          minimumLengthElement.disabled = true
          maximumLengthElement.disabled = true
          patternElement.disabled = true
          occupancyTypeFieldValuesElement.disabled = true
          break
        }
        case 'select': {
          minimumLengthElement.disabled = true
          maximumLengthElement.disabled = true
          patternElement.disabled = true
          occupancyTypeFieldValuesElement.disabled = false
          break
        }
        default: {
          minimumLengthElement.disabled = false
          maximumLengthElement.disabled = false
          patternElement.disabled = false
          occupancyTypeFieldValuesElement.disabled = true
          break
        }
      }
    }

    function doUpdate(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doUpdateContractTypeField`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          occupancyTypeResponseHandler(responseJSON)
          if (responseJSON.success) {
            editCloseModalFunction()
          }
        }
      )
    }

    function doDelete(): void {
      cityssm.postJSON(
        `${los.urlPrefix}/admin/doDeleteContractTypeField`,
        {
          contractTypeFieldId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          occupancyTypeResponseHandler(responseJSON)
          if (responseJSON.success) {
            editCloseModalFunction()
          }
        }
      )
    }

    function confirmDoDelete(): void {
      bulmaJS.confirm({
        title: 'Delete Field',
        message:
          'Are you sure you want to delete this field?  Note that historical records that make use of this field will not be affected.',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Delete Field',
          callbackFunction: doDelete
        }
      })
    }

    cityssm.openHtmlModal('adminOccupancyTypes-editOccupancyTypeField', {
      onshow: (modalElement) => {
        los.populateAliases(modalElement)
        ;(
          modalElement.querySelector(
            '#occupancyTypeFieldEdit--contractTypeFieldId'
          ) as HTMLInputElement
        ).value = occupancyTypeField.contractTypeFieldId.toString()
        ;(
          modalElement.querySelector(
            '#occupancyTypeFieldEdit--occupancyTypeField'
          ) as HTMLInputElement
        ).value = occupancyTypeField.occupancyTypeField ?? ''
        ;(
          modalElement.querySelector(
            '#occupancyTypeFieldEdit--isRequired'
          ) as HTMLSelectElement
        ).value = occupancyTypeField.isRequired ?? false ? '1' : '0'

        fieldTypeElement = modalElement.querySelector(
          '#occupancyTypeFieldEdit--fieldType'
        ) as HTMLSelectElement

        fieldTypeElement.value = occupancyTypeField.fieldType

        minimumLengthElement = modalElement.querySelector(
          '#occupancyTypeFieldEdit--minimumLength'
        ) as HTMLInputElement

        minimumLengthElement.value =
          occupancyTypeField.minimumLength?.toString() ?? ''

        maximumLengthElement = modalElement.querySelector(
          '#occupancyTypeFieldEdit--maximumLength'
        ) as HTMLInputElement

        maximumLengthElement.value =
          occupancyTypeField.maximumLength?.toString() ?? ''

        patternElement = modalElement.querySelector(
          '#occupancyTypeFieldEdit--pattern'
        ) as HTMLInputElement

        patternElement.value = occupancyTypeField.pattern ?? ''

        occupancyTypeFieldValuesElement = modalElement.querySelector(
          '#occupancyTypeFieldEdit--occupancyTypeFieldValues'
        ) as HTMLTextAreaElement

        occupancyTypeFieldValuesElement.value =
          occupancyTypeField.occupancyTypeFieldValues ?? ''

        toggleInputFields()
      },
      onshown: (modalElement, closeModalFunction) => {
        editCloseModalFunction = closeModalFunction

        bulmaJS.init(modalElement)
        bulmaJS.toggleHtmlClipped()
        cityssm.enableNavBlocker()

        modalElement.querySelector('form')?.addEventListener('submit', doUpdate)

        minimumLengthElement.addEventListener('keyup', updateMaximumLengthMin)
        updateMaximumLengthMin()

        fieldTypeElement.addEventListener('change', toggleInputFields)

        modalElement
          .querySelector('#button--deleteOccupancyTypeField')
          ?.addEventListener('click', confirmDoDelete)
      },
      onremoved: () => {
        bulmaJS.toggleHtmlClipped()
        cityssm.disableNavBlocker()
      }
    })
  }

  function openEditOccupancyTypeFieldByClick(clickEvent: Event): void {
    clickEvent.preventDefault()

    const contractTypeFieldId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--occupancyTypeField'
        ) as HTMLElement
      ).dataset.contractTypeFieldId ?? '',
      10
    )

    const contractTypeId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--occupancyType'
        ) as HTMLElement
      ).dataset.contractTypeId ?? '',
      10
    )

    openEditOccupancyTypeField(contractTypeId, contractTypeFieldId)
  }

  function moveOccupancyTypeField(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const contractTypeFieldId = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--occupancyTypeField'
      ) as HTMLElement
    ).dataset.contractTypeFieldId

    cityssm.postJSON(
      `${los.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveContractTypeFieldUp'
          : // eslint-disable-next-line no-secrets/no-secrets
            'doMoveContractTypeFieldDown'
      }`,
      {
        contractTypeFieldId,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      occupancyTypeResponseHandler
    )
  }

  function renderContractTypeFields(
    panelElement: HTMLElement,
    contractTypeId: number | undefined,
    ContractTypeFields: OccupancyTypeField[]
  ): void {
    if (ContractTypeFields.length === 0) {
      // eslint-disable-next-line no-unsanitized/method
      panelElement.insertAdjacentHTML(
        'beforeend',
        `<div class="panel-block is-block ${
          !contractTypeId || expandedOccupancyTypes.has(contractTypeId)
            ? ''
            : ' is-hidden'
        }">
        <div class="message is-info"><p class="message-body">There are no additional fields.</p></div>
        </div>`
      )
    } else {
      for (const occupancyTypeField of ContractTypeFields) {
        const panelBlockElement = document.createElement('div')
        panelBlockElement.className =
          'panel-block is-block container--occupancyTypeField'

        if (contractTypeId && !expandedOccupancyTypes.has(contractTypeId)) {
          panelBlockElement.classList.add('is-hidden')
        }

        panelBlockElement.dataset.contractTypeFieldId =
          occupancyTypeField.contractTypeFieldId.toString()

        // eslint-disable-next-line no-unsanitized/property
        panelBlockElement.innerHTML = `<div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <a class="has-text-weight-bold button--editOccupancyTypeField" href="#">
                ${cityssm.escapeHTML(occupancyTypeField.occupancyTypeField ?? '')}
              </a>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              ${los.getMoveUpDownButtonFieldHTML(
                'button--moveOccupancyTypeFieldUp',
                'button--moveOccupancyTypeFieldDown'
              )}
            </div>
          </div>
          </div>`

        panelBlockElement
          .querySelector('.button--editOccupancyTypeField')
          ?.addEventListener('click', openEditOccupancyTypeFieldByClick)
        ;(
          panelBlockElement.querySelector(
            '.button--moveOccupancyTypeFieldUp'
          ) as HTMLButtonElement
        ).addEventListener('click', moveOccupancyTypeField)
        ;(
          panelBlockElement.querySelector(
            '.button--moveOccupancyTypeFieldDown'
          ) as HTMLButtonElement
        ).addEventListener('click', moveOccupancyTypeField)

        panelElement.append(panelBlockElement)
      }
    }
  }

  function openAddOccupancyTypePrint(clickEvent: Event): void {
    const contractTypeId =
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--occupancyTypePrintList'
        ) as HTMLElement
      ).dataset.contractTypeId ?? ''

    let closeAddModalFunction: () => void

    function doAdd(formEvent: SubmitEvent): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doAddContractTypePrint`,
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            closeAddModalFunction()
          }

          occupancyTypeResponseHandler(responseJSON)
        }
      )
    }

    cityssm.openHtmlModal('adminOccupancyTypes-addOccupancyTypePrint', {
      onshow(modalElement) {
        los.populateAliases(modalElement)
        ;(
          modalElement.querySelector(
            '#occupancyTypePrintAdd--contractTypeId'
          ) as HTMLInputElement
        ).value = contractTypeId

        const printSelectElement = modalElement.querySelector(
          '#occupancyTypePrintAdd--printEJS'
        ) as HTMLSelectElement

        for (const [printEJS, printTitle] of Object.entries(
          exports.occupancyTypePrintTitles as Record<string, string>
        )) {
          const optionElement = document.createElement('option')
          optionElement.value = printEJS
          optionElement.textContent = printTitle as string
          printSelectElement.append(optionElement)
        }
      },
      onshown(modalElement, closeModalFunction) {
        closeAddModalFunction = closeModalFunction

        modalElement.querySelector('form')?.addEventListener('submit', doAdd)
      }
    })
  }

  function moveOccupancyTypePrint(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const printEJS = (
      buttonElement.closest('.container--occupancyTypePrint') as HTMLElement
    ).dataset.printEJS

    const contractTypeId = (
      buttonElement.closest('.container--occupancyTypePrintList') as HTMLElement
    ).dataset.contractTypeId

    cityssm.postJSON(
      `${los.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? // eslint-disable-next-line no-secrets/no-secrets
            'doMoveContractTypePrintUp'
          : // eslint-disable-next-line no-secrets/no-secrets
            'doMoveContractTypePrintDown'
      }`,
      {
        contractTypeId,
        printEJS,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      occupancyTypeResponseHandler
    )
  }

  function deleteOccupancyTypePrint(clickEvent: Event): void {
    clickEvent.preventDefault()

    const printEJS = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--occupancyTypePrint'
      ) as HTMLElement
    ).dataset.printEJS

    const contractTypeId = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--occupancyTypePrintList'
      ) as HTMLElement
    ).dataset.contractTypeId

    function doDelete(): void {
      cityssm.postJSON(
        `${los.urlPrefix}/admin/doDeleteContractTypePrint`,
        {
          contractTypeId,
          printEJS
        },
        occupancyTypeResponseHandler
      )
    }

    bulmaJS.confirm({
      title: 'Delete Print',
      message: 'Are you sure you want to remove this print option?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Remove Print',
        callbackFunction: doDelete
      }
    })
  }

  function renderContractTypePrints(
    panelElement: HTMLElement,
    contractTypeId: number,
    ContractTypePrints: string[]
  ): void {
    if (ContractTypePrints.length === 0) {
      panelElement.insertAdjacentHTML(
        'beforeend',
        `<div class="panel-block is-block">
          <div class="message is-info">
            <p class="message-body">There are no prints associated with this record.</p>
          </div>
          </div>`
      )
    } else {
      for (const printEJS of ContractTypePrints) {
        const panelBlockElement = document.createElement('div')
        panelBlockElement.className =
          'panel-block is-block container--occupancyTypePrint'

        panelBlockElement.dataset.printEJS = printEJS

        const printTitle =
          printEJS === '*'
            ? '(All Available Prints)'
            : ((exports.occupancyTypePrintTitles as string[])[
                printEJS
              ] as string)

        let printIconClass = 'fa-star'

        if (printEJS.startsWith('pdf/')) {
          printIconClass = 'fa-file-pdf'
        } else if (printEJS.startsWith('screen/')) {
          printIconClass = 'fa-file'
        }

        // eslint-disable-next-line no-unsanitized/property
        panelBlockElement.innerHTML = `<div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <i class="fas fa-fw ${printIconClass}" aria-hidden="true"></i>
            </div>
            <div class="level-item">
              ${cityssm.escapeHTML(printTitle || printEJS)}
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              ${los.getMoveUpDownButtonFieldHTML(
                'button--moveOccupancyTypePrintUp',
                'button--moveOccupancyTypePrintDown'
              )}
            </div>
            <div class="level-item">
              <button class="button is-small is-danger button--deleteOccupancyTypePrint" data-tooltip="Delete" type="button" aria-label="Delete Print">
                <i class="fas fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          </div>`
        ;(
          panelBlockElement.querySelector(
            '.button--moveOccupancyTypePrintUp'
          ) as HTMLButtonElement
        ).addEventListener('click', moveOccupancyTypePrint)
        ;(
          panelBlockElement.querySelector(
            '.button--moveOccupancyTypePrintDown'
          ) as HTMLButtonElement
        ).addEventListener('click', moveOccupancyTypePrint)

        panelBlockElement
          .querySelector('.button--deleteOccupancyTypePrint')
          ?.addEventListener('click', deleteOccupancyTypePrint)

        panelElement.append(panelBlockElement)
      }
    }
  }

  function renderOccupancyTypes(): void {
    // eslint-disable-next-line no-unsanitized/property
    occupancyTypesContainerElement.innerHTML = `<div class="panel container--occupancyType" id="container--allContractTypeFields" data-occupancy-type-id="">
      <div class="panel-heading">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <h2 class="title is-4">(All ${los.escapedAliases.Occupancy} Types)</h2>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button class="button is-success is-small button--addOccupancyTypeField" type="button">
                <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
                <span>Add Field</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>`

    ContractTypePrintsContainerElement.innerHTML = ''

    renderContractTypeFields(
      occupancyTypesContainerElement.querySelector(
        '#container--allContractTypeFields'
      ) as HTMLElement,
      undefined,
      allContractTypeFields
    )

    occupancyTypesContainerElement
      .querySelector('.button--addOccupancyTypeField')
      ?.addEventListener('click', openAddOccupancyTypeField)

    if (occupancyTypes.length === 0) {
      // eslint-disable-next-line no-unsanitized/method
      occupancyTypesContainerElement.insertAdjacentHTML(
        'afterbegin',
        `<div class="message is-warning>
          <p class="message-body">There are no active ${los.escapedAliases.occupancy} types.</p>
          </div>`
      )

      // eslint-disable-next-line no-unsanitized/method
      ContractTypePrintsContainerElement.insertAdjacentHTML(
        'afterbegin',
        `<div class="message is-warning>
          <p class="message-body">There are no active ${los.escapedAliases.occupancy} types.</p>
          </div>`
      )

      return
    }

    for (const occupancyType of occupancyTypes) {
      /*
       * Types and Fields
       */

      const occupancyTypeContainer = document.createElement('div')

      occupancyTypeContainer.className = 'panel container--occupancyType'

      occupancyTypeContainer.dataset.contractTypeId =
        occupancyType.contractTypeId.toString()

      // eslint-disable-next-line no-unsanitized/property
      occupancyTypeContainer.innerHTML = `<div class="panel-heading">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <button class="button is-small button--toggleContractTypeFields" data-tooltip="Toggle Fields" type="button" aria-label="Toggle Fields">
                ${
                  expandedOccupancyTypes.has(occupancyType.contractTypeId)
                    ? '<i class="fas fa-fw fa-minus" aria-hidden="true"></i>'
                    : '<i class="fas fa-fw fa-plus" aria-hidden="true"></i>'
                }
              </button>
            </div>
            <div class="level-item">
              <h2 class="title is-4">${cityssm.escapeHTML(occupancyType.occupancyType)}</h2>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button class="button is-danger is-small button--deleteOccupancyType" type="button">
                <span class="icon is-small"><i class="fas fa-trash" aria-hidden="true"></i></span>
                <span>Delete</span>
              </button>
            </div>
            <div class="level-item">
              <button class="button is-primary is-small button--editOccupancyType" type="button">
                <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
                <span>Edit ${los.escapedAliases.Occupancy} Type</span>
              </button>
            </div>
            <div class="level-item">
              <button class="button is-success is-small button--addOccupancyTypeField" type="button">
                <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
                <span>Add Field</span>
              </button>
            </div>
            <div class="level-item">
              ${los.getMoveUpDownButtonFieldHTML(
                'button--moveOccupancyTypeUp',
                'button--moveOccupancyTypeDown'
              )}
            </div>
          </div>
        </div>
        </div>`

      renderContractTypeFields(
        occupancyTypeContainer,
        occupancyType.contractTypeId,
        occupancyType.ContractTypeFields ?? []
      )

      occupancyTypeContainer
        .querySelector('.button--toggleContractTypeFields')
        ?.addEventListener('click', toggleContractTypeFields)

      occupancyTypeContainer
        .querySelector('.button--deleteOccupancyType')
        ?.addEventListener('click', deleteOccupancyType)

      occupancyTypeContainer
        .querySelector('.button--editOccupancyType')
        ?.addEventListener('click', openEditOccupancyType)

      occupancyTypeContainer
        .querySelector('.button--addOccupancyTypeField')
        ?.addEventListener('click', openAddOccupancyTypeField)
      ;(
        occupancyTypeContainer.querySelector(
          '.button--moveOccupancyTypeUp'
        ) as HTMLButtonElement
      ).addEventListener('click', moveOccupancyType)
      ;(
        occupancyTypeContainer.querySelector(
          '.button--moveOccupancyTypeDown'
        ) as HTMLButtonElement
      ).addEventListener('click', moveOccupancyType)

      occupancyTypesContainerElement.append(occupancyTypeContainer)

      /*
       * Prints
       */

      const occupancyTypePrintContainer = document.createElement('div')

      occupancyTypePrintContainer.className =
        'panel container--occupancyTypePrintList'

      occupancyTypePrintContainer.dataset.contractTypeId =
        occupancyType.contractTypeId.toString()

      occupancyTypePrintContainer.innerHTML = `<div class="panel-heading">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <h2 class="title is-4">${cityssm.escapeHTML(occupancyType.occupancyType)}</h2>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button class="button is-success is-small button--addOccupancyTypePrint" type="button">
                <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
                <span>Add Print</span>
              </button>
            </div>
          </div>
        </div>
        </div>`

      renderContractTypePrints(
        occupancyTypePrintContainer,
        occupancyType.contractTypeId,
        occupancyType.ContractTypePrints ?? []
      )

      occupancyTypePrintContainer
        .querySelector('.button--addOccupancyTypePrint')
        ?.addEventListener('click', openAddOccupancyTypePrint)

      ContractTypePrintsContainerElement.append(occupancyTypePrintContainer)
    }
  }

  document
    .querySelector('#button--addOccupancyType')
    ?.addEventListener('click', () => {
      let addCloseModalFunction: () => void

      function doAdd(submitEvent: SubmitEvent): void {
        submitEvent.preventDefault()

        cityssm.postJSON(
          `${los.urlPrefix}/admin/doAddContractType`,
          submitEvent.currentTarget,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as ResponseJSON

            if (responseJSON.success) {
              addCloseModalFunction()
              occupancyTypes = responseJSON.occupancyTypes
              renderOccupancyTypes()
            } else {
              bulmaJS.alert({
                title: `Error Adding ${los.escapedAliases.Occupancy} Type`,
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('adminOccupancyTypes-addOccupancyType', {
        onshow(modalElement) {
          los.populateAliases(modalElement)
        },
        onshown(modalElement, closeModalFunction) {
          addCloseModalFunction = closeModalFunction
          ;(
            modalElement.querySelector(
              '#occupancyTypeAdd--occupancyType'
            ) as HTMLInputElement
          ).focus()

          modalElement.querySelector('form')?.addEventListener('submit', doAdd)

          bulmaJS.toggleHtmlClipped()
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })

  renderOccupancyTypes()
})()
