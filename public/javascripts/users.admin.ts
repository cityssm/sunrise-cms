import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DatabaseUser } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise

  domain: string
  users: DatabaseUser[]
}
;(() => {
  const sunrise = exports.sunrise

  const usersContainerElement = document.querySelector(
    '#container--users'
  ) as HTMLElement

  function deleteUser(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const userName = buttonElement.dataset.userName

    if (userName === undefined) {
      return
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete User',

      message: `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,

      okButton: {
        contextualColorName: 'warning',
        text: 'Delete User',

        callbackFunction() {
          cityssm.postJSON(
            `${sunrise.urlPrefix}/admin/doDeleteUser`,
            {
              userName
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                message?: string
                success: boolean

                users?: DatabaseUser[]
              }

              if (responseJSON.success) {
                // Update the users list with the new data from the server
                if (responseJSON.users !== undefined) {
                  renderUsers(responseJSON.users)
                }

                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'User Deleted',

                  message: 'User has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting User',

                  message: responseJSON.message ?? 'Please try again.'
                })
              }
            }
          )
        }
      }
    })
  }

  function toggleUserPermission(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const userName = buttonElement.dataset.userName
    const permission = buttonElement.dataset.permission

    if (userName === undefined || permission === undefined) {
      return
    }

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doToggleUserPermission`,
      {
        permissionField: permission,
        userName
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          message?: string
          success: boolean

          users: DatabaseUser[]
        }

        if (responseJSON.success) {
          renderUsers(responseJSON.users)
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Updating Permission',

            message: responseJSON.message ?? 'Please try again.'
          })
        }
      }
    )
  }

  const activePermissionClass = 'is-success'
  const inactivePermissionClass = 'is-light'

  function buildUserRowElement(user: DatabaseUser): HTMLTableRowElement {
    const rowElement = document.createElement('tr')
    rowElement.dataset.userName = user.userName

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
      </td>`

    return rowElement
  }

  function renderUsers(users: DatabaseUser[]): void {
    if (users.length === 0) {
      usersContainerElement.innerHTML = '<p>No users found.</p>'
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'

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
      <tbody></tbody>`

    for (const user of users) {
      const rowElement = buildUserRowElement(user)
      tableElement.querySelector('tbody')?.append(rowElement)
    }

    // Add event listeners for permission toggles
    for (const button of tableElement.querySelectorAll('.permission-toggle')) {
      button.addEventListener('click', toggleUserPermission)
    }

    // Add event listeners for delete buttons
    for (const button of tableElement.querySelectorAll('.delete-user')) {
      button.addEventListener('click', deleteUser)
    }

    usersContainerElement.replaceChildren(tableElement)
  }

  document.querySelector('#button--addUser')?.addEventListener('click', () => {
    let closeModalFunction: () => void

    function doAddUser(submitEvent: Event): void {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${sunrise.urlPrefix}/admin/doAddUser`,
        addForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean

            users: DatabaseUser[]
          }

          if (responseJSON.success) {
            closeModalFunction()
            renderUsers(responseJSON.users)
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding User',

              message: 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminUsers-add', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector('#span--domain') as HTMLSpanElement
        ).textContent = `${exports.domain}\\`
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddUser)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  })

  renderUsers(exports.users)
})()
