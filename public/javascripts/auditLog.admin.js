(() => {
    const sunrise = exports.sunrise;
    const auditLogContainerElement = document.querySelector('#container--auditLog');
    const pageLimit = 50;
    let currentOffset = 0;
    function getUpdateTypeIcon(updateType) {
        switch (updateType) {
            case 'created': {
                return '<span class="icon has-text-success"><i class="fa-solid fa-plus"></i></span>';
            }
            case 'deleted': {
                return '<span class="icon has-text-danger"><i class="fa-solid fa-trash"></i></span>';
            }
            default: {
                return '<span class="icon has-text-warning"><i class="fa-solid fa-pen"></i></span>';
            }
        }
    }
    const maxValueLength = 100;
    function truncateValue(value) {
        if (value.length <= maxValueLength) {
            return value;
        }
        return value.slice(0, maxValueLength) + '\u2026';
    }
    function buildValueCell(rawValue) {
        if (rawValue === null || rawValue === 'null') {
            return `<em class="has-text-grey">null</em>`;
        }
        const escaped = cityssm.escapeHTML(rawValue);
        if (rawValue.length <= maxValueLength) {
            return `<code>${escaped}</code>`;
        }
        const truncated = cityssm.escapeHTML(truncateValue(rawValue));
        return `<code title="${escaped}" style="cursor:help">${truncated}</code>`;
    }
    function renderAuditLog(responseJSON) {
        const { auditLogEntries, count, offset } = responseJSON;
        if (auditLogEntries.length === 0) {
            auditLogContainerElement.innerHTML = `<p class="has-text-grey">${cityssm.escapeHTML(i18next.t('admin:auditLogNoEntries'))}</p>`;
            return;
        }
        const rowsHtml = auditLogEntries
            .map((entry) => {
            const logDate = new Date(entry.logMillis);
            const dateString = logDate.toLocaleDateString();
            const timeString = logDate.toLocaleTimeString();
            return `<tr>
          <td>${getUpdateTypeIcon(entry.updateType)}</td>
          <td>${cityssm.escapeHTML(dateString)}</td>
          <td>${cityssm.escapeHTML(timeString)}</td>
          <td>${cityssm.escapeHTML(entry.mainRecordType)}</td>
          <td>${entry.mainRecordId.toString()}</td>
          <td>${cityssm.escapeHTML(entry.updateTable)}</td>
          <td>${cityssm.escapeHTML(entry.updateField)}</td>
          <td>${buildValueCell(entry.fromValue)}</td>
          <td>${buildValueCell(entry.toValue)}</td>
          <td>${cityssm.escapeHTML(entry.updateUserName)}</td>
        </tr>`;
        })
            .join('');
        // eslint-disable-next-line no-unsanitized/property
        auditLogContainerElement.innerHTML = `<div class="table-container">
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th></th>
            <th>${cityssm.escapeHTML(i18next.t('common:date'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('common:time'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:mainRecordType'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:auditLogRecordId'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:auditLogTable'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:auditLogField'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:auditLogFrom'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:auditLogTo'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:userName'))}</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
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
            currentOffset = currentOffset + pageLimit;
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
        const purgeAgeSelectHtml = `<div class="field">
        <label class="label">${cityssm.escapeHTML(i18next.t('admin:auditLogPurgeOlderThan'))}</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select id="purge--age">
              <option value="thirtyDays">${cityssm.escapeHTML(i18next.t('admin:auditLogPurgeThirtyDays'))}</option>
              <option value="ninetyDays">${cityssm.escapeHTML(i18next.t('admin:auditLogPurgeNinetyDays'))}</option>
              <option value="oneYear">${cityssm.escapeHTML(i18next.t('admin:auditLogPurgeOneYear'))}</option>
              <option value="all">${cityssm.escapeHTML(i18next.t('admin:auditLogPurgeEverything'))}</option>
            </select>
          </div>
        </div>
      </div>`;
        bulmaJS.confirm({
            contextualColorName: 'danger',
            title: i18next.t('admin:auditLogPurge'),
            message: purgeAgeSelectHtml,
            messageIsHtml: true,
            okButton: {
                contextualColorName: 'danger',
                text: i18next.t('common:delete'),
                callbackFunction() {
                    const ageSelectElement = document.querySelector('#purge--age');
                    const age = ageSelectElement?.value ?? 'thirtyDays';
                    const ageLabel = ageSelectElement?.options[ageSelectElement.selectedIndex]
                        .textContent ?? '';
                    doPurge(age, ageLabel);
                }
            }
        });
    });
})();
