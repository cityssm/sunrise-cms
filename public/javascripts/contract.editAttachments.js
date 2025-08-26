"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const contractId = document.querySelector('#contract--contractId').value;
    const attachmentsContainerElement = document.querySelector('#container--contractAttachments');
    function renderAttachments(attachments) {
        if (attachments.length === 0) {
            attachmentsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">No attachments have been uploaded.</p>
        </div>`;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-striped is-hoverable is-fullwidth';
        tableElement.innerHTML = `<thead>
        <tr>
          <th>Title</th>
          <th>Details</th>
          <th>Uploaded</th>
        </tr>
      </thead>
      <tbody></tbody>`;
        for (const attachment of attachments) {
            const attachmentDate = new Date(attachment.recordCreate_timeMillis ?? 0);
            const rowElement = document.createElement('tr');
            // eslint-disable-next-line no-unsanitized/property
            rowElement.innerHTML = `
        <td>
          <a href="${sunrise.urlPrefix}/contracts/attachment/${attachment.contractAttachmentId}"
            class="has-text-weight-bold"
            target="_blank"
            download>
            ${cityssm.escapeHTML(attachment.attachmentTitle)}
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
      `;
            tableElement.querySelector('tbody')?.append(rowElement);
        }
        attachmentsContainerElement.replaceChildren(tableElement);
    }
    renderAttachments(exports.contractAttachments);
    /*
     * Attachment Upload
     */
    document
        .querySelector('#button--uploadAttachment')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        let uploadModalElement;
        let uploadFormElement;
        let uploadCloseModalFunction;
        function uploadAttachment(submitEvent) {
            submitEvent.preventDefault();
            const formData = new FormData(uploadFormElement);
            formData.set('contractId', contractId);
            // Disable submit button and show loading
            const submitButton = uploadModalElement.querySelector('button[type="submit"]');
            const originalText = submitButton.querySelector('span:last-child').textContent;
            submitButton.disabled = true;
            submitButton.querySelector('span:last-child').textContent = 'Uploading...';
            fetch(`${sunrise.urlPrefix}/contracts/doUploadContractAttachment`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-Token': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') ?? ''
                }
            })
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                .then(async (response) => await response.json())
                .then((responseJSON) => {
                if (responseJSON.success) {
                    uploadCloseModalFunction?.();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Attachment uploaded successfully.'
                    });
                    // Refresh the page to show the new attachment
                    renderAttachments(responseJSON.contractAttachments);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Uploading Attachment',
                        message: responseJSON.errorMessage ??
                            'An error occurred while uploading the file.'
                    });
                }
            })
                .catch(() => {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Uploading Attachment',
                    message: 'An error occurred while uploading the file.'
                });
            })
                .finally(() => {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.querySelector('span:last-child').textContent = originalText;
            });
        }
        cityssm.openHtmlModal('contract-uploadAttachment', {
            onshow(modalElement) {
                uploadModalElement = modalElement;
                modalElement
                    .querySelector('#contractAttachmentUpload--contractId')
                    ?.setAttribute('value', contractId);
                modalElement.querySelector('#contractAttachmentUpload--maxAttachmentFileSize').textContent = String(exports.maxAttachmentFileSize);
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                uploadCloseModalFunction = closeModalFunction;
                uploadFormElement = modalElement.querySelector('#form--contractAttachmentUpload');
                uploadFormElement.addEventListener('submit', uploadAttachment);
                // Focus on file input
                const fileInputElement = modalElement.querySelector('#contractAttachmentUpload--file');
                fileInputElement.focus();
                fileInputElement.addEventListener('change', () => {
                    const fileSize = fileInputElement.files?.[0]?.size ?? 0;
                    if (fileSize > exports.maxAttachmentFileSize * 1024 * 1024) {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'File exceeds the maximum size limit.'
                        });
                        fileInputElement.value = '';
                    }
                });
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
})();
