import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ContractAttachment } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const exports: {
  sunrise: Sunrise

  maxAttachmentFileSize: number
  contractAttachments: ContractAttachment[]
}
;(() => {
  const sunrise = exports.sunrise

  const contractId = (
    document.querySelector('#contract--contractId') as HTMLInputElement
  ).value

  const attachmentsContainerElement = document.querySelector(
    '#container--contractAttachments'
  ) as HTMLDivElement

  function renderAttachments(attachments: ContractAttachment[]): void {
    if (attachments.length === 0) {
      attachmentsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">No attachments have been uploaded.</p>
        </div>`
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-striped is-hoverable is-fullwidth'

    tableElement.innerHTML = `<thead>
        <tr>
          <th>Title</th>
          <th>Details</th>
          <th>Uploaded</th>
          <th class="has-text-right">Actions</th>
        </tr>
      </thead>
      <tbody></tbody>`

    for (const attachment of attachments) {
      const attachmentDate = new Date(attachment.recordCreate_timeMillis ?? 0)

      const rowElement = document.createElement('tr')

      // eslint-disable-next-line no-unsanitized/property
      rowElement.innerHTML = `
        <td>
          <a href="${sunrise.urlPrefix}/contracts/attachment/${attachment.contractAttachmentId}"
            class="has-text-weight-bold"
            target="_blank"
            download>
            ${cityssm.escapeHTML(attachment.attachmentTitle === '' ? attachment.fileName : attachment.attachmentTitle)}
          </a><br />
          <small class="has-text-grey">${cityssm.escapeHTML(attachment.fileName)}</small>
        </td>
        <td>
          ${cityssm.escapeHTML(attachment.attachmentDetails)}
        </td>
        <td>
          ${cityssm.escapeHTML(cityssm.dateToString(attachmentDate))}
          ${cityssm.escapeHTML(cityssm.dateToTimeString(attachmentDate))}
        </td>
        <td class="has-text-right">
          <div class="buttons is-right">
            <button class="button is-small is-primary has-tooltip-left" 
              data-tooltip="Edit Attachment"
              data-attachment-id="${attachment.contractAttachmentId}"
              data-cy="edit-attachment">
              <span class="icon is-small">
                <i class="fa-solid fa-pencil-alt"></i>
              </span>
            </button>
            <button class="button is-small is-danger has-tooltip-left" 
              data-tooltip="Delete Attachment"
              data-attachment-id="${attachment.contractAttachmentId}"
              data-cy="delete-attachment">
              <span class="icon is-small">
                <i class="fa-solid fa-trash"></i>
              </span>
            </button>
          </div>
        </td>
      `

      // Add event listeners for the buttons
      const editButton = rowElement.querySelector(
        '[data-cy="edit-attachment"]'
      ) as HTMLButtonElement
      const deleteButton = rowElement.querySelector(
        '[data-cy="delete-attachment"]'
      ) as HTMLButtonElement

      editButton.addEventListener('click', () => {
        openEditAttachmentModal(attachment)
      })

      deleteButton.addEventListener('click', () => {
        deleteAttachment(attachment.contractAttachmentId)
      })

      tableElement.querySelector('tbody')?.append(rowElement)
    }

    attachmentsContainerElement.replaceChildren(tableElement)
  }

  renderAttachments(exports.contractAttachments)

  /*
   * Attachment Upload
   */

  document
    .querySelector('#button--uploadAttachment')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      let uploadModalElement: HTMLElement
      let uploadFormElement: HTMLFormElement
      let uploadCloseModalFunction: (() => void) | undefined

      function uploadAttachment(submitEvent: Event): void {
        submitEvent.preventDefault()

        const formData = new FormData(uploadFormElement)
        formData.set('contractId', contractId)

        // Disable submit button and show loading
        const submitButton = uploadModalElement.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement

        const originalText = (
          submitButton.querySelector('span:last-child') as HTMLElement
        ).textContent as string

        submitButton.disabled = true
        ;(
          submitButton.querySelector('span:last-child') as HTMLElement
        ).textContent = 'Uploading...'

        fetch(`${sunrise.urlPrefix}/contracts/doUploadContractAttachment`, {
          method: 'POST',
          body: formData,
          headers: {
            'X-CSRF-Token':
              document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? ''
          }
        })
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          .then(async (response) => await response.json())
          .then(
            (responseJSON: {
              success: boolean
              errorMessage?: string
              contractAttachments: ContractAttachment[]
            }) => {
              if (responseJSON.success) {
                uploadCloseModalFunction?.()

                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: 'Attachment uploaded successfully.'
                })

                // Refresh the page to show the new attachment
                renderAttachments(responseJSON.contractAttachments)
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Uploading Attachment',

                  message:
                    responseJSON.errorMessage ??
                    'An error occurred while uploading the file.'
                })
              }
            }
          )
          .catch(() => {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Uploading Attachment',

              message: 'An error occurred while uploading the file.'
            })
          })
          .finally(() => {
            // Re-enable submit button
            submitButton.disabled = false
            ;(
              submitButton.querySelector('span:last-child') as HTMLElement
            ).textContent = originalText
          })
      }

      cityssm.openHtmlModal('contract-uploadAttachment', {
        onshow(modalElement) {
          uploadModalElement = modalElement

          modalElement
            .querySelector('#contractAttachmentUpload--contractId')
            ?.setAttribute('value', contractId)
          ;(
            modalElement.querySelector(
              '#contractAttachmentUpload--maxAttachmentFileSize'
            ) as HTMLElement
          ).textContent = String(exports.maxAttachmentFileSize)
        },

        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          uploadCloseModalFunction = closeModalFunction

          uploadFormElement = modalElement.querySelector(
            '#form--contractAttachmentUpload'
          ) as HTMLFormElement

          uploadFormElement.addEventListener('submit', uploadAttachment)

          // Focus on file input
          const fileInputElement = modalElement.querySelector(
            '#contractAttachmentUpload--file'
          ) as HTMLInputElement

          fileInputElement.focus()

          fileInputElement.addEventListener('change', () => {
            const fileSize = fileInputElement.files?.[0]?.size ?? 0

            if (fileSize > exports.maxAttachmentFileSize * 1024 * 1024) {
              bulmaJS.alert({
                contextualColorName: 'danger',
                message: 'File exceeds the maximum size limit.'
              })

              fileInputElement.value = ''
            }
          })
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })

  /*
   * Edit Attachment
   */

  function openEditAttachmentModal(attachment: ContractAttachment): void {
    let editFormElement: HTMLFormElement
    let editCloseModalFunction: (() => void) | undefined

    function editAttachment(submitEvent: Event): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doUpdateContractAttachment`,
        editFormElement,
        (responseJSON: {
          success: boolean
          errorMessage?: string
          contractAttachments: ContractAttachment[]
        }) => {
          if (responseJSON.success) {
            editCloseModalFunction?.()

            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Attachment updated successfully.'
            })

            // Refresh the attachments display
            renderAttachments(responseJSON.contractAttachments)
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Attachment',

              message:
                responseJSON.errorMessage ??
                'An error occurred while updating the attachment.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('contract-editAttachment', {
      onshow(modalElement) {
        // Set the attachment ID
        modalElement
          .querySelector('#contractAttachmentEdit--contractAttachmentId')
          ?.setAttribute('value', String(attachment.contractAttachmentId))

        // Set the current values
        ;(
          modalElement.querySelector(
            '#contractAttachmentEdit--attachmentTitle'
          ) as HTMLInputElement
        ).value = attachment.attachmentTitle
        ;(
          modalElement.querySelector(
            '#contractAttachmentEdit--attachmentDetails'
          ) as HTMLTextAreaElement
        ).value = attachment.attachmentDetails
      },

      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        editCloseModalFunction = closeModalFunction

        editFormElement = modalElement.querySelector(
          '#form--contractAttachmentEdit'
        ) as HTMLFormElement

        editFormElement.addEventListener('submit', editAttachment)

        // Focus on title input
        const titleInputElement = modalElement.querySelector(
          '#contractAttachmentEdit--attachmentTitle'
        ) as HTMLInputElement

        titleInputElement.focus()
        titleInputElement.select()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  /*
   * Delete Attachment
   */

  function deleteAttachment(contractAttachmentId: number): void {
    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/contracts/doDeleteContractAttachment`,
        {
          contractAttachmentId
        },
        (responseJSON: {
          success: boolean
          errorMessage?: string
          contractAttachments: ContractAttachment[]
        }) => {
          if (responseJSON.success) {
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Attachment deleted successfully.'
            })

            // Refresh the attachments display
            renderAttachments(responseJSON.contractAttachments)
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Deleting Attachment',

              message:
                responseJSON.errorMessage ??
                'An error occurred while deleting the attachment.'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'danger',
      title: 'Delete Attachment',

      message:
        'Are you sure you want to delete this attachment? This action cannot be undone.',

      okButton: {
        text: 'Yes, Delete Attachment',
        callbackFunction: doDelete
      }
    })
  }
})()
