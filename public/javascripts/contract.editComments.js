"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const contractId = document.querySelector('#contract--contractId').value;
    let contractComments = exports.contractComments;
    delete exports.contractComments;
    function openEditContractComment(clickEvent) {
        const contractCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .contractCommentId ?? '', 10);
        const contractComment = contractComments.find((currentComment) => currentComment.contractCommentId === contractCommentId);
        let editFormElement;
        let editCloseModalFunction;
        function editContractComment(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doUpdateContractComment`, editFormElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    contractComments = responseJSON.contractComments ?? [];
                    if (editCloseModalFunction !== undefined) {
                        editCloseModalFunction();
                    }
                    renderContractComments();
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
        cityssm.openHtmlModal('contract-editComment', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement
                    .querySelector('#contractCommentEdit--contractId')
                    ?.setAttribute('value', contractId);
                modalElement
                    .querySelector('#contractCommentEdit--contractCommentId')
                    ?.setAttribute('value', contractCommentId.toString());
                modalElement.querySelector('#contractCommentEdit--comment').value = contractComment.comment;
                const contractCommentDateStringElement = modalElement.querySelector('#contractCommentEdit--commentDateString');
                contractCommentDateStringElement.value =
                    contractComment.commentDateString;
                const currentDateString = cityssm.dateToString(new Date());
                contractCommentDateStringElement.max =
                    // eslint-disable-next-line unicorn/prefer-math-min-max
                    contractComment.commentDateString <= currentDateString
                        ? currentDateString
                        : contractComment.commentDateString;
                modalElement.querySelector('#contractCommentEdit--commentTimeString').value = contractComment.commentTimeString;
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#contractCommentEdit--comment').focus();
                editFormElement = modalElement.querySelector('form');
                editFormElement.addEventListener('submit', editContractComment);
                editCloseModalFunction = closeModalFunction;
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteContractComment(clickEvent) {
        const contractCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .contractCommentId ?? '', 10);
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doDeleteContractComment`, {
                contractCommentId,
                contractId,
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    contractComments = responseJSON.contractComments;
                    renderContractComments();
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
    function renderContractComments() {
        const containerElement = document.querySelector('#container--contractComments');
        if (contractComments.length === 0) {
            containerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">There are no comments associated with this record.</p>
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
        for (const contractComment of contractComments) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.contractCommentId =
                contractComment.contractCommentId.toString();
            tableRowElement.innerHTML = `<td>${cityssm.escapeHTML(contractComment.recordCreate_userName ?? '')}</td>
          <td>
            ${cityssm.escapeHTML(contractComment.commentDateString)}
            <span class="is-nowrap">
              ${cityssm.escapeHTML(contractComment.commentTime === 0
                ? ''
                : contractComment.commentTimePeriodString)}
            </span>
          </td>
          <td>${cityssm.escapeHTML(contractComment.comment)}</td>
          <td class="is-hidden-print">
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
                ?.addEventListener('click', openEditContractComment);
            tableRowElement
                .querySelector('.button--delete')
                ?.addEventListener('click', deleteContractComment);
            tableElement.querySelector('tbody')?.append(tableRowElement);
        }
        containerElement.innerHTML = '';
        containerElement.append(tableElement);
    }
    document
        .querySelector('#button--addComment')
        ?.addEventListener('click', () => {
        let addFormElement;
        let addCloseModalFunction;
        function addComment(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doAddContractComment`, addFormElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    contractComments = responseJSON.contractComments;
                    if (addCloseModalFunction !== undefined) {
                        addCloseModalFunction();
                    }
                    renderContractComments();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Adding Comment',
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        cityssm.openHtmlModal('contract-addComment', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement.querySelector('#contractCommentAdd--contractId').value = contractId;
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#contractCommentAdd--comment').focus();
                addFormElement = modalElement.querySelector('form');
                addFormElement.addEventListener('submit', addComment);
                addCloseModalFunction = closeModalFunction;
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                document.querySelector('#button--addComment').focus();
            }
        });
    });
    renderContractComments();
})();
