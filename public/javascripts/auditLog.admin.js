(() => {
    const sunrise = exports.sunrise;
    const auditLogContainerElement = document.querySelector('#container--auditLog');
    const pageLimit = 50;
    let currentOffset = 0;
    function getUpdateTypeIcon(updateType) {
        switch (updateType) {
            case 'created': {
                return `<span class="icon has-text-success" title="${cityssm.escapeHTML(i18next.t('admin:auditLogUpdateTypeCreated'))}"><i class="fa-solid fa-plus"></i></span>`;
            }
            case 'deleted': {
                return `<span class="icon has-text-danger" title="${cityssm.escapeHTML(i18next.t('admin:auditLogUpdateTypeDeleted'))}"><i class="fa-solid fa-trash"></i></span>`;
            }
            default: {
                return `<span class="icon has-text-warning" title="${cityssm.escapeHTML(i18next.t('admin:auditLogUpdateTypeUpdated'))}"><i class="fa-solid fa-pen"></i></span>`;
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
            return /* html */ `<em class="has-text-grey">null</em>`;
        }
        const escaped = cityssm.escapeHTML(rawValue);
        if (rawValue.length <= maxValueLength) {
            return /* html */ `<code style="word-break:break-all">${escaped}</code>`;
        }
        const truncated = cityssm.escapeHTML(truncateValue(rawValue));
        return /* html */ `<code title="${escaped}" style="cursor:help;word-break:break-all">${truncated}</code>`;
    }
    function renderAuditLog(responseJSON) {
        const { auditLogEntries, count, offset } = responseJSON;
        if (auditLogEntries.length === 0) {
            auditLogContainerElement.innerHTML = /* html */ `<p class="has-text-grey">${cityssm.escapeHTML(i18next.t('admin:auditLogNoEntries'))}</p>`;
            return;
        }
        const rowsHtml = auditLogEntries
            .map((entry) => {
            const logDate = new Date(entry.logMillis);
            const dateString = logDate.toLocaleDateString();
            const timeString = logDate.toLocaleTimeString();
            return /* html */ `
          <tr>
            <td>
              ${cityssm.escapeHTML(dateString)}<br />
              <span class="is-size-7">${cityssm.escapeHTML(timeString)}</span>
            </td>
            <td>
              ${cityssm.escapeHTML(entry.mainRecordType)}<br />
              <span class="is-size-7">${entry.mainRecordId.toString()}</span>
            </td>
            <td>
              ${cityssm.escapeHTML(entry.updateTable)}<br />
              <span class="is-size-7">${cityssm.escapeHTML(entry.updateField)}</span>
            </td>
            <td>${getUpdateTypeIcon(entry.updateType)}</td>
            <td style="max-width:200px">${buildValueCell(entry.fromValue)}</td>
            <td style="max-width:200px">${buildValueCell(entry.toValue)}</td>
            <td class="is-nowrap">
              ${cityssm.escapeHTML(entry.updateUserName)}
            </td>
          </tr>
        `;
        })
            .join('');
        // eslint-disable-next-line no-unsanitized/property
        auditLogContainerElement.innerHTML = /* html */ `
      <div class="table-container">
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>${cityssm.escapeHTML(i18next.t('common:time'))}</th>
              <th>${cityssm.escapeHTML(i18next.t('admin:mainRecordType'))}</th>
              <th>
                ${cityssm.escapeHTML(i18next.t('admin:auditLogTable'))}
                /
                ${cityssm.escapeHTML(i18next.t('admin:auditLogField'))}</th>
              <th></th>
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
                        count: responseJSON.purgedCount,
                        age: ageLabel
                    })
                });
                filterAuditLog();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: i18next.t('common:error'),
                    message: responseJSON.message
                });
            }
        });
    }
    document
        .querySelector('#button--filterAuditLog')
        ?.addEventListener('click', filterAuditLog);
    document
        .querySelector('#button--purgeAuditLog')
        ?.addEventListener('click', () => {
        let closeModalFunction = () => {};
        function doSubmitPurge(submitEvent) {
            submitEvent.preventDefault();
            const ageSelectElement = submitEvent.currentTarget.querySelector('#purge--age');
            const age = ageSelectElement.value;
            const ageLabel = ageSelectElement.options[ageSelectElement.selectedIndex].textContent ?? '';
            closeModalFunction();
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
    i18next.on('initialized', fetchAuditLog);
})();
