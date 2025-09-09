"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        rowElement.innerHTML = `<th>${cityssm.escapeHTML(user.userName)}</th>
      <td class="has-text-centered">
        <button class="button is-small permission-toggle ${user.isActive ? activePermissionClass : inactivePermissionClass}"
          title="Toggle Active Status"
          data-permission="isActive" data-user-name="${cityssm.escapeHTML(user.userName)}">
          ${user.isActive ? 'Yes' : 'No'}
        </button>
      </td>
      <td class="has-text-centered">
        <button class="button is-small permission-toggle ${user.canUpdateCemeteries ? activePermissionClass : inactivePermissionClass}"
          title="Toggle Can Update Cemeteries"
          data-permission="canUpdateCemeteries" data-user-name="${cityssm.escapeHTML(user.userName)}">
          ${user.canUpdateCemeteries ? 'Yes' : 'No'}
        </button>
      </td>
      <td class="has-text-centered">
        <button class="button is-small permission-toggle ${user.canUpdateContracts ? activePermissionClass : inactivePermissionClass}"
          title="Toggle Can Update Contracts"
          data-permission="canUpdateContracts" data-user-name="${cityssm.escapeHTML(user.userName)}">
          ${user.canUpdateContracts ? 'Yes' : 'No'}
        </button>
      </td>
      <td class="has-text-centered">
        <button class="button is-small permission-toggle ${user.canUpdateWorkOrders ? activePermissionClass : inactivePermissionClass}"
          title="Toggle Can Update Work Orders"
          data-permission="canUpdateWorkOrders" data-user-name="${cityssm.escapeHTML(user.userName)}">
          ${user.canUpdateWorkOrders ? 'Yes' : 'No'}
        </button>
      </td>
      <td class="has-text-centered">
        <button class="button is-small permission-toggle ${user.isAdmin ? activePermissionClass : inactivePermissionClass}"
          title="Toggle Is Admin"
          data-permission="isAdmin" data-user-name="${cityssm.escapeHTML(user.userName)}">
          ${user.isAdmin ? 'Yes' : 'No'}
        </button>
      </td>
      <td class="has-text-centered">
        <button class="button is-small is-danger delete-user" title="Delete User"
          data-user-name="${cityssm.escapeHTML(user.userName)}">
          Delete
        </button>
      </td>`;
        return rowElement;
    }
    function renderUsers(users) {
        if (users.length === 0) {
            usersContainerElement.innerHTML = '<p>No users found.</p>';
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = `<thead>
      <tr>
        <th>User Name</th>
        <th class="has-text-centered">Can Login</th>
        <th class="has-text-centered">Can Update<br /> Cemeteries</th>
        <th class="has-text-centered">Can Update<br /> Contracts</th>
        <th class="has-text-centered">Can Update<br /> Work Orders</th>
        <th class="has-text-centered">Is Admin</th>
        <th class="has-text-centered"></th>
      </tr>
      </thead>
      <tbody></tbody>`;
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
    renderUsers(exports.users ?? []);
})();
