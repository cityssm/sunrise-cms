(() => {
    const sunrise = exports.sunrise;
    const auditLogContainerElement = document.querySelector('#container--auditLog');
    const filterFormElement = document.querySelector('#form--auditLogFilters');
    const pageLimit = 50;
    let currentOffset = 0;
    function getUpdateTypeColorClass(updateType) {
        switch (updateType) {
            case 'created': {
                return 'has-background-success-light';
            }
            case 'deleted': {
                return 'has-background-danger-light';
            }
            default: {
                return 'has-background-warning-light';
            }
        }
    }
    function getRecordUrl(mainRecordType, mainRecordId) {
        switch (mainRecordType) {
            case 'burialSite': {
                return exports.sunrise.getBurialSiteUrl(mainRecordId);
            }
            case 'cemetery': {
                return exports.sunrise.getCemeteryUrl(mainRecordId);
            }
            case 'contract': {
                return exports.sunrise.getContractUrl(mainRecordId);
            }
            case 'funeralHome': {
                return exports.sunrise.getFuneralHomeUrl(mainRecordId);
            }
            case 'workOrder': {
                return exports.sunrise.getWorkOrderUrl(mainRecordId);
            }
            default: {
                return undefined;
            }
        }
    }
    const maxValueLength = 100;
    function truncateValue(value) {
        if (value.length <= maxValueLength) {
            return value;
        }
        return `${value.slice(0, maxValueLength)}\u2026`;
    }
    function buildValueCell(rawValue) {
        if (rawValue === null || rawValue === 'null') {
            return '<em class="has-text-grey-darker">null</em>';
        }
        const escaped = cityssm.escapeHTML(rawValue);
        if (rawValue.length <= maxValueLength) {
            return `<code style="word-break:break-all">${escaped}</code>`;
        }
        const truncated = cityssm.escapeHTML(truncateValue(rawValue));
        return `
      <code title="${escaped}" style="cursor:help;word-break:break-all">
        ${truncated}
      </code>
    `;
    }
    function renderAuditLog(responseJSON) {
        const { auditLogEntries, count, offset } = responseJSON;
        if (auditLogEntries.length === 0) {
            auditLogContainerElement.innerHTML = `
        <p class="has-text-grey">
          ${cityssm.escapeHTML(i18next.t('admin:auditLogNoEntries'))}
        </p>
      `;
            return;
        }
        const rowsHtml = auditLogEntries
            .map((entry) => {
            const logDate = new Date(entry.logMillis);
            const dateString = logDate.toLocaleDateString();
            const timeString = logDate.toLocaleTimeString();
            const recordUrl = getRecordUrl(entry.mainRecordType, entry.mainRecordId);
            return `
          <tr class="is-size-7 ${getUpdateTypeColorClass(entry.updateType)}">
            <td>
              ${cityssm.escapeHTML(dateString)}<br />
              <span class="is-size-7">${cityssm.escapeHTML(timeString)}</span>
            </td>
            <td>
              ${cityssm.escapeHTML(entry.mainRecordType)}<br />
              ${recordUrl === undefined
                ? `<span class="is-size-7">${cityssm.escapeHTML(entry.mainRecordId)}</span>`
                : `
                    <a
                      class="has-text-black has-text-weight-semibold is-size-7"
                      href="${cityssm.escapeHTML(recordUrl)}"
                      title="${cityssm.escapeHTML(i18next.t('admin:auditLogViewRecord'))}"
                      target="_blank"
                    >
                      ${cityssm.escapeHTML(entry.mainRecordId)}
                    </a>
                  `}
            </td>
            <td>
              ${cityssm.escapeHTML(entry.updateTable)}<br />
              ${entry.recordIndex === null
                ? ''
                : `
                    <span class="is-size-7">
                      ${cityssm.escapeHTML(entry.recordIndex)}
                    </span>
                  `}
            </td>
            <td>
              ${cityssm.escapeHTML(entry.updateField)}
            </td>
            <td style="max-width:400px">${buildValueCell(entry.fromValue)}</td>
            <td style="max-width:400px">${buildValueCell(entry.toValue)}</td>
            <td class="is-nowrap">
              ${cityssm.escapeHTML(entry.updateUserName)}
            </td>
          </tr>
        `;
        })
            .join('');
        auditLogContainerElement.innerHTML = `
      <div class="table-container">
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>${cityssm.escapeHTML(i18next.t('time'))}</th>
              <th>${cityssm.escapeHTML(i18next.t('admin:mainRecordType'))}</th>
              <th>
                ${cityssm.escapeHTML(i18next.t('admin:auditLogTable'))}
              </th>
              <th>
                ${cityssm.escapeHTML(i18next.t('admin:auditLogField'))}
              </th>
              <th>${cityssm.escapeHTML(i18next.t('admin:auditLogFrom'))}</th>
              <th>${cityssm.escapeHTML(i18next.t('admin:auditLogTo'))}</th>
              <th>${cityssm.escapeHTML(i18next.t('admin:userName'))}</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    `;
        auditLogContainerElement.insertAdjacentHTML('beforeend', sunrise.getSearchResultsPagerHTML(pageLimit, offset, count));
        auditLogContainerElement
            .querySelector("button[data-page='previous']")
            ?.addEventListener('click', () => {
            currentOffset = Math.max(currentOffset - pageLimit, 0);
            fetchAuditLog();
        });
        auditLogContainerElement
            .querySelector("button[data-page='next']")
            ?.addEventListener('click', () => {
            currentOffset += pageLimit;
            fetchAuditLog();
        });
    }
    function fetchAuditLog() {
        const logDateFrom = document.querySelector('#filter--logDateFrom').value;
        const logDateTo = document.querySelector('#filter--logDateTo').value;
        const mainRecordType = document.querySelector('#filter--mainRecordType').value;
        const updateUserName = document.querySelector('#filter--updateUserName').value;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doGetAuditLog`, {
            logDateFrom,
            logDateTo,
            mainRecordType,
            updateUserName,
            limit: pageLimit,
            offset: currentOffset
        }, renderAuditLog);
    }
    function filterAuditLog() {
        currentOffset = 0;
        fetchAuditLog();
    }
    function doPurge(age, ageLabel) {
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doPurgeAuditLog`, { age }, (responseJSON) => {
            if (responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: i18next.t('admin:auditLogPurge'),
                    message: i18next.t('admin:auditLogPurgeSuccess', {
                        age: ageLabel,
                        count: responseJSON.purgedCount
                    })
                });
                filterAuditLog();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: i18next.t('error'),
                    message: responseJSON.message
                });
            }
        });
    }
    filterFormElement.addEventListener('submit', (event) => {
        event.preventDefault();
        filterAuditLog();
    });
    filterFormElement.addEventListener('change', filterAuditLog);
    document
        .querySelector('#button--purgeAuditLog')
        ?.addEventListener('click', () => {
        let closeModalFunction;
        function doSubmitPurge(submitEvent) {
            submitEvent.preventDefault();
            const ageSelectElement = submitEvent.currentTarget.querySelector('#purge--age');
            const age = ageSelectElement.value;
            const ageLabel = ageSelectElement.options[ageSelectElement.selectedIndex].textContent;
            closeModalFunction?.();
            doPurge(age, ageLabel);
        }
        cityssm.openHtmlModal('adminAuditLog-purge', {
            onshow(modalElement) {
                sunrise.localize(modalElement);
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doSubmitPurge);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    if (i18next.isInitialized) {
        fetchAuditLog();
    }
    else {
        i18next.on('initialized', fetchAuditLog);
    }
})();
