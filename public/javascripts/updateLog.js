"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const limit = 50;
    let offset = 0;
    const recordTypeFilterElement = document.querySelector('#filter--recordType');
    const updateLogTableElement = document.querySelector('#table--updateLog');
    const loadingElement = document.querySelector('#loading--updateLog');
    const loadMoreButtonElement = document.querySelector('#button--updateLogLoadMore');
    function getRecordSpecificElements(logEntry) {
        let recordTypeHTML = '';
        let recordURL = '';
        switch (logEntry.recordType) {
            case 'contract': {
                recordTypeHTML = `<span class="icon" title="Contract">
          <i class="fa-solid fa-file-contract"></i>
          </span>`;
                recordURL = sunrise.getContractURL(logEntry.recordId);
                break;
            }
            case 'contractTransactions': {
                recordTypeHTML = `<span class="icon" title="Contract Transaction">
          <i class="fa-solid fa-money-bill-1"></i>
          </span>`;
                recordURL = sunrise.getContractURL(logEntry.recordId);
                break;
            }
            case 'workOrder': {
                recordTypeHTML = `<span class="icon" title="Work Order">
            <i class="fa-solid fa-hard-hat"></i>
          </span>`;
                recordURL = sunrise.getWorkOrderURL(logEntry.recordId);
                break;
            }
            case 'workOrderMilestone': {
                recordTypeHTML = `<span class="icon" title="Work Order Milestone">
            <span class="fa-layers fa-fw">
              <i class="fa-solid fa-hard-hat"></i>
              <i class="fa-solid fa-clock" data-fa-glow="10" data-fa-transform="shrink-6 down-4 right-4"></i>
            </span>

          </span>`;
                recordURL = sunrise.getWorkOrderURL(logEntry.recordId);
                break;
            }
        }
        return { recordTypeHTML, recordURL };
    }
    function renderUpdateLog(updateLog) {
        const tableBodyElement = updateLogTableElement.querySelector('tbody');
        for (const logEntry of updateLog) {
            const rowElement = document.createElement('tr');
            const { recordTypeHTML, recordURL } = getRecordSpecificElements(logEntry);
            const logEntryDate = new Date(logEntry.recordUpdate_timeMillis);
            // eslint-disable-next-line no-unsanitized/property
            rowElement.innerHTML = `<td class="has-text-centered">${recordTypeHTML}</td>
        <td>
          <a href="${recordURL}" title="Open Record" target="_blank">${logEntry.displayRecordId}</a>
        </td>
        <td>${logEntry.recordDescription}</td>
        <td>
          <span class="is-nowrap">
            ${cityssm.dateToString(logEntryDate)} ${cityssm.dateToTimeString(logEntryDate)}
          </span><br />
          <span class="is-size-7">
            <span class="icon is-small">
              ${logEntry.updateType === 'create'
                ? '<i class="fa-solid fa-star"></i>'
                : '<i class="fa-solid fa-pencil-alt"></i>'}
            </span>
            <span>${logEntry.recordUpdate_userName}</span>
          </span>
        </td>`;
            tableBodyElement.append(rowElement);
        }
        loadingElement.classList.add('is-hidden');
        tableBodyElement.closest('table')?.classList.remove('is-hidden');
    }
    function getUpdateLog() {
        loadingElement.classList.remove('is-hidden');
        cityssm.postJSON(`${sunrise.urlPrefix}/dashboard/doGetRecordUpdateLog`, {
            limit,
            offset,
            recordType: recordTypeFilterElement.value
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.updateLog.length < limit) {
                loadMoreButtonElement.classList.add('is-hidden');
            }
            else {
                loadMoreButtonElement.classList.remove('is-hidden');
            }
            renderUpdateLog(responseJSON.updateLog);
        });
    }
    loadMoreButtonElement.addEventListener('click', () => {
        loadMoreButtonElement.classList.add('is-hidden');
        offset += limit;
        getUpdateLog();
    });
    recordTypeFilterElement.addEventListener('change', () => {
        offset = 0;
        loadMoreButtonElement.classList.add('is-hidden');
        updateLogTableElement.querySelector('tbody')?.replaceChildren();
        getUpdateLog();
    });
    getUpdateLog();
})();
