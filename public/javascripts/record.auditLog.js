(() => {
    const sunrise = exports.sunrise;
    const pageLimit = 50;
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
    function renderRecordAuditLog(auditLogContainerElement, auditLogUrl, currentOffset, responseJSON) {
        if (!responseJSON.success) {
            auditLogContainerElement.innerHTML = `
        <p class="has-text-danger">
          ${cityssm.escapeHTML(responseJSON.message)}
        </p>
      `;
            return;
        }
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
            return `
          <tr class="${getUpdateTypeColorClass(entry.updateType)}">
            <td>
              ${cityssm.escapeHTML(dateString)}<br />
              <span class="is-size-7">${cityssm.escapeHTML(timeString)}</span>
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
            <td style="max-width:200px">${buildValueCell(entry.fromValue)}</td>
            <td style="max-width:200px">${buildValueCell(entry.toValue)}</td>
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
              <th>${cityssm.escapeHTML(i18next.t('common:time'))}</th>
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
            fetchRecordAuditLog(auditLogContainerElement, auditLogUrl, {
                mainRecordId: document.querySelector('#recordAuditLog--mainRecordId').value,
                mainRecordType: document.querySelector('#recordAuditLog--mainRecordType').value
            }, Math.max(currentOffset - pageLimit, 0));
        });
        auditLogContainerElement
            .querySelector("button[data-page='next']")
            ?.addEventListener('click', () => {
            fetchRecordAuditLog(auditLogContainerElement, auditLogUrl, {
                mainRecordId: document.querySelector('#recordAuditLog--mainRecordId').value,
                mainRecordType: document.querySelector('#recordAuditLog--mainRecordType').value
            }, currentOffset + pageLimit);
        });
    }
    function fetchRecordAuditLog(auditLogContainerElement, auditLogUrl, mainRecord, offset) {
        cityssm.postJSON(auditLogUrl, {
            mainRecordType: mainRecord.mainRecordType,
            mainRecordId: mainRecord.mainRecordId,
            limit: pageLimit,
            offset
        }, (responseJSON) => {
            renderRecordAuditLog(auditLogContainerElement, auditLogUrl, offset, responseJSON);
        });
    }
    function openRecordAuditLogModal(options) {
        cityssm.openHtmlModal('record-auditLog', {
            onshow(modalElement) {
                const typeInput = document.createElement('input');
                typeInput.type = 'hidden';
                typeInput.id = 'recordAuditLog--mainRecordType';
                typeInput.value = options.mainRecordType;
                modalElement.append(typeInput);
                const idInput = document.createElement('input');
                idInput.type = 'hidden';
                idInput.id = 'recordAuditLog--mainRecordId';
                idInput.value = options.mainRecordId;
                modalElement.append(idInput);
                const urlInput = document.createElement('input');
                urlInput.type = 'hidden';
                urlInput.id = 'recordAuditLog--auditLogUrl';
                urlInput.value = options.auditLogUrl;
                modalElement.append(urlInput);
                const createInfoElement = modalElement.querySelector('#recordAuditLog--createInfo');
                if (createInfoElement !== null) {
                    if (options.recordCreateUser && options.recordCreateMillis) {
                        const createDate = new Date(Number.parseInt(options.recordCreateMillis, 10));
                        createInfoElement.textContent = `${options.recordCreateUser} — ${createDate.toLocaleDateString()} ${createDate.toLocaleTimeString()}`;
                    }
                    else if (options.recordCreateUser) {
                        createInfoElement.textContent = options.recordCreateUser;
                    }
                    else {
                        createInfoElement.textContent = '—';
                    }
                }
                const updateInfoElement = modalElement.querySelector('#recordAuditLog--updateInfo');
                if (updateInfoElement !== null) {
                    if (options.recordUpdateUser && options.recordUpdateMillis) {
                        const updateDate = new Date(Number.parseInt(options.recordUpdateMillis, 10));
                        updateInfoElement.textContent = `${options.recordUpdateUser} — ${updateDate.toLocaleDateString()} ${updateDate.toLocaleTimeString()}`;
                    }
                    else if (options.recordUpdateUser) {
                        updateInfoElement.textContent = options.recordUpdateUser;
                    }
                    else {
                        updateInfoElement.textContent = '—';
                    }
                }
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                const auditLogContainerElement = modalElement.querySelector('#container--recordAuditLog');
                fetchRecordAuditLog(auditLogContainerElement, options.auditLogUrl, {
                    mainRecordId: options.mainRecordId,
                    mainRecordType: options.mainRecordType
                }, 0);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    const auditLogButtons = document.querySelectorAll('.is-view-audit-log-button');
    for (const button of auditLogButtons) {
        button.addEventListener('click', (clickEvent) => {
            clickEvent.preventDefault();
            const buttonElement = clickEvent.currentTarget;
            openRecordAuditLogModal({
                mainRecordId: buttonElement.dataset.mainRecordId ?? '',
                mainRecordType: buttonElement.dataset.mainRecordType ?? '',
                auditLogUrl: buttonElement.dataset.auditLogUrl ?? '',
                recordCreateMillis: buttonElement.dataset.recordCreateMillis,
                recordCreateUser: buttonElement.dataset.recordCreateUser,
                recordUpdateMillis: buttonElement.dataset.recordUpdateMillis,
                recordUpdateUser: buttonElement.dataset.recordUpdateUser
            });
        });
    }
})();
