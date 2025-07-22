// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  ContractFee,
  ContractTransaction,
  DynamicsGPDocument,
  Fee,
  FeeCategory
} from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  const contractId = (
    document.querySelector('#contract--contractId') as HTMLInputElement
  ).value

  let contractFees = exports.contractFees as ContractFee[]
  delete exports.contractFees

  const contractFeesContainerElement = document.querySelector(
    '#container--contractFees'
  ) as HTMLElement

  function getFeeGrandTotal(): number {
    let feeGrandTotal = 0

    for (const contractFee of contractFees) {
      feeGrandTotal +=
        ((contractFee.feeAmount ?? 0) + (contractFee.taxAmount ?? 0)) *
        (contractFee.quantity ?? 0)
    }

    return feeGrandTotal
  }

  function editContractFeeQuantity(clickEvent: Event): void {
    const feeId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
        .feeId ?? '',
      10
    )

    const fee = contractFees.find(
      (possibleFee) => possibleFee.feeId === feeId
    ) as ContractFee

    let updateCloseModalFunction: () => void

    function doUpdateQuantity(formEvent: SubmitEvent): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doUpdateContractFeeQuantity`,
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            contractFees: ContractFee[]
            success: boolean
          }

          if (responseJSON.success) {
            contractFees = responseJSON.contractFees
            renderContractFees()
            updateCloseModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Quantity',

              message: 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('contract-editFeeQuantity', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#contractFeeQuantity--contractId'
          ) as HTMLInputElement
        ).value = contractId
        ;(
          modalElement.querySelector(
            '#contractFeeQuantity--feeId'
          ) as HTMLInputElement
        ).value = fee.feeId.toString()
        ;(
          modalElement.querySelector(
            '#contractFeeQuantity--quantity'
          ) as HTMLInputElement
        ).valueAsNumber = fee.quantity ?? 0
        ;(
          modalElement.querySelector(
            '#contractFeeQuantity--quantityUnit'
          ) as HTMLElement
        ).textContent = fee.quantityUnit ?? ''
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()

        updateCloseModalFunction = closeModalFunction
        ;(
          modalElement.querySelector(
            '#contractFeeQuantity--quantity'
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

  function deleteContractFee(clickEvent: Event): void {
    const feeId = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--contractFee'
      ) as HTMLElement
    ).dataset.feeId

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doDeleteContractFee`,
        {
          contractId,
          feeId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            contractFees: ContractFee[]
            errorMessage?: string
            success: boolean
          }

          if (responseJSON.success) {
            contractFees = responseJSON.contractFees
            renderContractFees()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Deleting Fee',

              message: responseJSON.errorMessage ?? '',
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Fee',

      message: 'Are you sure you want to delete this fee?',

      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Delete Fee'
      }
    })
  }

  // eslint-disable-next-line complexity
  function renderContractFees(): void {
    if (contractFees.length === 0) {
      contractFeesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no fees associated with this contract.</p>
        </div>`

      renderContractTransactions()

      return
    }

    contractFeesContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
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
        <td class="has-text-weight-bold has-text-right" id="contractFees--feeAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Tax</th>
        <td class="has-text-right" id="contractFees--taxAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Grand Total</th>
        <td class="has-text-weight-bold has-text-right" id="contractFees--grandTotal"></td>
        <td class="is-hidden-print"></td>
      </tr></tfoot></table>`

    let feeAmountTotal = 0
    let taxAmountTotal = 0

    for (const contractFee of contractFees) {
      const tableRowElement = document.createElement('tr')
      tableRowElement.className = 'container--contractFee'
      tableRowElement.dataset.feeId = contractFee.feeId.toString()
      tableRowElement.dataset.includeQuantity =
        contractFee.includeQuantity ?? false ? '1' : '0'

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = `<td colspan="${contractFee.quantity === 1 ? '5' : '1'}">
          ${cityssm.escapeHTML(contractFee.feeName ?? '')}<br />
          <span class="tag">${cityssm.escapeHTML(contractFee.feeCategory ?? '')}</span>
          </td>
          ${
            contractFee.quantity === 1
              ? ''
              : `<td class="has-text-right">
                  $${contractFee.feeAmount?.toFixed(2)}
                  </td>
                  <td>&times;</td>
                  <td class="has-text-right">${contractFee.quantity?.toString()}</td>
                  <td>=</td>`
          }
          <td class="has-text-right">
            $${((contractFee.feeAmount ?? 0) * (contractFee.quantity ?? 0)).toFixed(2)}
          </td>
          <td class="is-hidden-print">
          <div class="buttons are-small is-flex-wrap-nowrap is-justify-content-end">
          ${
            contractFee.includeQuantity ?? false
              ? `<button class="button is-primary button--editQuantity">
                  <span class="icon is-small"><i class="fa-solid fa-pencil-alt" aria-hidden="true"></i></span>
                  <span>Edit</span>
                  </button>`
              : ''
          }
          <button class="button is-danger is-light button--delete" data-tooltip="Delete Fee" type="button">
            <span class="icon is-small"><i class="fa-solid fa-trash" aria-hidden="true"></i></span>
          </button>
          </div>
          </td>`

      tableRowElement
        .querySelector('.button--editQuantity')
        ?.addEventListener('click', editContractFeeQuantity)

      tableRowElement
        .querySelector('.button--delete')
        ?.addEventListener('click', deleteContractFee)

      contractFeesContainerElement
        .querySelector('tbody')
        ?.append(tableRowElement)

      feeAmountTotal +=
        (contractFee.feeAmount ?? 0) * (contractFee.quantity ?? 0)

      taxAmountTotal +=
        (contractFee.taxAmount ?? 0) * (contractFee.quantity ?? 0)
    }

    ;(
      contractFeesContainerElement.querySelector(
        '#contractFees--feeAmountTotal'
      ) as HTMLElement
    ).textContent = `$${feeAmountTotal.toFixed(2)}`
    ;(
      contractFeesContainerElement.querySelector(
        '#contractFees--taxAmountTotal'
      ) as HTMLElement
    ).textContent = `$${taxAmountTotal.toFixed(2)}`
    ;(
      contractFeesContainerElement.querySelector(
        '#contractFees--grandTotal'
      ) as HTMLElement
    ).textContent = `$${(feeAmountTotal + taxAmountTotal).toFixed(2)}`

    renderContractTransactions()
  }

  const addFeeButtonElement = document.querySelector(
    '#button--addFee'
  ) as HTMLButtonElement

  addFeeButtonElement.addEventListener('click', () => {
    if (sunrise.hasUnsavedChanges()) {
      bulmaJS.alert({
        contextualColorName: 'warning',
        message: 'Please save all unsaved changes before adding fees.',
      })
      return
    }

    let feeCategories: FeeCategory[]

    let feeFilterElement: HTMLInputElement
    let feeFilterResultsElement: HTMLElement

    function doAddFeeCategory(clickEvent: Event): void {
      clickEvent.preventDefault()

      const feeCategoryId = Number.parseInt(
        (clickEvent.currentTarget as HTMLElement).dataset.feeCategoryId ?? '',
        10
      )

      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doAddContractFeeCategory`,
        {
          contractId,
          feeCategoryId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            contractFees: ContractFee[]
            errorMessage?: string
            success: boolean
          }

          if (responseJSON.success) {
            contractFees = responseJSON.contractFees
            renderContractFees()

            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Fee Group Added Successfully',
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Fee',

              message: responseJSON.errorMessage ?? '',
            })
          }
        }
      )
    }

    function doAddFee(feeId: number, quantity: number | string = 1): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doAddContractFee`,
        {
          contractId,
          feeId,
          quantity
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            contractFees: ContractFee[]
            errorMessage?: string
            success: boolean
          }

          if (responseJSON.success) {
            contractFees = responseJSON.contractFees
            renderContractFees()
            filterFees()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Fee',

              message: responseJSON.errorMessage ?? '',
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

      cityssm.openHtmlModal('contract-setFeeQuantity', {
        onshow(modalElement) {
          ;(
            modalElement.querySelector(
              '#contractFeeQuantity--quantityUnit'
            ) as HTMLElement
          ).textContent = fee.quantityUnit ?? ''
        },
        onshown(modalElement, closeModalFunction) {
          quantityCloseModalFunction = closeModalFunction

          quantityElement = modalElement.querySelector(
            '#contractFeeQuantity--quantity'
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
        (clickEvent.currentTarget as HTMLElement).dataset.feeCategoryId ?? '',
        10
      )

      const feeCategory = feeCategories.find(
        (currentFeeCategory) =>
          currentFeeCategory.feeCategoryId === feeCategoryId
      ) as FeeCategory

      const fee = feeCategory.fees.find(
        (currentFee) => currentFee.feeId === feeId
      ) as Fee

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
          ${cityssm.escapeHTML(feeCategory.feeCategory)}
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
                    <span class="icon is-small"><i class="fa-solid fa-plus" aria-hidden="true"></i></span>
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
            contractFeesContainerElement.querySelector(
              `.container--contractFee[data-fee-id='${fee.feeId}'][data-include-quantity='0']`
            ) !== null
          ) {
            continue
          }

          let includeFee = true

          const feeSearchString =
            `${feeCategory.feeCategory} ${fee.feeName ?? ''} ${fee.feeDescription ?? ''}`.toLowerCase()

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
          panelBlockElement.className = 'panel-block is-block container--fee'
          panelBlockElement.dataset.feeId = fee.feeId.toString()
          panelBlockElement.dataset.feeCategoryId =
            feeCategory.feeCategoryId.toString()

          // eslint-disable-next-line no-unsanitized/property
          panelBlockElement.innerHTML = `<strong>${cityssm.escapeHTML(fee.feeName ?? '')}</strong><br />
              <small>
              ${cityssm
                .escapeHTML(fee.feeDescription ?? '')
                .replaceAll('\n', '<br />')}
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

    cityssm.openHtmlModal('contract-addFee', {
      onshow(modalElement) {
        feeFilterElement = modalElement.querySelector(
          '#feeSelect--feeName'
        ) as HTMLInputElement

        feeFilterResultsElement = modalElement.querySelector(
          '#resultsContainer--feeSelect'
        ) as HTMLElement

        cityssm.postJSON(
          `${sunrise.urlPrefix}/contracts/doGetFees`,
          {
            contractId
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
        renderContractFees()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
        addFeeButtonElement.focus()
      }
    })
  })

  let contractTransactions =
    exports.contractTransactions as ContractTransaction[]
  delete exports.contractTransactions

  const contractTransactionsContainerElement = document.querySelector(
    '#container--contractTransactions'
  ) as HTMLElement

  function getTransactionGrandTotal(): number {
    let transactionGrandTotal = 0

    for (const contractTransaction of contractTransactions) {
      transactionGrandTotal += contractTransaction.transactionAmount
    }

    return transactionGrandTotal
  }

  function editContractTransaction(clickEvent: Event): void {
    const transactionIndex = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
        .transactionIndex ?? '',
      10
    )

    const transaction = contractTransactions.find(
      (possibleTransaction) =>
        possibleTransaction.transactionIndex === transactionIndex
    ) as ContractTransaction

    let editCloseModalFunction: () => void

    function doEdit(formEvent: SubmitEvent): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doUpdateContractTransaction`,
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            contractTransactions: ContractTransaction[]
            success: boolean
          }

          if (responseJSON.success) {
            contractTransactions = responseJSON.contractTransactions
            renderContractTransactions()
            editCloseModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Transaction',

              message: 'Please try again.',
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('contract-editTransaction', {
      onshow(modalElement) {
        sunrise.populateAliases(modalElement)
        ;(
          modalElement.querySelector(
            '#contractTransactionEdit--contractId'
          ) as HTMLInputElement
        ).value = contractId
        ;(
          modalElement.querySelector(
            '#contractTransactionEdit--transactionIndex'
          ) as HTMLInputElement
        ).value = transaction.transactionIndex?.toString() ?? ''
        ;(
          modalElement.querySelector(
            '#contractTransactionEdit--transactionAmount'
          ) as HTMLInputElement
        ).value = transaction.transactionAmount.toFixed(2)

        if ((transaction.isInvoiced ?? 0) !== 0) {
          ;(
            modalElement.querySelector(
              '#contractTransactionEdit--isInvoiced'
            ) as HTMLSelectElement
          ).value = '1'
        }

        ;(
          modalElement.querySelector(
            '#contractTransactionEdit--externalReceiptNumber'
          ) as HTMLInputElement
        ).value = transaction.externalReceiptNumber ?? ''
        ;(
          modalElement.querySelector(
            '#contractTransactionEdit--transactionNote'
          ) as HTMLTextAreaElement
        ).value = transaction.transactionNote ?? ''
        ;(
          modalElement.querySelector(
            '#contractTransactionEdit--transactionDateString'
          ) as HTMLInputElement
        ).value = transaction.transactionDateString ?? ''
        ;(
          modalElement.querySelector(
            '#contractTransactionEdit--transactionTimeString'
          ) as HTMLInputElement
        ).value = transaction.transactionTimeString ?? ''
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        ;(
          modalElement.querySelector(
            '#contractTransactionEdit--transactionAmount'
          ) as HTMLInputElement
        ).focus()

        modalElement.querySelector('form')?.addEventListener('submit', doEdit)

        editCloseModalFunction = closeModalFunction
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteContractTransaction(clickEvent: Event): void {
    const transactionIndex = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--contractTransaction'
      ) as HTMLElement
    ).dataset.transactionIndex

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doDeleteContractTransaction`,
        {
          contractId,
          transactionIndex
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            contractTransactions: ContractTransaction[]
            errorMessage?: string
            success: boolean
          }

          if (responseJSON.success) {
            contractTransactions = responseJSON.contractTransactions
            renderContractTransactions()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Deleting Transaction',

              message: responseJSON.errorMessage ?? '',
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Transaction',

      message: 'Are you sure you want to delete this transaction?',
      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Delete Transaction',
      }
    })
  }

  function renderContractTransactions(): void {
    if (contractTransactions.length === 0) {
      // eslint-disable-next-line no-unsanitized/property
      contractTransactionsContainerElement.innerHTML = `<div class="message ${contractFees.length === 0 ? 'is-info' : 'is-warning'}">
          <p class="message-body">There are no transactions associated with this contract.</p>
          </div>`

      return
    }

    // eslint-disable-next-line no-unsanitized/property
    contractTransactionsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
        <thead><tr>
          <th class="has-width-1">Date</th>
          <th>${sunrise.escapedAliases.ExternalReceiptNumber}</th>
          <th class="has-text-right has-width-1">Amount</th>
          <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Options</span></th>
        </tr></thead>
        <tbody></tbody>
        <tfoot><tr>
          <th colspan="2">Transaction Total</th>
          <td class="has-text-weight-bold has-text-right" id="contractTransactions--grandTotal"></td>
          <td class="is-hidden-print"></td>
        </tr></tfoot>
        </table>`

    let transactionGrandTotal = 0

    for (const contractTransaction of contractTransactions) {
      transactionGrandTotal += contractTransaction.transactionAmount

      const tableRowElement = document.createElement('tr')
      tableRowElement.className = 'container--contractTransaction'
      tableRowElement.dataset.transactionIndex =
        contractTransaction.transactionIndex?.toString()

      let externalReceiptNumberHTML = ''

      if (contractTransaction.externalReceiptNumber !== '') {
        externalReceiptNumberHTML = cityssm.escapeHTML(
          contractTransaction.externalReceiptNumber ?? ''
        )

        if (sunrise.dynamicsGPIntegrationIsEnabled) {
          if (contractTransaction.dynamicsGPDocument === undefined) {
            externalReceiptNumberHTML += ` <span data-tooltip="No Matching Document Found">
                <i class="fa-solid fa-times-circle has-text-danger" aria-label="No Matching Document Found"></i>
                </span>`
          } else if (
            contractTransaction.dynamicsGPDocument.documentTotal.toFixed(2) ===
            contractTransaction.transactionAmount.toFixed(2)
          ) {
            externalReceiptNumberHTML += ` <span data-tooltip="Matching Document Found">
                <i class="fa-solid fa-check-circle has-text-success" aria-label="Matching Document Found"></i>
                </span>`
          } else {
            externalReceiptNumberHTML += ` <span data-tooltip="Matching Document: $${contractTransaction.dynamicsGPDocument.documentTotal.toFixed(
              2
            )}">
            <i class="fa-solid fa-check-circle has-text-warning" aria-label="Matching Document: $${contractTransaction.dynamicsGPDocument.documentTotal.toFixed(
              2
            )}"></i>
            </span>`
          }
        }

        externalReceiptNumberHTML += '<br />'
      }

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = `<td>
        ${cityssm.escapeHTML(contractTransaction.transactionDateString ?? '')}
        ${
          (contractTransaction.isInvoiced ?? 0) === 0
            ? ''
            : '<br /><span class="tag is-info">Invoiced</span>'
        }
        </td>
        <td>
          ${externalReceiptNumberHTML}
          <small>${cityssm.escapeHTML(contractTransaction.transactionNote ?? '')}</small>
        </td>
        <td class="has-text-right">
          $${cityssm.escapeHTML(contractTransaction.transactionAmount.toFixed(2))}
        </td>
        <td class="is-hidden-print">
          <div class="buttons are-small is-flex-wrap-nowrap is-justify-content-end">
            <button class="button is-primary button--edit" data-tooltip="Edit Transaction" type="button">
              <span class="icon"><i class="fa-solid fa-pencil-alt" aria-hidden="true"></i></span>
            </button>
            <button class="button is-danger is-light button--delete" data-tooltip="Delete Transaction" type="button">
              <span class="icon is-small"><i class="fa-solid fa-trash" aria-hidden="true"></i></span>
            </button>
          </div>
        </td>`

      tableRowElement
        .querySelector('.button--edit')
        ?.addEventListener('click', editContractTransaction)

      tableRowElement
        .querySelector('.button--delete')
        ?.addEventListener('click', deleteContractTransaction)

      contractTransactionsContainerElement
        .querySelector('tbody')
        ?.append(tableRowElement)
    }

    ;(
      contractTransactionsContainerElement.querySelector(
        '#contractTransactions--grandTotal'
      ) as HTMLElement
    ).textContent = `$${transactionGrandTotal.toFixed(2)}`

    const feeGrandTotal = getFeeGrandTotal()

    if (feeGrandTotal.toFixed(2) !== transactionGrandTotal.toFixed(2)) {
      const difference = feeGrandTotal - transactionGrandTotal
      const differenceClassName = difference < 0 ? 'is-danger' : 'is-warning'

      // eslint-disable-next-line no-unsanitized/method
      contractTransactionsContainerElement.insertAdjacentHTML(
        'afterbegin',
        `<div class="message ${differenceClassName}">
            <div class="message-body">
            <div class="level">
              <div class="level-left">
                <div class="level-item">
                  ${difference < 0 ? 'Overpayment' : 'Outstanding Balance'}
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  $${cityssm.escapeHTML(Math.abs(difference).toFixed(2))}
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
        `${sunrise.urlPrefix}/contracts/doAddContractTransaction`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            contractTransactions: ContractTransaction[]
            errorMessage?: string
            success: boolean
          }

          if (responseJSON.success) {
            contractTransactions = responseJSON.contractTransactions
            addCloseModalFunction()
            renderContractTransactions()
          } else {
            bulmaJS.confirm({
              contextualColorName: 'danger',
              message: responseJSON.errorMessage ?? '',
              title: 'Error Adding Transaction'
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
          '<i class="fa-solid fa-minus" aria-hidden="true"></i>'
        return
      }

      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doGetDynamicsGPDocument`,
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
              '<i class="fa-solid fa-times-circle" aria-hidden="true"></i>'
          } else if (
            transactionAmountElement.valueAsNumber ===
            responseJSON.dynamicsGPDocument.documentTotal
          ) {
            helpTextElement.textContent = 'Matching Document Found'
            iconElement.innerHTML =
              '<i class="fa-solid fa-check-circle" aria-hidden="true"></i>'
          } else {
            helpTextElement.textContent = `Matching Document: $${responseJSON.dynamicsGPDocument.documentTotal.toFixed(2)}`
            iconElement.innerHTML =
              '<i class="fa-solid fa-exclamation-triangle" aria-hidden="true"></i>'
          }
        }
      )
    }

    cityssm.openHtmlModal('contract-addTransaction', {
      onshow(modalElement) {
        sunrise.populateAliases(modalElement)
        ;(
          modalElement.querySelector(
            '#contractTransactionAdd--contractId'
          ) as HTMLInputElement
        ).value = contractId.toString()

        const feeGrandTotal = getFeeGrandTotal()
        const transactionGrandTotal = getTransactionGrandTotal()

        transactionAmountElement = modalElement.querySelector(
          '#contractTransactionAdd--transactionAmount'
        ) as HTMLInputElement

        transactionAmountElement.min = (-1 * transactionGrandTotal).toFixed(2)

        transactionAmountElement.max = Math.max(
          feeGrandTotal - transactionGrandTotal,
          0
        ).toFixed(2)

        transactionAmountElement.value = Math.max(
          feeGrandTotal - transactionGrandTotal,
          0
        ).toFixed(2)

        if (sunrise.dynamicsGPIntegrationIsEnabled) {
          externalReceiptNumberElement = modalElement.querySelector(
            '#contractTransactionAdd--externalReceiptNumber'
          ) as HTMLInputElement

          const externalReceiptNumberControlElement =
            externalReceiptNumberElement.closest('.control') as HTMLElement

          externalReceiptNumberControlElement.classList.add('has-icons-right')

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

  renderContractFees()
})()
