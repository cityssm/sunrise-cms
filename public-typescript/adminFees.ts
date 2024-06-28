// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../types/globalTypes.js'
import type {
  Fee,
  FeeCategory,
  LotType,
  OccupancyType
} from '../types/recordTypes.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as LOS

  const feeCategoriesContainerElement = document.querySelector(
    '#container--feeCategories'
  ) as HTMLElement

  let feeCategories = exports.feeCategories as FeeCategory[]
  delete exports.feeCategories

  type ResponseJSON =
    | {
        success: true
        feeCategories: FeeCategory[]
      }
    | {
        success: false
        errorMessage: string
      }

  function renderFeeCategories(): void {
    if (feeCategories.length === 0) {
      feeCategoriesContainerElement.innerHTML = `<div class="message is-warning">
        <p class="message-body">There are no available fees.</p>
        </div>`

      return
    }

    feeCategoriesContainerElement.innerHTML = ''

    for (const feeCategory of feeCategories) {
      const feeCategoryContainerElement = document.createElement('section')

      feeCategoryContainerElement.className = 'panel container--feeCategory'

      feeCategoryContainerElement.dataset.feeCategoryId =
        feeCategory.feeCategoryId.toString()

      // eslint-disable-next-line no-unsanitized/property
      feeCategoryContainerElement.innerHTML = `<div class="panel-heading">
        <div class="columns">
          <div class="column">
            <h2 class="title is-4 mb-2">${cityssm.escapeHTML(feeCategory.feeCategory ?? '')}</h2>
            ${
              feeCategory.isGroupedFee
                ? '<span class="tag">Grouped Fee</span>'
                : ''
            }
          </div>
          <div class="column is-narrow">
            <div class="field is-grouped is-justify-content-end">
            ${
              feeCategory.fees.length === 0
                ? `<div class="control">
                    <button class="button is-small is-danger button--deleteFeeCategory" type="button">
                    <span class="icon is-small"><i class="fas fa-trash" aria-hidden="true"></i></span>
                    <span>Delete Category</span>
                    </button>
                    </div>`
                : ''
            }
            <div class="control">
              <button class="button is-small is-primary button--editFeeCategory" type="button">
                <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
                <span>Edit Category</span>
              </button>
            </div>
            <div class="control">
              <button class="button is-small is-success button--addFee" data-cy="addFee" type="button">
                <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
                <span>Add Fee</span>
              </button>
            </div>
            <div class="control">
              ${los.getMoveUpDownButtonFieldHTML(
                'button--moveFeeCategoryUp',
                'button--moveFeeCategoryDown'
              )}
            </div>
          </div>
        </div>
        </div>`

      if (feeCategory.fees.length === 0) {
        feeCategoryContainerElement.insertAdjacentHTML(
          'beforeend',
          `<div class="panel-block is-block">
            <div class="message is-info">
              <p class="message-body">
                There are no fees in the
                "${cityssm.escapeHTML(feeCategory.feeCategory ?? '')}"
                category.
              </p>
            </div>
            </div>`
        )

        feeCategoryContainerElement
          .querySelector('.button--deleteFeeCategory')
          ?.addEventListener('click', confirmDeleteFeeCategory)
      }

      for (const fee of feeCategory.fees) {
        const panelBlockElement = document.createElement('div')

        panelBlockElement.className = 'panel-block is-block container--fee'
        panelBlockElement.dataset.feeId = fee.feeId.toString()

        const hasTagsBlock =
          (fee.isRequired ?? false) ||
          fee.occupancyTypeId !== undefined ||
          fee.lotTypeId !== undefined

        // eslint-disable-next-line no-unsanitized/property
        panelBlockElement.innerHTML = `<div class="columns">
          <div class="column is-half">
            <p>
              <a class="has-text-weight-bold" href="#">${cityssm.escapeHTML(fee.feeName ?? '')}</a><br />
              <small>
              ${
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                cityssm
                  .escapeHTML(fee.feeDescription ?? '')
                  .replaceAll('\n', '<br />')
              }
              </small>
            </p>
            ${
              hasTagsBlock
                ? `<p class="tags">
                    ${
                      fee.isRequired ?? false
                        ? '<span class="tag is-warning">Required</span>'
                        : ''
                    }
                    ${
                      (fee.occupancyTypeId ?? -1) === -1
                        ? ''
                        : ` <span class="tag has-tooltip-bottom" data-tooltip="${los.escapedAliases.Occupancy} Type Filter">
                        <span class="icon is-small"><i class="fas fa-filter" aria-hidden="true"></i></span>
                        <span>${cityssm.escapeHTML(fee.occupancyType ?? '')}</span>
                        </span>`
                    }
                    ${
                      (fee.lotTypeId ?? -1) === -1
                        ? ''
                        : ` <span class="tag has-tooltip-bottom" data-tooltip="${los.escapedAliases.Lot} Type Filter">
                        <span class="icon is-small"><i class="fas fa-filter" aria-hidden="true"></i></span>
                        <span>${cityssm.escapeHTML(fee.lotType ?? '')}</span>
                        </span>`
                    }
                    </p>`
                : ''
            }
          </div>
          <div class="column">
            <div class="columns is-mobile">
              <div class="column has-text-centered">
                ${
                  fee.feeFunction
                    ? `${cityssm.escapeHTML(fee.feeFunction)}<br />
                        <small>Fee Function</small>`
                    : `$${(fee.feeAmount ?? 0).toFixed(2)}<br />
                        <small>Fee</small>`
                }
              </div>
              <div class="column has-text-centered">
                ${
                  fee.taxPercentage
                    ? `${fee.taxPercentage.toString()}%`
                    : `$${(fee.taxAmount ?? 0).toFixed(2)}`
                }<br />
                <small>Tax</small>
              </div>
              <div class="column has-text-centered">
                ${
                  fee.includeQuantity
                    ? `${cityssm.escapeHTML(fee.quantityUnit ?? '')}<br />
                        <small>Quantity</small>`
                    : ''
                }
              </div>
            </div>
          </div>
          <div class="column is-narrow">
            ${los.getMoveUpDownButtonFieldHTML(
              'button--moveFeeUp',
              'button--moveFeeDown'
            )}
          </div>
        </div>`

        panelBlockElement
          .querySelector('a')
          ?.addEventListener('click', openEditFee)
        ;(
          panelBlockElement.querySelector(
            '.button--moveFeeUp'
          ) as HTMLButtonElement
        ).addEventListener('click', moveFee)
        ;(
          panelBlockElement.querySelector(
            '.button--moveFeeDown'
          ) as HTMLButtonElement
        ).addEventListener('click', moveFee)

        feeCategoryContainerElement.append(panelBlockElement)
      }

      feeCategoryContainerElement
        .querySelector('.button--editFeeCategory')
        ?.addEventListener('click', openEditFeeCategory)

      feeCategoryContainerElement
        .querySelector('.button--addFee')
        ?.addEventListener('click', openAddFee)
      ;(
        feeCategoryContainerElement.querySelector(
          '.button--moveFeeCategoryUp'
        ) as HTMLButtonElement
      ).addEventListener('click', moveFeeCategory)
      ;(
        feeCategoryContainerElement.querySelector(
          '.button--moveFeeCategoryDown'
        ) as HTMLButtonElement
      ).addEventListener('click', moveFeeCategory)

      feeCategoriesContainerElement.append(feeCategoryContainerElement)
    }
  }

  /*
   * Fee Categories
   */

  document
    .querySelector('#button--addFeeCategory')
    ?.addEventListener('click', () => {
      let addCloseModalFunction: () => void

      function doAddFeeCategory(submitEvent: SubmitEvent): void {
        submitEvent.preventDefault()

        cityssm.postJSON(
          `${los.urlPrefix}/admin/doAddFeeCategory`,
          submitEvent.currentTarget,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as ResponseJSON

            if (responseJSON.success) {
              feeCategories = responseJSON.feeCategories
              addCloseModalFunction()
              renderFeeCategories()
            } else {
              bulmaJS.alert({
                title: 'Error Creating Fee Category',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('adminFees-addFeeCategory', {
        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          ;(
            modalElement.querySelector(
              '#feeCategoryAdd--feeCategory'
            ) as HTMLInputElement
          ).focus()

          addCloseModalFunction = closeModalFunction
          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doAddFeeCategory)
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
          ;(
            document.querySelector(
              '#button--addFeeCategory'
            ) as HTMLButtonElement
          ).focus()
        }
      })
    })

  function openEditFeeCategory(clickEvent: Event): void {
    const feeCategoryId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--feeCategory'
        ) as HTMLElement
      ).dataset.feeCategoryId ?? '',
      10
    )

    const feeCategory = feeCategories.find((currentFeeCategory) => {
      return currentFeeCategory.feeCategoryId === feeCategoryId
    }) as FeeCategory

    let editCloseModalFunction: () => void

    function doUpdateFeeCategory(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doUpdateFeeCategory`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            feeCategories = responseJSON.feeCategories
            editCloseModalFunction()
            renderFeeCategories()
          } else {
            bulmaJS.alert({
              title: 'Error Updating Fee Category',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminFees-editFeeCategory', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#feeCategoryEdit--feeCategoryId'
          ) as HTMLInputElement
        ).value = feeCategory.feeCategoryId.toString()
        ;(
          modalElement.querySelector(
            '#feeCategoryEdit--feeCategory'
          ) as HTMLInputElement
        ).value = feeCategory.feeCategory

        if (feeCategory.isGroupedFee) {
          ;(
            modalElement.querySelector(
              '#feeCategoryEdit--isGroupedFee'
            ) as HTMLInputElement
          ).checked = true
        }
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()

        editCloseModalFunction = closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateFeeCategory)
        ;(
          modalElement.querySelector(
            '#feeCategoryEdit--feeCategory'
          ) as HTMLInputElement
        ).focus()
      },
      onremoved: () => {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function confirmDeleteFeeCategory(clickEvent: Event): void {
    const feeCategoryId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--feeCategory'
        ) as HTMLElement
      ).dataset.feeCategoryId ?? '',
      10
    )

    function doDelete(): void {
      cityssm.postJSON(
        `${los.urlPrefix}/admin/doDeleteFeeCategory`,
        {
          feeCategoryId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            feeCategories = responseJSON.feeCategories
            renderFeeCategories()
          } else {
            bulmaJS.alert({
              title: 'Error Updating Fee Category',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Delete Fee Category?',
      message: 'Are you sure you want to delete this fee category?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete the Fee Category',
        callbackFunction: doDelete
      }
    })
  }

  function moveFeeCategory(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const feeCategoryId =
      (buttonElement.closest('.container--feeCategory') as HTMLElement).dataset
        .feeCategoryId ?? ''

    cityssm.postJSON(
      `${los.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveFeeCategoryUp'
          : 'doMoveFeeCategoryDown'
      }`,
      {
        feeCategoryId,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as ResponseJSON

        if (responseJSON.success) {
          feeCategories = responseJSON.feeCategories
          renderFeeCategories()
        } else {
          bulmaJS.alert({
            title: 'Error Moving Fee Category',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  /*
   * Fees
   */

  function openAddFee(clickEvent: Event): void {
    const feeCategoryId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--feeCategory'
        ) as HTMLElement
      ).dataset.feeCategoryId ?? '',
      10
    )

    let addCloseModalFunction: () => void

    function doAddFee(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doAddFee`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            feeCategories = responseJSON.feeCategories
            addCloseModalFunction()
            renderFeeCategories()
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

    cityssm.openHtmlModal('adminFees-addFee', {
      onshow(modalElement) {
        const feeCategoryElement = modalElement.querySelector(
          '#feeAdd--feeCategoryId'
        ) as HTMLSelectElement

        for (const feeCategory of feeCategories) {
          const optionElement = document.createElement('option')
          optionElement.value = feeCategory.feeCategoryId.toString()
          optionElement.textContent = feeCategory.feeCategory

          if (feeCategory.feeCategoryId === feeCategoryId) {
            optionElement.selected = true
          }

          feeCategoryElement.append(optionElement)
        }

        const occupancyTypeElement = modalElement.querySelector(
          '#feeAdd--occupancyTypeId'
        ) as HTMLSelectElement

        for (const occupancyType of exports.occupancyTypes as OccupancyType[]) {
          const optionElement = document.createElement('option')
          optionElement.value = occupancyType.occupancyTypeId.toString()
          optionElement.textContent = occupancyType.occupancyType
          occupancyTypeElement.append(optionElement)
        }

        const lotTypeElement = modalElement.querySelector(
          '#feeAdd--lotTypeId'
        ) as HTMLSelectElement

        for (const lotType of exports.lotTypes as LotType[]) {
          const optionElement = document.createElement('option')
          optionElement.value = lotType.lotTypeId.toString()
          optionElement.textContent = lotType.lotType
          lotTypeElement.append(optionElement)
        }

        ;(
          modalElement.querySelector(
            '#feeAdd--taxPercentage'
          ) as HTMLInputElement
        ).value = (exports.taxPercentageDefault as number).toString()

        los.populateAliases(modalElement)
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()

        addCloseModalFunction = closeModalFunction

        modalElement.querySelector('form')?.addEventListener('submit', doAddFee)
        ;(
          modalElement.querySelector('#feeAdd--feeName') as HTMLInputElement
        ).focus()
        ;(
          modalElement.querySelector('#feeAdd--feeFunction') as HTMLInputElement
        ).addEventListener('change', () => {
          const feeAmountElement = modalElement.querySelector(
            '#feeAdd--feeAmount'
          ) as HTMLInputElement

          const feeFunctionElement = modalElement.querySelector(
            '#feeAdd--feeFunction'
          ) as HTMLSelectElement

          if (feeFunctionElement.value === '') {
            feeFunctionElement
              .closest('.select')
              ?.classList.remove('is-success')

            feeAmountElement.classList.add('is-success')
            feeAmountElement.disabled = false
          } else {
            feeFunctionElement.closest('.select')?.classList.add('is-success')

            feeAmountElement.classList.remove('is-success')
            feeAmountElement.disabled = true
          }
        })

        modalElement
          .querySelector('#feeAdd--taxPercentage')
          ?.addEventListener('keyup', () => {
            const taxAmountElement = modalElement.querySelector(
              '#feeAdd--taxAmount'
            ) as HTMLInputElement

            const taxPercentageElement = modalElement.querySelector(
              '#feeAdd--taxPercentage'
            ) as HTMLInputElement

            if (taxPercentageElement.value === '') {
              taxPercentageElement.classList.remove('is-success')

              taxAmountElement.classList.add('is-success')
              taxAmountElement.disabled = false
            } else {
              taxPercentageElement.classList.add('is-success')

              taxAmountElement.classList.remove('is-success')
              taxAmountElement.disabled = true
            }
          })

        modalElement
          .querySelector('#feeAdd--includeQuantity')
          ?.addEventListener('change', () => {
            ;(
              modalElement.querySelector(
                '#feeAdd--quantityUnit'
              ) as HTMLInputElement
            ).disabled =
              (
                modalElement.querySelector(
                  '#feeAdd--includeQuantity'
                ) as HTMLSelectElement
              ).value === ''
          })
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function openEditFee(clickEvent: Event): void {
    clickEvent.preventDefault()

    const feeContainerElement = (
      clickEvent.currentTarget as HTMLElement
    ).closest('.container--fee') as HTMLElement

    const feeId = Number.parseInt(feeContainerElement.dataset.feeId ?? '', 10)
    const feeCategoryId = Number.parseInt(
      (feeContainerElement.closest('.container--feeCategory') as HTMLElement)
        .dataset.feeCategoryId ?? ''
    )

    const feeCategory = feeCategories.find((currentFeeCategory) => {
      return currentFeeCategory.feeCategoryId === feeCategoryId
    }) as FeeCategory

    const fee = feeCategory.fees.find((currentFee) => {
      return currentFee.feeId === feeId
    }) as Fee

    let editCloseModalFunction: () => void
    let editModalElement: HTMLElement

    function doUpdateFee(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doUpdateFee`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            feeCategories = responseJSON.feeCategories
            editCloseModalFunction()
            renderFeeCategories()
          } else {
            bulmaJS.alert({
              title: 'Error Updating Fee',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    function confirmDeleteFee(clickEvent: Event): void {
      clickEvent.preventDefault()

      function doDelete(): void {
        cityssm.postJSON(
          `${los.urlPrefix}/admin/doDeleteFee`,
          {
            feeId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as ResponseJSON

            if (responseJSON.success) {
              feeCategories = responseJSON.feeCategories
              editCloseModalFunction()
              renderFeeCategories()
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
        title: 'Delete Fee?',
        message: 'Are you sure you want to delete this fee?',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Delete the Fee',
          callbackFunction: doDelete
        }
      })
    }

    function toggleFeeFields(): void {
      const feeAmountElement = editModalElement.querySelector(
        '#feeEdit--feeAmount'
      ) as HTMLInputElement

      const feeFunctionElement = editModalElement.querySelector(
        '#feeEdit--feeFunction'
      ) as HTMLSelectElement

      if (feeFunctionElement.value === '') {
        feeFunctionElement.closest('.select')?.classList.remove('is-success')

        feeAmountElement.classList.add('is-success')
        feeAmountElement.disabled = false
      } else {
        feeFunctionElement.closest('.select')?.classList.add('is-success')

        feeAmountElement.classList.remove('is-success')
        feeAmountElement.disabled = true
      }
    }

    function toggleTaxFields(): void {
      const taxAmountElement = editModalElement.querySelector(
        '#feeEdit--taxAmount'
      ) as HTMLInputElement

      const taxPercentageElement = editModalElement.querySelector(
        '#feeEdit--taxPercentage'
      ) as HTMLInputElement

      if (taxPercentageElement.value === '') {
        taxPercentageElement.classList.remove('is-success')

        taxAmountElement.classList.add('is-success')
        taxAmountElement.disabled = false
      } else {
        taxPercentageElement.classList.add('is-success')

        taxAmountElement.classList.remove('is-success')
        taxAmountElement.disabled = true
      }
    }

    function toggleQuantityFields(): void {
      const includeQuanitityValue = (
        editModalElement.querySelector(
          '#feeEdit--includeQuantity'
        ) as HTMLSelectElement
      ).value

      ;(
        editModalElement.querySelector(
          '#feeEdit--quantityUnit'
        ) as HTMLInputElement
      ).disabled = includeQuanitityValue === ''
    }

    cityssm.openHtmlModal('adminFees-editFee', {
      onshow(modalElement) {
        editModalElement = modalElement
        ;(
          modalElement.querySelector('#feeEdit--feeId') as HTMLInputElement
        ).value = fee.feeId.toString()

        const feeCategoryElement = modalElement.querySelector(
          '#feeEdit--feeCategoryId'
        ) as HTMLSelectElement

        for (const feeCategory of feeCategories) {
          const optionElement = document.createElement('option')
          optionElement.value = feeCategory.feeCategoryId.toString()
          optionElement.textContent = feeCategory.feeCategory

          if (feeCategory.feeCategoryId === feeCategoryId) {
            optionElement.selected = true
          }

          feeCategoryElement.append(optionElement)
        }

        ;(
          modalElement.querySelector('#feeEdit--feeName') as HTMLInputElement
        ).value = fee.feeName ?? ''
        ;(
          modalElement.querySelector('#feeEdit--feeAccount') as HTMLInputElement
        ).value = fee.feeAccount ?? ''
        ;(
          modalElement.querySelector(
            '#feeEdit--feeDescription'
          ) as HTMLTextAreaElement
        ).value = fee.feeDescription ?? ''

        const occupancyTypeElement = modalElement.querySelector(
          '#feeEdit--occupancyTypeId'
        ) as HTMLSelectElement

        for (const occupancyType of exports.occupancyTypes as OccupancyType[]) {
          const optionElement = document.createElement('option')
          optionElement.value = occupancyType.occupancyTypeId.toString()
          optionElement.textContent = occupancyType.occupancyType

          if (occupancyType.occupancyTypeId === fee.occupancyTypeId) {
            optionElement.selected = true
          }

          occupancyTypeElement.append(optionElement)
        }

        const lotTypeElement = modalElement.querySelector(
          '#feeEdit--lotTypeId'
        ) as HTMLSelectElement

        for (const lotType of exports.lotTypes as LotType[]) {
          const optionElement = document.createElement('option')
          optionElement.value = lotType.lotTypeId.toString()
          optionElement.textContent = lotType.lotType

          if (lotType.lotTypeId === fee.lotTypeId) {
            optionElement.selected = true
          }

          lotTypeElement.append(optionElement)
        }

        ;(
          modalElement.querySelector('#feeEdit--feeAmount') as HTMLInputElement
        ).value = fee.feeAmount ? fee.feeAmount.toFixed(2) : ''

        modalElement
          .querySelector('#feeEdit--feeFunction')
          ?.addEventListener('change', toggleFeeFields)

        toggleFeeFields()
        ;(
          modalElement.querySelector('#feeEdit--taxAmount') as HTMLInputElement
        ).value = fee.taxAmount ? fee.taxAmount.toFixed(2) : ''

        const taxPercentageElement = modalElement.querySelector(
          '#feeEdit--taxPercentage'
        ) as HTMLInputElement
        taxPercentageElement.value = fee.taxPercentage
          ? fee.taxPercentage.toString()
          : ''
        taxPercentageElement.addEventListener('keyup', toggleTaxFields)

        toggleTaxFields()

        const includeQuantityElement = modalElement.querySelector(
          '#feeEdit--includeQuantity'
        ) as HTMLSelectElement

        if (fee.includeQuantity ?? false) {
          includeQuantityElement.value = '1'
        }

        includeQuantityElement.addEventListener('change', toggleQuantityFields)
        ;(
          modalElement.querySelector(
            '#feeEdit--quantityUnit'
          ) as HTMLInputElement
        ).value = fee.quantityUnit ?? ''

        toggleQuantityFields()

        if (fee.isRequired ?? false) {
          ;(
            modalElement.querySelector(
              '#feeEdit--isRequired'
            ) as HTMLSelectElement
          ).value = '1'
        }

        los.populateAliases(modalElement)
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()

        editCloseModalFunction = closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateFee)

        bulmaJS.init(modalElement)

        modalElement
          .querySelector('.button--deleteFee')
          ?.addEventListener('click', confirmDeleteFee)
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function moveFee(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const feeContainerElement = buttonElement.closest(
      '.container--fee'
    ) as HTMLElement

    const feeId = feeContainerElement.dataset.feeId ?? ''

    cityssm.postJSON(
      `${los.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveFeeUp'
          : 'doMoveFeeDown'
      }`,
      {
        feeId,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as ResponseJSON

        if (responseJSON.success) {
          feeCategories = responseJSON.feeCategories
          renderFeeCategories()
        } else {
          bulmaJS.alert({
            title: 'Error Moving Fee',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  /*
   * Initialize
   */

  renderFeeCategories()
})()
