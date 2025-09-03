import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { WorkOrderComment } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  const workOrderId = (
    document.querySelector('#workOrderEdit--workOrderId') as HTMLInputElement
  ).value

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
        `${sunrise.urlPrefix}/workOrders/doUpdateWorkOrderComment`,
        editFormElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            errorMessage?: string
            success: boolean
            workOrderComments: WorkOrderComment[]
          }

          if (responseJSON.success) {
            workOrderComments = responseJSON.workOrderComments
            editCloseModalFunction()
            renderWorkOrderComments()
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
            '#workOrderCommentEdit--comment'
          ) as HTMLInputElement
        ).value = workOrderComment.comment ?? ''

        const workOrderCommentDateStringElement = modalElement.querySelector(
          '#workOrderCommentEdit--commentDateString'
        ) as HTMLInputElement

        workOrderCommentDateStringElement.value =
          workOrderComment.commentDateString ?? ''

        const currentDateString = cityssm.dateToString(new Date())

        workOrderCommentDateStringElement.max =
          // eslint-disable-next-line unicorn/prefer-math-min-max
          (workOrderComment.commentDateString ?? '') <= currentDateString
            ? currentDateString
            : workOrderComment.commentDateString ?? ''
        ;(
          modalElement.querySelector(
            '#workOrderCommentEdit--commentTimeString'
          ) as HTMLInputElement
        ).value = workOrderComment.commentTimeString ?? ''
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        ;(
          modalElement.querySelector(
            '#workOrderCommentEdit--comment'
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

  function deleteWorkOrderComment(clickEvent: Event): void {
    const workOrderCommentId = Number.parseInt(
      (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
        .workOrderCommentId ?? '',
      10
    )

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/workOrders/doDeleteWorkOrderComment`,
        {
          workOrderCommentId,
          workOrderId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            errorMessage?: string
            success: boolean
            workOrderComments: WorkOrderComment[]
          }

          if (responseJSON.success) {
            workOrderComments = responseJSON.workOrderComments
            renderWorkOrderComments()
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
      <th>Author</th>
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
          ${workOrderComment.commentDateString}
          ${
            workOrderComment.commentTime === 0
              ? ''
              : workOrderComment.commentTimePeriodString
          }
        </td><td>
          ${cityssm.escapeHTML(workOrderComment.comment ?? '')}
        </td><td class="is-hidden-print">
          <div class="buttons are-small is-justify-content-end">
            <button class="button is-primary button--edit" type="button">
              <span class="icon is-small"><i class="fa-solid fa-pencil-alt"></i></span>
              <span>Edit</span>
            </button>
            <button class="button is-light is-danger button--delete" data-tooltip="Delete Comment" type="button" aria-label="Delete">
              <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
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
        `${sunrise.urlPrefix}/workOrders/doAddWorkOrderComment`,
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
        sunrise.populateAliases(modalElement)
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
            '#workOrderCommentAdd--comment'
          ) as HTMLTextAreaElement
        ).focus()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
        ;(
          document.querySelector('#workOrderComments--add') as HTMLButtonElement
        ).focus()
      }
    })
  }

  document
    .querySelector('#workOrderComments--add')
    ?.addEventListener('click', openAddCommentModal)

  renderWorkOrderComments()
})()
