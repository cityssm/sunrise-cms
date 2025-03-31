"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const workOrderId = document.querySelector('#workOrderEdit--workOrderId').value;
    let workOrderComments = exports.workOrderComments;
    delete exports.workOrderComments;
    function openEditWorkOrderComment(clickEvent) {
        const workOrderCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .workOrderCommentId ?? '', 10);
        const workOrderComment = workOrderComments.find((currentComment) => currentComment.workOrderCommentId === workOrderCommentId);
        let editFormElement;
        let editCloseModalFunction;
        function editComment(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/doUpdateWorkOrderComment`, editFormElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    workOrderComments = responseJSON.workOrderComments;
                    editCloseModalFunction();
                    renderWorkOrderComments();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Updating Comment',
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        cityssm.openHtmlModal('workOrder-editComment', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#workOrderCommentEdit--workOrderId').value = workOrderId;
                modalElement.querySelector('#workOrderCommentEdit--workOrderCommentId').value = workOrderCommentId.toString();
                modalElement.querySelector('#workOrderCommentEdit--comment').value = workOrderComment.comment ?? '';
                const workOrderCommentDateStringElement = modalElement.querySelector('#workOrderCommentEdit--commentDateString');
                workOrderCommentDateStringElement.value =
                    workOrderComment.commentDateString ?? '';
                const currentDateString = cityssm.dateToString(new Date());
                workOrderCommentDateStringElement.max =
                    workOrderComment.commentDateString <= currentDateString
                        ? currentDateString
                        : workOrderComment.commentDateString ?? '';
                modalElement.querySelector('#workOrderCommentEdit--commentTimeString').value = workOrderComment.commentTimeString ?? '';
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#workOrderCommentEdit--comment').focus();
                editFormElement = modalElement.querySelector('form');
                editFormElement.addEventListener('submit', editComment);
                editCloseModalFunction = closeModalFunction;
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteWorkOrderComment(clickEvent) {
        const workOrderCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .workOrderCommentId ?? '', 10);
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/doDeleteWorkOrderComment`, {
                workOrderId,
                workOrderCommentId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    workOrderComments = responseJSON.workOrderComments;
                    renderWorkOrderComments();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Removing Comment',
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Remove Comment?',
            message: 'Are you sure you want to remove this comment?',
            okButton: {
                text: 'Yes, Remove Comment',
                callbackFunction: doDelete
            },
            contextualColorName: 'warning'
        });
    }
    function renderWorkOrderComments() {
        const containerElement = document.querySelector('#container--workOrderComments');
        if (workOrderComments.length === 0) {
            containerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no comments to display.</p>
        </div>`;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = `<thead><tr>
          <th>Author</th>
          <th>Comment Date</th>
          <th>Comment</th>
          <th class="is-hidden-print"><span class="is-sr-only">Options</span></th>
          </tr></thead>
          <tbody></tbody>`;
        for (const workOrderComment of workOrderComments) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.workOrderCommentId =
                workOrderComment.workOrderCommentId?.toString();
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = `<td>
          ${cityssm.escapeHTML(workOrderComment.recordCreate_userName ?? '')}
        </td><td>
          ${workOrderComment.commentDateString}
          ${workOrderComment.commentTime === 0
                ? ''
                : workOrderComment.commentTimePeriodString}
        </td><td>
          ${cityssm.escapeHTML(workOrderComment.comment ?? '')}
        </td><td class="is-hidden-print">
          <div class="buttons are-small is-justify-content-end">
            <button class="button is-primary button--edit" type="button">
              <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
              <span>Edit</span>
            </button>
            <button class="button is-light is-danger button--delete" data-tooltip="Delete Comment" type="button" aria-label="Delete">
              <span class="icon is-small"><i class="fas fa-trash" aria-hidden="true"></i></span>
            </button>
          </div>
        </td>`;
            tableRowElement
                .querySelector('.button--edit')
                ?.addEventListener('click', openEditWorkOrderComment);
            tableRowElement
                .querySelector('.button--delete')
                ?.addEventListener('click', deleteWorkOrderComment);
            tableElement.querySelector('tbody')?.append(tableRowElement);
        }
        containerElement.innerHTML = '';
        containerElement.append(tableElement);
    }
    function openAddCommentModal() {
        let addCommentCloseModalFunction;
        function doAddComment(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/doAddWorkOrderComment`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    workOrderComments = responseJSON.workOrderComments;
                    renderWorkOrderComments();
                    addCommentCloseModalFunction();
                }
            });
        }
        cityssm.openHtmlModal('workOrder-addComment', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement.querySelector('#workOrderCommentAdd--workOrderId').value = workOrderId;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddComment);
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                addCommentCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#workOrderCommentAdd--comment').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                document.querySelector('#workOrderComments--add').focus();
            }
        });
    }
    document
        .querySelector('#workOrderComments--add')
        ?.addEventListener('click', openAddCommentModal);
    renderWorkOrderComments();
})();
