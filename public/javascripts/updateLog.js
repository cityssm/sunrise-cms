"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const limitElement = document.querySelector('#filter--limit');
    let offset = 0;
    let sortBy = 'recordUpdate_timeMillis';
    let sortDirection = 'desc';
    const recordTypeFilterElement = document.querySelector('#filter--recordType');
    const updateLogTableElement = document.querySelector('#table--updateLog');
    const loadingElement = document.querySelector('#loading--updateLog');
    const loadMoreButtonElement = document.querySelector('#button--updateLogLoadMore');
    const exportButtonElement = document.querySelector('#button--exportUpdateLog');
    function getRecordSpecificElements(logEntry) {
        let recordTypeHTML = '';
        let recordURL = '';
        switch (logEntry.recordType) {
            case 'burialSite': {
                recordTypeHTML = `<span title="Burial Site">
          <i class="fa-solid fa-2x fa-map-pin"></i>
          </span>`;
                recordURL = sunrise.getBurialSiteURL(logEntry.recordId);
                break;
            }
            case 'burialSiteComment': {
                recordTypeHTML = `<span title="Burial Site Comment">
          <span class="fa-layers fa-2x fa-fw">
            <i class="fa-solid fa-map-pin" data-fa-transform="left-4"></i>
            <i class="fa-solid fa-comment" data-fa-glow="10" data-fa-transform="shrink-6 down-4 right-4"></i>
          </span>
          </span>`;
                recordURL = sunrise.getBurialSiteURL(logEntry.recordId);
                break;
            }
            case 'comments': {
                recordTypeHTML = `<span title="Comment">
          <i class="fa-solid fa-2x fa-comments"></i>
          </span>`;
                recordURL = '#';
                break;
            }
            case 'contract': {
                recordTypeHTML = `<span title="Contract">
          <i class="fa-solid fa-2x fa-file-contract"></i>
          </span>`;
                recordURL = sunrise.getContractURL(logEntry.recordId);
                break;
            }
            case 'contractComment': {
                recordTypeHTML = `<span title="Contract Comment">
          <span class="fa-layers fa-2x fa-fw">
            <i class="fa-solid fa-file-contract"></i>
            <i class="fa-solid fa-comment" data-fa-glow="10" data-fa-transform="shrink-6 down-5 right-4"></i>
          </span>`;
                recordURL = sunrise.getContractURL(logEntry.recordId);
                break;
            }
            case 'contractFee': {
                recordTypeHTML = `<span title="Contract Fee">
          <span class="fa-layers fa-2x fa-fw">
            <i class="fa-solid fa-file-contract"></i>
            <i class="fa-solid fa-dollar-sign" data-fa-glow="10" data-fa-transform="shrink-6 down-4 right-4"></i>
          </span>
          </span>`;
                recordURL = sunrise.getContractURL(logEntry.recordId);
                break;
            }
            case 'contractTransactions': {
                recordTypeHTML = `<span title="Contract Transaction">
          <i class="fa-solid fa-2x fa-money-bill-1"></i>
          </span>`;
                recordURL = sunrise.getContractURL(logEntry.recordId);
                break;
            }
            case 'workOrder': {
                recordTypeHTML = `<span title="Work Order">
            <i class="fa-solid fa-2x fa-hard-hat"></i>
          </span>`;
                recordURL = sunrise.getWorkOrderURL(logEntry.recordId);
                break;
            }
            case 'workOrderComment': {
                recordTypeHTML = `<span title="Work Order Comment">
          <span class="fa-layers fa-2x fa-fw">
            <i class="fa-solid fa-hard-hat"></i>
            <i class="fa-solid fa-comment" data-fa-glow="10" data-fa-transform="shrink-6 down-4 right-4"></i>
          </span>
          </span>`;
                recordURL = sunrise.getWorkOrderURL(logEntry.recordId);
                break;
            }
            case 'workOrderMilestone': {
                recordTypeHTML = `<span title="Work Order Milestone">
            <span class="fa-layers fa-2x fa-fw">
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
            const logEntryUpdateDate = new Date(logEntry.recordUpdate_timeMillis);
            const logEntryCreateDate = new Date(logEntry.recordCreate_timeMillis);
            // eslint-disable-next-line no-unsanitized/property
            rowElement.innerHTML = `<td class="has-text-centered">${recordTypeHTML}</td>
        <td>
          <a href="${recordURL}" title="Open Record" target="_blank">${logEntry.displayRecordId}</a>
        </td>
        <td>${logEntry.recordDescription}</td>
        <td>
          <span class="is-nowrap">
            ${cityssm.dateToString(logEntryUpdateDate)} ${cityssm.dateToTimeString(logEntryUpdateDate)}
          </span><br />
          <span class="is-size-7">
            <span class="icon is-small">
              ${logEntry.updateType === 'create'
                ? '<i class="fa-solid fa-star"></i>'
                : '<i class="fa-solid fa-pencil-alt"></i>'}
            </span>
            <span>${logEntry.recordUpdate_userName}</span>
          </span>
        </td>
        <td>
          <span class="is-nowrap">
            ${cityssm.dateToString(logEntryCreateDate)} ${cityssm.dateToTimeString(logEntryCreateDate)}
          </span><br />
          <span class="is-size-7">
            <span class="icon is-small">
              <i class="fa-solid fa-star"></i>
            </span>
            <span>${logEntry.recordCreate_userName}</span>
          </span>
        </td>`;
            tableBodyElement.append(rowElement);
        }
        loadingElement.classList.add('is-hidden');
        tableBodyElement.closest('table')?.classList.remove('is-hidden');
    }
    function getUpdateLog() {
        loadingElement.classList.remove('is-hidden');
        const currentLimit = Math.min(Number.parseInt(limitElement.value, 10), 100);
        cityssm.postJSON(`${sunrise.urlPrefix}/dashboard/doGetRecordUpdateLog`, {
            limit: currentLimit,
            offset,
            recordType: recordTypeFilterElement.value,
            sortBy,
            sortDirection
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.updateLog.length < currentLimit) {
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
        const currentLimit = Math.min(Number.parseInt(limitElement.value, 10), 200);
        offset += currentLimit;
        getUpdateLog();
    });
    recordTypeFilterElement.addEventListener('change', () => {
        offset = 0;
        loadMoreButtonElement.classList.add('is-hidden');
        updateLogTableElement.querySelector('tbody')?.replaceChildren();
        getUpdateLog();
    });
    limitElement.addEventListener('change', () => {
        offset = 0;
        loadMoreButtonElement.classList.add('is-hidden');
        updateLogTableElement.querySelector('tbody')?.replaceChildren();
        getUpdateLog();
    });
    // Add sorting functionality
    function addSortClickHandler(headerElement, sortColumn) {
        headerElement.style.cursor = 'pointer';
        headerElement.classList.add('is-clickable');
        headerElement.addEventListener('click', () => {
            if (sortBy === sortColumn) {
                sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
            }
            else {
                sortBy = sortColumn;
                sortDirection = 'desc';
            }
            offset = 0;
            loadMoreButtonElement.classList.add('is-hidden');
            updateLogTableElement.querySelector('tbody')?.replaceChildren();
            getUpdateLog();
            // Update sort indicators
            for (const th of document.querySelectorAll('#table--updateLog th[data-sort]')) {
                th.classList.remove('has-background-primary-light');
                const iconContainerElement = th.querySelector('.icon');
                if (iconContainerElement !== null) {
                    iconContainerElement.innerHTML = '<i class="fa-solid fa-sort"></i>';
                }
            }
            headerElement.classList.add('has-background-primary-light');
            const iconContainerElement = headerElement.querySelector('.icon');
            if (iconContainerElement !== null) {
                // eslint-disable-next-line no-unsanitized/property
                iconContainerElement.innerHTML = `<i class="fa-solid fa-sort-${sortDirection === 'desc' ? 'down' : 'up'}"></i>`;
            }
        });
    }
    const updateHeader = document.querySelector('#header--updated');
    const createHeader = document.querySelector('#header--created');
    if (updateHeader !== null) {
        addSortClickHandler(updateHeader, 'recordUpdate_timeMillis');
    }
    if (createHeader !== null) {
        addSortClickHandler(createHeader, 'recordCreate_timeMillis');
    }
    // Add export functionality
    exportButtonElement.addEventListener('click', () => {
        const recordType = recordTypeFilterElement.value;
        window.open(`${sunrise.urlPrefix}/dashboard/exportRecordUpdateLog?recordType=${encodeURIComponent(recordType)}`, '_blank');
    });
    getUpdateLog();
})();
