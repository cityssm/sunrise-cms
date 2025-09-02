// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  BurialSiteComment,
  BurialSiteTypeField
} from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise

  burialSiteComments?: BurialSiteComment[]

  bodyCapacityMaxDefault: string
  crematedCapacityMaxDefault: string
}
;(() => {
  const sunrise = exports.sunrise

  const burialSiteId = (
    document.querySelector('#burialSite--burialSiteId') as HTMLInputElement
  ).value
  const isCreate = burialSiteId === ''

  // Main form

  let refreshAfterSave = isCreate

  function setUnsavedChanges(): void {
    sunrise.setUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--burialSite']")
      ?.classList.remove('is-light')
  }

  function clearUnsavedChanges(): void {
    sunrise.clearUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--burialSite']")
      ?.classList.add('is-light')
  }

  const formElement = document.querySelector(
    '#form--burialSite'
  ) as HTMLFormElement

  function updateBurialSite(formEvent: SubmitEvent): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/burialSites/${isCreate ? 'doCreateBurialSite' : 'doUpdateBurialSite'}`,
      formElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          burialSiteId?: number
          errorMessage?: string
          success: boolean
        }

        if (responseJSON.success) {
          clearUnsavedChanges()

          if (isCreate || refreshAfterSave) {
            globalThis.location.href = sunrise.getBurialSiteURL(
              responseJSON.burialSiteId,
              true,
              true
            )
          } else {
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Burial Site Updated Successfully'
            })
          }
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Updating Burial Site',

            message: responseJSON.errorMessage ?? ''
          })
        }
      }
    )
  }

  formElement.addEventListener('submit', updateBurialSite)

  const formInputElements = formElement.querySelectorAll('input, select')

  for (const formInputElement of formInputElements) {
    formInputElement.addEventListener('change', setUnsavedChanges)
  }

  sunrise.initializeUnlockFieldButtons(formElement)

  document
    .querySelector('#button--deleteBurialSite')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      function doDelete(): void {
        cityssm.postJSON(
          `${sunrise.urlPrefix}/burialSites/doDeleteBurialSite`,
          {
            burialSiteId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              errorMessage?: string
              success: boolean
            }

            if (responseJSON.success) {
              clearUnsavedChanges()
              globalThis.location.href = sunrise.getBurialSiteURL()
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error Deleting Burial Site',

                message: responseJSON.errorMessage ?? ''
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Delete Burial Site',

        message: 'Are you sure you want to delete this burial site?',

        okButton: {
          callbackFunction: doDelete,
          text: 'Yes, Delete Burial Site'
        }
      })
    })

  // Cemetery

  const cemeteryKeySpanElement = document.querySelector(
    '#burialSite--cemeteryKey'
  )

  if (cemeteryKeySpanElement !== null) {
    document
      .querySelector('#burialSite--cemeteryId')
      ?.addEventListener('change', (changeEvent) => {
        const cemeterySelectElement =
          changeEvent.currentTarget as HTMLSelectElement

        const cemeteryKey =
          cemeterySelectElement.selectedOptions[0].dataset.cemeteryKey ?? ''

        cemeteryKeySpanElement.innerHTML = cityssm.escapeHTML(cemeteryKey)
      })
  }

  // Burial Site Type

  const burialSiteTypeIdElement = document.querySelector(
    '#burialSite--burialSiteTypeId'
  ) as HTMLSelectElement

  function updateCapacities(): void {
    const bodyCapacityMax =
      burialSiteTypeIdElement.selectedOptions[0].dataset.bodyCapacityMax

    const bodyCapacityElement = document.querySelector(
      '#burialSite--bodyCapacity'
    ) as HTMLInputElement

    bodyCapacityElement.max =
      bodyCapacityMax === ''
        ? exports.bodyCapacityMaxDefault
        : bodyCapacityMax ?? ''

    bodyCapacityElement.placeholder =
      bodyCapacityMax === ''
        ? exports.bodyCapacityMaxDefault
        : bodyCapacityMax ?? ''

    const crematedCapacityMax =
      burialSiteTypeIdElement.selectedOptions[0].dataset.crematedCapacityMax

    const crematedCapacityElement = document.querySelector(
      '#burialSite--crematedCapacity'
    ) as HTMLInputElement

    crematedCapacityElement.max =
      crematedCapacityMax === ''
        ? exports.crematedCapacityMaxDefault
        : crematedCapacityMax ?? ''

    crematedCapacityElement.placeholder =
      crematedCapacityMax === ''
        ? exports.crematedCapacityMaxDefault
        : crematedCapacityMax ?? ''
  }

  if (isCreate) {
    const burialSiteFieldsContainerElement = document.querySelector(
      '#container--burialSiteFields'
    ) as HTMLElement

    burialSiteTypeIdElement.addEventListener('change', () => {
      if (burialSiteTypeIdElement.value === '') {
        burialSiteFieldsContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">Select the burial site type to load the available fields.</p>
          </div>`

        return
      }

      cityssm.postJSON(
        `${sunrise.urlPrefix}/burialSites/doGetBurialSiteTypeFields`,
        {
          burialSiteTypeId: burialSiteTypeIdElement.value
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            burialSiteTypeFields: BurialSiteTypeField[]
          }

          if (responseJSON.burialSiteTypeFields.length === 0) {
            burialSiteFieldsContainerElement.innerHTML = `<div class="message is-info">
              <p class="message-body">
                There are no additional fields for this burial site type.
              </p>
              </div>`

            return
          }

          burialSiteFieldsContainerElement.innerHTML = ''

          let burialSiteTypeFieldIds = ''

          for (const burialSiteTypeField of responseJSON.burialSiteTypeFields) {
            burialSiteTypeFieldIds += `,${burialSiteTypeField.burialSiteTypeFieldId.toString()}`

            const fieldName = `fieldValue_${burialSiteTypeField.burialSiteTypeFieldId.toString()}`

            const fieldId = `burialSite--${fieldName}`

            const fieldElement = document.createElement('div')
            fieldElement.className = 'field'

            // eslint-disable-next-line no-unsanitized/property
            fieldElement.innerHTML = `<label class="label" for="${fieldId}"></label>
              <div class="control"></div>`
            ;(
              fieldElement.querySelector('label') as HTMLLabelElement
            ).textContent = burialSiteTypeField.burialSiteTypeField as string

            if ((burialSiteTypeField.fieldValues ?? '') === '') {
              const inputElement = document.createElement('input')

              inputElement.className = 'input'

              inputElement.id = fieldId

              inputElement.name = fieldName

              inputElement.type = 'text'

              inputElement.required = burialSiteTypeField.isRequired as boolean
              inputElement.minLength = burialSiteTypeField.minLength as number
              inputElement.maxLength = burialSiteTypeField.maxLength as number

              if ((burialSiteTypeField.pattern ?? '') !== '') {
                inputElement.pattern = burialSiteTypeField.pattern ?? ''
              }

              fieldElement.querySelector('.control')?.append(inputElement)
            } else {
              // eslint-disable-next-line no-unsanitized/property
              ;(
                fieldElement.querySelector('.control') as HTMLElement
              ).innerHTML = `<div class="select is-fullwidth">
                  <select id="${fieldId}" name="${fieldName}"><option value="">(Not Set)</option></select>
                  </div>`

              const selectElement = fieldElement.querySelector(
                'select'
              ) as HTMLSelectElement

              selectElement.required = burialSiteTypeField.isRequired as boolean

              const optionValues = (
                burialSiteTypeField.fieldValues as string
              ).split('\n')

              for (const optionValue of optionValues) {
                const optionElement = document.createElement('option')
                optionElement.value = optionValue
                optionElement.textContent = optionValue
                selectElement.append(optionElement)
              }
            }

            burialSiteFieldsContainerElement.append(fieldElement)
          }

          burialSiteFieldsContainerElement.insertAdjacentHTML(
            'beforeend',
            // eslint-disable-next-line no-secrets/no-secrets
            `<input name="burialSiteTypeFieldIds" type="hidden"
              value="${cityssm.escapeHTML(burialSiteTypeFieldIds.slice(1))}" />`
          )
        }
      )
    })
  } else {
    const originalBurialSiteTypeId = burialSiteTypeIdElement.value

    burialSiteTypeIdElement.addEventListener('change', () => {
      if (burialSiteTypeIdElement.value !== originalBurialSiteTypeId) {
        bulmaJS.confirm({
          contextualColorName: 'warning',
          title: 'Confirm Change',

          message: `Are you sure you want to change the burial site type?\n
            This change affects the additional fields associated with this record.`,

          okButton: {
            callbackFunction() {
              refreshAfterSave = true
            },
            text: 'Yes, Keep the Change'
          },

          cancelButton: {
            callbackFunction() {
              burialSiteTypeIdElement.value = originalBurialSiteTypeId
              updateCapacities()
            },
            text: 'Revert the Change'
          }
        })
      }
    })
  }

  burialSiteTypeIdElement.addEventListener('change', updateCapacities)

  // Leaflet Map

  document
    .querySelector('#button--selectCoordinate')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      sunrise.openLeafletCoordinateSelectorModal({
        latitudeElement: document.querySelector(
          '#burialSite--burialSiteLatitude'
        ) as HTMLInputElement,
        longitudeElement: document.querySelector(
          '#burialSite--burialSiteLongitude'
        ) as HTMLInputElement,

        callbackFunction: () => {
          setUnsavedChanges()
        }
      })
    })

  // Comments

  let burialSiteComments = exports.burialSiteComments as BurialSiteComment[]
  delete exports.burialSiteComments

  function openEditBurialSiteComment(clickEvent: Event): void {
    const burialSiteCommentId = Number.parseInt(
      (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
        .burialSiteCommentId ?? '',
      10
    )

    const burialSiteComment = burialSiteComments.find(
      (currentComment) =>
        currentComment.burialSiteCommentId === burialSiteCommentId
    ) as BurialSiteComment

    let editFormElement: HTMLFormElement
    let editCloseModalFunction: () => void

    function editComment(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${sunrise.urlPrefix}/burialSites/doUpdateBurialSiteComment`,
        editFormElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            burialSiteComments: BurialSiteComment[]
            errorMessage?: string
            success: boolean
          }

          if (responseJSON.success) {
            burialSiteComments = responseJSON.burialSiteComments
            editCloseModalFunction()
            renderBurialSiteComments()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Comment',

              message: responseJSON.errorMessage ?? ''
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('burialSite-editComment', {
      onshow(modalElement) {
        sunrise.populateAliases(modalElement)

        modalElement
          .querySelector('#burialSiteCommentEdit--burialSiteId')
          ?.setAttribute('value', burialSiteId)

        modalElement
          .querySelector('#burialSiteCommentEdit--burialSiteCommentId')
          ?.setAttribute('value', burialSiteCommentId.toString())
        ;(
          modalElement.querySelector(
            '#burialSiteCommentEdit--comment'
          ) as HTMLTextAreaElement
        ).value = burialSiteComment.comment ?? ''

        const commentDateStringElement = modalElement.querySelector(
          '#burialSiteCommentEdit--commentDateString'
        ) as HTMLInputElement

        commentDateStringElement.value =
          burialSiteComment.commentDateString ?? ''

        const currentDateString = cityssm.dateToString(new Date())

        commentDateStringElement.max =
          burialSiteComment.commentDateString! <= currentDateString
            ? currentDateString
            : burialSiteComment.commentDateString ?? ''
        ;(
          modalElement.querySelector(
            '#burialSiteCommentEdit--commentTimeString'
          ) as HTMLInputElement
        ).value = burialSiteComment.commentTimeString ?? ''
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        ;(
          modalElement.querySelector(
            '#burialSiteCommentEdit--comment'
          ) as HTMLTextAreaElement
        ).focus()

        editFormElement = modalElement.querySelector('form') as HTMLFormElement
        editFormElement.addEventListener('submit', editComment)

        editCloseModalFunction = closeModalFunction
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteBurialSiteComment(clickEvent: Event): void {
    const burialSiteCommentId = Number.parseInt(
      (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
        .burialSiteCommentId ?? '',
      10
    )

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/burialSites/doDeleteBurialSiteComment`,
        {
          burialSiteCommentId,
          burialSiteId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            burialSiteComments: BurialSiteComment[]
            errorMessage?: string
            success: boolean
          }

          if (responseJSON.success) {
            burialSiteComments = responseJSON.burialSiteComments
            renderBurialSiteComments()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Removing Comment',

              message: responseJSON.errorMessage ?? ''
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Remove Comment?',

      message: 'Are you sure you want to remove this comment?',

      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Remove Comment'
      }
    })
  }

  function renderBurialSiteComments(): void {
    const containerElement = document.querySelector(
      '#container--burialSiteComments'
    ) as HTMLElement

    if (burialSiteComments.length === 0) {
      containerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no comments to display.</p>
        </div>`
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'
    tableElement.innerHTML = `<thead><tr>
      <th>Author</th>
      <th>Comment Date</th>
      <th>Comment</th>
      <th class="is-hidden-print"><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>`

    for (const burialSiteComment of burialSiteComments) {
      const tableRowElement = document.createElement('tr')
      tableRowElement.dataset.burialSiteCommentId =
        burialSiteComment.burialSiteCommentId?.toString()

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = `<td>
          ${cityssm.escapeHTML(burialSiteComment.recordCreate_userName ?? '')}
        </td><td>
          ${burialSiteComment.commentDateString}
          ${
            burialSiteComment.commentTime === 0
              ? ''
              : ` ${burialSiteComment.commentTimePeriodString}`
          }
        </td><td>
          ${cityssm.escapeHTML(burialSiteComment.comment ?? '')}
        </td><td class="is-hidden-print">
          <div class="buttons are-small is-justify-content-end">
            <button class="button is-primary button--edit" type="button">
              <span class="icon is-small"><i class="fa-solid fa-pencil-alt"></i></span>
              <span>Edit</span>
            </button>
            <button class="button is-light is-danger button--delete" data-tooltip="Delete Comment" type="button" aria-label="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>`

      tableRowElement
        .querySelector('.button--edit')
        ?.addEventListener('click', openEditBurialSiteComment)

      tableRowElement
        .querySelector('.button--delete')
        ?.addEventListener('click', deleteBurialSiteComment)

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
        `${sunrise.urlPrefix}/burialSites/doAddBurialSiteComment`,
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            burialSiteComments: BurialSiteComment[]
            success: boolean
          }

          if (responseJSON.success) {
            burialSiteComments = responseJSON.burialSiteComments
            renderBurialSiteComments()
            addCommentCloseModalFunction()
          }
        }
      )
    }

    cityssm.openHtmlModal('burialSite-addComment', {
      onshow(modalElement) {
        sunrise.populateAliases(modalElement)

        modalElement
          .querySelector('#burialSiteCommentAdd--burialSiteId')
          ?.setAttribute('value', burialSiteId)

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddComment)
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        addCommentCloseModalFunction = closeModalFunction
        ;(
          modalElement.querySelector(
            '#burialSiteCommentAdd--comment'
          ) as HTMLTextAreaElement
        ).focus()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
        ;(
          document.querySelector(
            '#burialSiteComments--add'
          ) as HTMLButtonElement
        ).focus()
      }
    })
  }

  if (!isCreate) {
    document
      .querySelector('#burialSiteComments--add')
      ?.addEventListener('click', openAddCommentModal)
    renderBurialSiteComments()
  }

  /*
   * Contracts
   */

  document
    .querySelector('#burialSite--contractsToggle')
    ?.addEventListener('click', () => {
      const tableRowElements = document.querySelectorAll(
        '#burialSite--contractsTbody tr[data-is-active="0"]'
      )

      for (const tableRowElement of tableRowElements) {
        tableRowElement.classList.toggle('is-hidden')
      }
    })
})()
