import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddContractCommentResponse } from '../../handlers/contracts-post/doAddContractComment.js'
import type { DoDeleteContractCommentResponse } from '../../handlers/contracts-post/doDeleteContractComment.js'
import type { DoUpdateContractCommentResponse } from '../../handlers/contracts-post/doUpdateContractComment.js'
import type { ContractComment } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise

  contractComments: ContractComment[]
}
;(() => {
  const sunrise = exports.sunrise

  const contractId = (
    document.querySelector('#contract--contractId') as HTMLInputElement
  ).value

  let contractComments = exports.contractComments

  function openEditContractComment(clickEvent: Event): void {
    const contractCommentId = Number.parseInt(
      (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
        .contractCommentId ?? '',
      10
    )

    const contractComment = contractComments.find(
      (currentComment) => currentComment.contractCommentId === contractCommentId
    ) as ContractComment

    let editFormElement: HTMLFormElement | undefined
    let editCloseModalFunction: (() => void) | undefined

    function editContractComment(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doUpdateContractComment`,
        editFormElement,
        (responseJSON: DoUpdateContractCommentResponse) => {
          if (responseJSON.success) {
            contractComments = responseJSON.contractComments

            if (editCloseModalFunction !== undefined) {
              editCloseModalFunction()
            }

            renderContractComments()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Comment',

              message: responseJSON.errorMessage
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('contract-editComment', {
      onshow(modalElement) {
        sunrise.populateAliases(modalElement)

        modalElement
          .querySelector('#contractCommentEdit--contractId')
          ?.setAttribute('value', contractId)

        modalElement
          .querySelector('#contractCommentEdit--contractCommentId')
          ?.setAttribute('value', contractCommentId.toString())
        ;(
          modalElement.querySelector(
            '#contractCommentEdit--comment'
          ) as HTMLTextAreaElement
        ).value = contractComment.comment

        const contractCommentDateStringElement = modalElement.querySelector(
          '#contractCommentEdit--commentDateString'
        ) as HTMLInputElement

        contractCommentDateStringElement.value =
          contractComment.commentDateString

        const currentDateString = cityssm.dateToString(new Date())

        contractCommentDateStringElement.max =
          // eslint-disable-next-line unicorn/prefer-math-min-max
          contractComment.commentDateString <= currentDateString
            ? currentDateString
            : contractComment.commentDateString
        ;(
          modalElement.querySelector(
            '#contractCommentEdit--commentTimeString'
          ) as HTMLInputElement
        ).value = contractComment.commentTimeString
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        ;(
          modalElement.querySelector(
            '#contractCommentEdit--comment'
          ) as HTMLTextAreaElement
        ).focus()

        editFormElement = modalElement.querySelector('form') as HTMLFormElement

        editFormElement.addEventListener('submit', editContractComment)

        editCloseModalFunction = closeModalFunction
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteContractComment(clickEvent: Event): void {
    const contractCommentId = Number.parseInt(
      (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
        .contractCommentId ?? '',
      10
    )

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doDeleteContractComment`,
        {
          contractCommentId,
          contractId
        },
        (responseJSON: DoDeleteContractCommentResponse) => {
          if (responseJSON.success) {
            contractComments = responseJSON.contractComments
            renderContractComments()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Removing Comment',

              message: responseJSON.errorMessage
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

  function renderContractComments(): void {
    const containerElement = document.querySelector(
      '#container--contractComments'
    ) as HTMLElement

    if (contractComments.length === 0) {
      containerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">There are no comments associated with this record.</p>
        </div>
      `
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'
    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Author</th>
          <th>Comment Date</th>
          <th>Comment</th>
          <th class="is-hidden-print"><span class="is-sr-only">Options</span></th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    for (const contractComment of contractComments) {
      const tableRowElement = document.createElement('tr')
      tableRowElement.dataset.contractCommentId =
        contractComment.contractCommentId.toString()

      tableRowElement.innerHTML = /* html */ `
        <td>${cityssm.escapeHTML(contractComment.recordCreate_userName ?? '')}</td>
        <td>
          ${cityssm.escapeHTML(contractComment.commentDateString)}
          <span class="is-nowrap">
            ${cityssm.escapeHTML(
              contractComment.commentTime === 0
                ? ''
                : contractComment.commentTimePeriodString
            )}
          </span>
        </td>
        <td>${cityssm.escapeHTML(contractComment.comment)}</td>
        <td class="is-hidden-print">
          <div class="buttons are-small is-justify-content-end">
            <button class="button is-primary button--edit" type="button">
              <span class="icon is-small"><i class="fa-solid fa-pencil-alt"></i></span>
              <span>Edit</span>
            </button>
            <button class="button is-light is-danger button--delete" type="button" title="Delete Comment">
              <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
            </button>
          </div>
        </td>
      `

      tableRowElement
        .querySelector('.button--edit')
        ?.addEventListener('click', openEditContractComment)

      tableRowElement
        .querySelector('.button--delete')
        ?.addEventListener('click', deleteContractComment)

      tableElement.querySelector('tbody')?.append(tableRowElement)
    }

    containerElement.innerHTML = ''
    containerElement.append(tableElement)
  }

  document
    .querySelector('#button--addComment')
    ?.addEventListener('click', () => {
      let addFormElement: HTMLFormElement | undefined
      let addCloseModalFunction: (() => void) | undefined

      function addComment(submitEvent: SubmitEvent): void {
        submitEvent.preventDefault()

        cityssm.postJSON(
          `${sunrise.urlPrefix}/contracts/doAddContractComment`,
          addFormElement,
          (responseJSON: DoAddContractCommentResponse) => {
            if (responseJSON.success) {
              contractComments = responseJSON.contractComments

              if (addCloseModalFunction !== undefined) {
                addCloseModalFunction()
              }

              renderContractComments()
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error Adding Comment',

                message: responseJSON.errorMessage
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('contract-addComment', {
        onshow(modalElement) {
          sunrise.populateAliases(modalElement)
          ;(
            modalElement.querySelector(
              '#contractCommentAdd--contractId'
            ) as HTMLInputElement
          ).value = contractId
        },
        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          ;(
            modalElement.querySelector(
              '#contractCommentAdd--comment'
            ) as HTMLTextAreaElement
          ).focus()

          addFormElement = modalElement.querySelector('form') as HTMLFormElement

          addFormElement.addEventListener('submit', addComment)

          addCloseModalFunction = closeModalFunction
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
          ;(
            document.querySelector('#button--addComment') as HTMLButtonElement
          ).focus()
        }
      })
    })

  renderContractComments()
})()
