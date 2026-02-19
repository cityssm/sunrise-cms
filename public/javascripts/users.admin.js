(() => {
    const sunrise = exports.sunrise;
    const usersContainerElement = document.querySelector('#container--users');
    function deleteUser(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const userName = buttonElement.dataset.userName;
        if (userName === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete User',
            message: `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete User',
                callbackFunction() {
                    cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteUser`, {
                        userName
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            // Update the users list with the new data from the server
                            if (responseJSON.users !== undefined) {
                                renderUsers(responseJSON.users);
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'User Deleted',
                                message: 'User has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting User',
                                message: responseJSON.message ?? 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function toggleUserPermission(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const userName = buttonElement.dataset.userName;
        const permission = buttonElement.dataset.permission;
        if (userName === undefined || permission === undefined) {
            return;
        }
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doToggleUserPermission`, {
            permissionField: permission,
            userName
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                renderUsers(responseJSON.users);
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Updating Permission',
                    message: responseJSON.message ?? 'Please try again.'
                });
            }
        });
    }
    const activePermissionClass = 'is-success';
    const inactivePermissionClass = 'is-light';
    function buildUserRowElement(user) {
        const rowElement = document.createElement('tr');
        rowElement.dataset.userName = user.userName;
        // eslint-disable-next-line no-unsanitized/property
        rowElement.innerHTML = /* html */ `
      <th>${cityssm.escapeHTML(user.userName)}</th>
      <td class="has-text-centered">
        <button
          class="button is-small permission-toggle ${user.isActive ? activePermissionClass : inactivePermissionClass}"
          data-permission="isActive"
          data-user-name="${cityssm.escapeHTML(user.userName)}"
          title="Toggle Active Status"
        >
          ${cityssm.escapeHTML(user.isActive ? i18next.t('common:yes') : i18next.t('common:no'))}
        </button>
      </td>
      <td class="has-text-centered">
        <button
          class="button is-small permission-toggle ${user.canUpdateCemeteries ? activePermissionClass : inactivePermissionClass}"
          data-permission="canUpdateCemeteries"
          data-user-name="${cityssm.escapeHTML(user.userName)}"
          title="Toggle Can Update Cemeteries"
        >
          ${cityssm.escapeHTML(user.canUpdateCemeteries ? i18next.t('common:yes') : i18next.t('common:no'))}
        </button>
      </td>
      <td class="has-text-centered">
        <button
          class="button is-small permission-toggle ${user.canUpdateContracts ? activePermissionClass : inactivePermissionClass}"
          data-permission="canUpdateContracts"
          data-user-name="${cityssm.escapeHTML(user.userName)}"
          title="Toggle Can Update Contracts"
        >
          ${cityssm.escapeHTML(user.canUpdateContracts ? i18next.t('common:yes') : i18next.t('common:no'))}
        </button>
      </td>
      <td class="has-text-centered">
        <button
          class="button is-small permission-toggle ${user.canUpdateWorkOrders ? activePermissionClass : inactivePermissionClass}"
          data-permission="canUpdateWorkOrders"
          data-user-name="${cityssm.escapeHTML(user.userName)}"
          title="Toggle Can Update Work Orders"
        >
          ${cityssm.escapeHTML(user.canUpdateWorkOrders ? i18next.t('common:yes') : i18next.t('common:no'))}
        </button>
      </td>
      <td class="has-text-centered">
        <button
          class="button is-small permission-toggle ${user.isAdmin ? activePermissionClass : inactivePermissionClass}"
          data-permission="isAdmin"
          data-user-name="${cityssm.escapeHTML(user.userName)}"
          title="Toggle Is Admin"
        >
          ${cityssm.escapeHTML(user.isAdmin ? i18next.t('common:yes') : i18next.t('common:no'))}
        </button>
      </td>
      <td class="has-text-centered">
        <button
          class="button is-small is-danger delete-user"
          data-user-name="${cityssm.escapeHTML(user.userName)}"
          title="${cityssm.escapeHTML(i18next.t('admin:deleteUser'))}"
        >
          ${cityssm.escapeHTML(i18next.t('common:delete'))}
        </button>
      </td>
    `;
        return rowElement;
    }
    function renderUsers(users) {
        if (users.length === 0) {
            usersContainerElement.innerHTML = '<p>No users found.</p>';
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>${cityssm.escapeHTML(i18next.t('admin:userName'))}</th>
          <th class="has-text-centered">${cityssm.escapeHTML(i18next.t('admin:canLogin'))}</th>
          <th class="has-text-centered">${cityssm.escapeHTML(i18next.t('admin:canUpdateCemeteries'))}</th>
          <th class="has-text-centered">${cityssm.escapeHTML(i18next.t('admin:canUpdateContracts'))}</th>
          <th class="has-text-centered">${cityssm.escapeHTML(i18next.t('admin:canUpdateWorkOrders'))}</th>
          <th class="has-text-centered">${cityssm.escapeHTML(i18next.t('admin:isAdmin'))}</th>
          <th class="has-text-centered">
            <span class="is-sr-only">${cityssm.escapeHTML(i18next.t('admin:deleteUser'))}</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        for (const user of users) {
            const rowElement = buildUserRowElement(user);
            tableElement.querySelector('tbody')?.append(rowElement);
        }
        // Add event listeners for permission toggles
        for (const button of tableElement.querySelectorAll('.permission-toggle')) {
            button.addEventListener('click', toggleUserPermission);
        }
        // Add event listeners for delete buttons
        for (const button of tableElement.querySelectorAll('.delete-user')) {
            button.addEventListener('click', deleteUser);
        }
        usersContainerElement.replaceChildren(tableElement);
    }
    document.querySelector('#button--addUser')?.addEventListener('click', () => {
        let closeModalFunction;
        function doAddUser(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddUser`, addForm, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    renderUsers(responseJSON.users);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding User',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminUsers-add', {
            onshow(modalElement) {
                sunrise.localize(modalElement);
                modalElement.querySelector('#span--domain').textContent = `${exports.domain}\\`;
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddUser);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    i18next.on('initialized', () => {
        renderUsers(exports.users);
    });
})();
