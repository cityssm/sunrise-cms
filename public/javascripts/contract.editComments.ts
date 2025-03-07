import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ContractComment } from '../../types/recordTypes.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  const contractId = (
    document.querySelector('#contract--contractId') as HTMLInputElement
  ).value

  let contractComments = exports.contractComments as ContractComment[]
  delete exports.contractComments

  function openEditContractComment(clickEvent: Event): void {
    const contractCommentId = Number.parseInt(
      (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
        .contractCommentId ?? '',
      10
    )

    const contractComment = contractComments.find(
      (currentComment) => currentComment.contractCommentId === contractCommentId
    ) as ContractComment

    let editFormElement: HTMLFormElement
    let editCloseModalFunction: () => void

    function editContractComment(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doUpdateContractComment`,
        editFormElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            errorMessage?: string
            contractComments?: ContractComment[]
          }

          if (responseJSON.success) {
            contractComments = responseJSON.contractComments ?? []
            editCloseModalFunction()
            renderContractComments()
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

    cityssm.openHtmlModal('contract-editComment', {
      onshow(modalElement) {
        sunrise.populateAliases(modalElement)
        ;(
          modalElement.querySelector(
            '#contractCommentEdit--contractId'
          ) as HTMLInputElement
        ).value = contractId
        ;(
          modalElement.querySelector(
            '#contractCommentEdit--contractCommentId'
          ) as HTMLInputElement
        ).value = contractCommentId.toString()
        ;(
          modalElement.querySelector(
            '#contractCommentEdit--comment'
          ) as HTMLInputElement
        ).value = contractComment.comment ?? ''

        const contractCommentDateStringElement = modalElement.querySelector(
          '#contractCommentEdit--commentDateString'
        ) as HTMLInputElement

        contractCommentDateStringElement.value =
          contractComment.commentDateString ?? ''

        const currentDateString = cityssm.dateToString(new Date())

        contractCommentDateStringElement.max =
          contractComment.commentDateString! <= currentDateString
            ? currentDateString
            : contractComment.commentDateString ?? ''
        ;(
          modalElement.querySelector(
            '#contractCommentEdit--commentTimeString'
          ) as HTMLInputElement
        ).value = contractComment.commentTimeString ?? ''
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
          contractId,
          contractCommentId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            errorMessage?: string
            contractComments: ContractComment[]
          }

          if (responseJSON.success) {
            contractComments = responseJSON.contractComments
            renderContractComments()
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

  function renderContractComments(): void {
    const containerElement = document.querySelector(
      '#container--contractComments'
    ) as HTMLElement

    if (contractComments.length === 0) {
      containerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">There are no comments associated with this record.</p>
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

    for (const contractComment of contractComments) {
      const tableRowElement = document.createElement('tr')
      tableRowElement.dataset.contractCommentId =
        contractComment.contractCommentId?.toString()

      tableRowElement.innerHTML = `<td>${cityssm.escapeHTML(contractComment.recordCreate_userName ?? '')}</td>
          <td>
            ${cityssm.escapeHTML(contractComment.commentDateString ?? '')}
            ${cityssm.escapeHTML(
              contractComment.commentTime === 0
                ? ''
                : contractComment.commentTimePeriodString ?? ''
            )}
          </td>
          <td>${cityssm.escapeHTML(contractComment.comment ?? '')}</td>
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
      let addFormElement: HTMLFormElement
      let addCloseModalFunction: () => void

      function addComment(submitEvent: SubmitEvent): void {
        submitEvent.preventDefault()

        cityssm.postJSON(
          `${sunrise.urlPrefix}/contracts/doAddContractComment`,
          addFormElement,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
              contractComments: ContractComment[]
            }

            if (responseJSON.success) {
              contractComments = responseJSON.contractComments
              addCloseModalFunction()
              renderContractComments()
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
