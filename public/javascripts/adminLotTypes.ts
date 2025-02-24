import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../../types/globalTypes.js'
import type { LotType, LotTypeField } from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>

type ResponseJSON =
  | {
      success: true
      lotTypes: LotType[]
      lotTypeFieldId?: number
    }
  | {
      success: false
      errorMessage?: string
    }
;(() => {
  const los = exports.los as LOS

  const containerElement = document.querySelector(
    '#container--lotTypes'
  ) as HTMLElement

  let lotTypes = exports.lotTypes as LotType[]
  delete exports.lotTypes

  const expandedLotTypes = new Set<number>()

  function toggleBurialSiteTypeFields(clickEvent: Event): void {
    const toggleButtonElement = clickEvent.currentTarget as HTMLButtonElement

    const lotTypeElement = toggleButtonElement.closest(
      '.container--lotType'
    ) as HTMLElement

    const burialSiteTypeId = Number.parseInt(
      lotTypeElement.dataset.burialSiteTypeId ?? '',
      10
    )

    if (expandedLotTypes.has(burialSiteTypeId)) {
      expandedLotTypes.delete(burialSiteTypeId)
    } else {
      expandedLotTypes.add(burialSiteTypeId)
    }

    // eslint-disable-next-line no-unsanitized/property
    toggleButtonElement.innerHTML = expandedLotTypes.has(burialSiteTypeId)
      ? '<i class="fas fa-fw fa-minus" aria-hidden="true"></i>'
      : '<i class="fas fa-fw fa-plus" aria-hidden="true"></i>'

    const panelBlockElements = lotTypeElement.querySelectorAll(
      '.panel-block'
    ) as NodeListOf<HTMLElement>

    for (const panelBlockElement of panelBlockElements) {
      panelBlockElement.classList.toggle('is-hidden')
    }
  }

  function lotTypeResponseHandler(rawResponseJSON: unknown): void {
    const responseJSON = rawResponseJSON as ResponseJSON
    if (responseJSON.success) {
      lotTypes = responseJSON.lotTypes
      renderLotTypes()
    } else {
      bulmaJS.alert({
        title: `Error Updating ${los.escapedAliases.Lot} Type`,
        message: responseJSON.errorMessage ?? '',
        contextualColorName: 'danger'
      })
    }
  }

  function deleteLotType(clickEvent: Event): void {
    const burialSiteTypeId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--lotType'
        ) as HTMLElement
      ).dataset.burialSiteTypeId ?? '',
      10
    )

    function doDelete(): void {
      cityssm.postJSON(
        `${los.urlPrefix}/admin/doDeleteLotType`,
        {
          burialSiteTypeId
        },
        lotTypeResponseHandler
      )
    }

    bulmaJS.confirm({
      title: `Delete ${los.escapedAliases.Lot} Type`,
      message: `Are you sure you want to delete this ${los.escapedAliases.lot} type?`,
      contextualColorName: 'warning',
      okButton: {
        text: `Yes, Delete ${los.escapedAliases.Lot} Type`,
        callbackFunction: doDelete
      }
    })
  }

  function openEditLotType(clickEvent: Event): void {
    const burialSiteTypeId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--lotType'
        ) as HTMLElement
      ).dataset.burialSiteTypeId ?? '',
      10
    )

    const lotType = lotTypes.find(
      (currentLotType) => burialSiteTypeId === currentLotType.burialSiteTypeId
    ) as LotType

    let editCloseModalFunction: () => void

    function doEdit(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doUpdateLotType`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          lotTypeResponseHandler(responseJSON)
          if (responseJSON.success) {
            editCloseModalFunction()
          }
        }
      )
    }

    cityssm.openHtmlModal('adminLotTypes-editLotType', {
      onshow(modalElement) {
        los.populateAliases(modalElement)
        ;(
          modalElement.querySelector(
            '#lotTypeEdit--burialSiteTypeId'
          ) as HTMLInputElement
        ).value = burialSiteTypeId.toString()
        ;(
          modalElement.querySelector(
            '#lotTypeEdit--lotType'
          ) as HTMLInputElement
        ).value = lotType.lotType
      },
      onshown(modalElement, closeModalFunction) {
        editCloseModalFunction = closeModalFunction
        ;(
          modalElement.querySelector(
            '#lotTypeEdit--lotType'
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

  function openAddLotTypeField(clickEvent: Event): void {
    const burialSiteTypeId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--lotType'
        ) as HTMLElement
      ).dataset.burialSiteTypeId ?? '',
      10
    )

    let addCloseModalFunction: () => void

    function doAdd(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doAddLotTypeField`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          expandedLotTypes.add(burialSiteTypeId)
          lotTypeResponseHandler(responseJSON)

          if (responseJSON.success) {
            addCloseModalFunction()
            openEditLotTypeField(
              burialSiteTypeId,
              responseJSON.lotTypeFieldId as number
            )
          }
        }
      )
    }

    cityssm.openHtmlModal('adminLotTypes-addLotTypeField', {
      onshow(modalElement) {
        los.populateAliases(modalElement)

        if (burialSiteTypeId) {
          ;(
            modalElement.querySelector(
              '#lotTypeFieldAdd--burialSiteTypeId'
            ) as HTMLInputElement
          ).value = burialSiteTypeId.toString()
        }
      },
      onshown(modalElement, closeModalFunction) {
        addCloseModalFunction = closeModalFunction
        ;(
          modalElement.querySelector(
            '#lotTypeFieldAdd--lotTypeField'
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

  function moveLotType(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const burialSiteTypeId = (
      buttonElement.closest('.container--lotType') as HTMLElement
    ).dataset.burialSiteTypeId

    cityssm.postJSON(
      `${los.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveLotTypeUp'
          : 'doMoveLotTypeDown'
      }`,
      {
        burialSiteTypeId,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      lotTypeResponseHandler
    )
  }

  function openEditLotTypeField(
    burialSiteTypeId: number,
    lotTypeFieldId: number
  ): void {
    const lotType = lotTypes.find(
      (currentLotType) => currentLotType.burialSiteTypeId === burialSiteTypeId
    ) as LotType

    const lotTypeField = (lotType.BurialSiteTypeFields ?? []).find(
      (currentLotTypeField) =>
        currentLotTypeField.lotTypeFieldId === lotTypeFieldId
    ) as LotTypeField

    let fieldTypeElement: HTMLSelectElement
    let minimumLengthElement: HTMLInputElement
    let maximumLengthElement: HTMLInputElement
    let patternElement: HTMLInputElement
    let lotTypeFieldValuesElement: HTMLTextAreaElement

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
          lotTypeFieldValuesElement.disabled = true
          break
        }
        case 'select': {
          minimumLengthElement.disabled = true
          maximumLengthElement.disabled = true
          patternElement.disabled = true
          lotTypeFieldValuesElement.disabled = false
          break
        }
        default: {
          minimumLengthElement.disabled = false
          maximumLengthElement.disabled = false
          patternElement.disabled = false
          lotTypeFieldValuesElement.disabled = true
          break
        }
      }
    }

    function doUpdate(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doUpdateLotTypeField`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          lotTypeResponseHandler(responseJSON)
          if (responseJSON.success) {
            editCloseModalFunction()
          }
        }
      )
    }

    function doDelete(): void {
      cityssm.postJSON(
        `${los.urlPrefix}/admin/doDeleteLotTypeField`,
        {
          lotTypeFieldId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          lotTypeResponseHandler(responseJSON)
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

    cityssm.openHtmlModal('adminLotTypes-editLotTypeField', {
      onshow(modalElement) {
        los.populateAliases(modalElement)
        ;(
          modalElement.querySelector(
            '#lotTypeFieldEdit--lotTypeFieldId'
          ) as HTMLInputElement
        ).value = lotTypeField.lotTypeFieldId.toString()
        ;(
          modalElement.querySelector(
            '#lotTypeFieldEdit--lotTypeField'
          ) as HTMLInputElement
        ).value = lotTypeField.lotTypeField ?? ''
        ;(
          modalElement.querySelector(
            '#lotTypeFieldEdit--isRequired'
          ) as HTMLSelectElement
        ).value = lotTypeField.isRequired ? '1' : '0'

        fieldTypeElement = modalElement.querySelector(
          '#lotTypeFieldEdit--fieldType'
        ) as HTMLSelectElement

        fieldTypeElement.value = lotTypeField.fieldType

        minimumLengthElement = modalElement.querySelector(
          '#lotTypeFieldEdit--minimumLength'
        ) as HTMLInputElement

        minimumLengthElement.value =
          lotTypeField.minimumLength?.toString() ?? ''

        maximumLengthElement = modalElement.querySelector(
          '#lotTypeFieldEdit--maximumLength'
        ) as HTMLInputElement

        maximumLengthElement.value =
          lotTypeField.maximumLength?.toString() ?? ''

        patternElement = modalElement.querySelector(
          '#lotTypeFieldEdit--pattern'
        ) as HTMLInputElement

        patternElement.value = lotTypeField.pattern ?? ''

        lotTypeFieldValuesElement = modalElement.querySelector(
          '#lotTypeFieldEdit--lotTypeFieldValues'
        ) as HTMLTextAreaElement

        lotTypeFieldValuesElement.value = lotTypeField.lotTypeFieldValues ?? ''

        toggleInputFields()
      },
      onshown(modalElement, closeModalFunction) {
        editCloseModalFunction = closeModalFunction

        bulmaJS.init(modalElement)
        bulmaJS.toggleHtmlClipped()
        cityssm.enableNavBlocker()

        modalElement.querySelector('form')?.addEventListener('submit', doUpdate)

        minimumLengthElement.addEventListener('keyup', updateMaximumLengthMin)
        updateMaximumLengthMin()

        fieldTypeElement.addEventListener('change', toggleInputFields)

        modalElement
          .querySelector('#button--deleteLotTypeField')
          ?.addEventListener('click', confirmDoDelete)
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
        cityssm.disableNavBlocker()
      }
    })
  }

  function openEditLotTypeFieldByClick(clickEvent: Event): void {
    clickEvent.preventDefault()

    const lotTypeFieldId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--lotTypeField'
        ) as HTMLElement
      ).dataset.lotTypeFieldId ?? '',
      10
    )

    const burialSiteTypeId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--lotType'
        ) as HTMLElement
      ).dataset.burialSiteTypeId ?? '',
      10
    )

    openEditLotTypeField(burialSiteTypeId, lotTypeFieldId)
  }

  function moveLotTypeField(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const lotTypeFieldId = (
      buttonElement.closest('.container--lotTypeField') as HTMLElement
    ).dataset.lotTypeFieldId

    cityssm.postJSON(
      `${los.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveLotTypeFieldUp'
          : 'doMoveLotTypeFieldDown'
      }`,
      {
        lotTypeFieldId,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      lotTypeResponseHandler
    )
  }

  function renderBurialSiteTypeFields(
    panelElement: HTMLElement,
    burialSiteTypeId: number,
    BurialSiteTypeFields: LotTypeField[]
  ): void {
    if (BurialSiteTypeFields.length === 0) {
      // eslint-disable-next-line no-unsanitized/method
      panelElement.insertAdjacentHTML(
        'beforeend',
        `<div class="panel-block is-block
          ${expandedLotTypes.has(burialSiteTypeId) ? '' : ' is-hidden'}">
          <div class="message is-info"><p class="message-body">There are no additional fields.</p></div>
          </div>`
      )
    } else {
      for (const lotTypeField of BurialSiteTypeFields) {
        const panelBlockElement = document.createElement('div')
        panelBlockElement.className =
          'panel-block is-block container--lotTypeField'

        if (!expandedLotTypes.has(burialSiteTypeId)) {
          panelBlockElement.classList.add('is-hidden')
        }

        panelBlockElement.dataset.lotTypeFieldId =
          lotTypeField.lotTypeFieldId.toString()

        // eslint-disable-next-line no-unsanitized/property
        panelBlockElement.innerHTML = `<div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <a class="has-text-weight-bold button--editLotTypeField" href="#">
                ${cityssm.escapeHTML(lotTypeField.lotTypeField ?? '')}
              </a>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              ${los.getMoveUpDownButtonFieldHTML(
                'button--moveLotTypeFieldUp',
                'button--moveLotTypeFieldDown'
              )}
            </div>
          </div>
          </div>`

        panelBlockElement
          .querySelector('.button--editLotTypeField')
          ?.addEventListener('click', openEditLotTypeFieldByClick)
        ;(
          panelBlockElement.querySelector(
            '.button--moveLotTypeFieldUp'
          ) as HTMLButtonElement
        ).addEventListener('click', moveLotTypeField)
        ;(
          panelBlockElement.querySelector(
            '.button--moveLotTypeFieldDown'
          ) as HTMLButtonElement
        ).addEventListener('click', moveLotTypeField)

        panelElement.append(panelBlockElement)
      }
    }
  }

  function renderLotTypes(): void {
    containerElement.innerHTML = ''

    if (lotTypes.length === 0) {
      // eslint-disable-next-line no-unsanitized/method
      containerElement.insertAdjacentHTML(
        'afterbegin',
        `<div class="message is-warning>
          <p class="message-body">There are no active ${los.escapedAliases.lot} types.</p>
          </div>`
      )

      return
    }

    for (const lotType of lotTypes) {
      const lotTypeContainer = document.createElement('div')

      lotTypeContainer.className = 'panel container--lotType'

      lotTypeContainer.dataset.burialSiteTypeId = lotType.burialSiteTypeId.toString()

      // eslint-disable-next-line no-unsanitized/property
      lotTypeContainer.innerHTML = `<div class="panel-heading">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <button class="button is-small button--toggleBurialSiteTypeFields" data-tooltip="Toggle Fields" type="button" aria-label="Toggle Fields">
              ${
                expandedLotTypes.has(lotType.burialSiteTypeId)
                  ? '<i class="fas fa-fw fa-minus" aria-hidden="true"></i>'
                  : '<i class="fas fa-fw fa-plus" aria-hidden="true"></i>'
              }
              </button>
            </div>
            <div class="level-item">
              <h2 class="title is-4">${cityssm.escapeHTML(lotType.lotType)}</h2>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button class="button is-danger is-small button--deleteLotType" type="button">
                <span class="icon is-small"><i class="fas fa-trash" aria-hidden="true"></i></span>
                <span>Delete</span>
              </button>
            </div>
            <div class="level-item">
              <button class="button is-primary is-small button--editLotType" type="button">
                <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
                <span>Edit ${los.escapedAliases.Lot} Type</span>
              </button>
            </div>
            <div class="level-item">
              <button class="button is-success is-small button--addLotTypeField" type="button">
                <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
                <span>Add Field</span>
              </button>
            </div>
            <div class="level-item">
              ${los.getMoveUpDownButtonFieldHTML(
                'button--moveLotTypeUp',
                'button--moveLotTypeDown'
              )}
            </div>
          </div>
        </div>
        </div>`

      renderBurialSiteTypeFields(
        lotTypeContainer,
        lotType.burialSiteTypeId,
        lotType.BurialSiteTypeFields ?? []
      )

      lotTypeContainer
        .querySelector('.button--toggleBurialSiteTypeFields')
        ?.addEventListener('click', toggleBurialSiteTypeFields)

      lotTypeContainer
        .querySelector('.button--deleteLotType')
        ?.addEventListener('click', deleteLotType)

      lotTypeContainer
        .querySelector('.button--editLotType')
        ?.addEventListener('click', openEditLotType)

      lotTypeContainer
        .querySelector('.button--addLotTypeField')
        ?.addEventListener('click', openAddLotTypeField)
      ;(
        lotTypeContainer.querySelector(
          '.button--moveLotTypeUp'
        ) as HTMLButtonElement
      ).addEventListener('click', moveLotType)
      ;(
        lotTypeContainer.querySelector(
          '.button--moveLotTypeDown'
        ) as HTMLButtonElement
      ).addEventListener('click', moveLotType)

      containerElement.append(lotTypeContainer)
    }
  }

  document
    .querySelector('#button--addLotType')
    ?.addEventListener('click', () => {
      let addCloseModalFunction: () => void

      function doAdd(submitEvent: SubmitEvent): void {
        submitEvent.preventDefault()

        cityssm.postJSON(
          `${los.urlPrefix}/admin/doAddLotType`,
          submitEvent.currentTarget,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as ResponseJSON

            if (responseJSON.success) {
              addCloseModalFunction()
              lotTypes = responseJSON.lotTypes
              renderLotTypes()
            } else {
              bulmaJS.alert({
                title: `Error Adding ${los.escapedAliases.Lot} Type`,
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('adminLotTypes-addLotType', {
        onshow(modalElement) {
          los.populateAliases(modalElement)
        },
        onshown(modalElement, closeModalFunction) {
          addCloseModalFunction = closeModalFunction
          ;(
            modalElement.querySelector(
              '#lotTypeAdd--lotType'
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

  renderLotTypes()
})()
