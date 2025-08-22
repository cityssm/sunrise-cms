import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { DatabaseUser } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise
  users?: DatabaseUser[]
}
;(() => {
  const sunrise = exports.sunrise

  const usersContainerElement = document.querySelector(
    '#container--users'
  ) as HTMLElement

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
        <th>Can Login</th>
        <th>Can Update Cemeteries</th>
        <th>Can Update Contracts</th>
        <th>Can Update Work Orders</th>
        <th>Is Admin</th>
        <th></th>
      </tr>
      </thead>
      <tbody></tbody>`

    for (const user of users) {
      const rowElement = document.createElement('tr')
      rowElement.dataset.userName = user.userName

      // eslint-disable-next-line no-unsanitized/property
      rowElement.innerHTML = `
        <td>${cityssm.escapeHTML(user.userName)}</td>
        <td>
          <button class="button is-small permission-toggle ${user.isActive ? 'is-success' : 'is-light'}" 
                  data-permission="isActive" data-user-name="${cityssm.escapeHTML(user.userName)}">
            ${user.isActive ? 'Yes' : 'No'}
          </button>
        </td>
        <td>
          <button class="button is-small permission-toggle ${user.canUpdateCemeteries ? 'is-success' : 'is-light'}" 
                  data-permission="canUpdateCemeteries" data-user-name="${cityssm.escapeHTML(user.userName)}">
            ${user.canUpdateCemeteries ? 'Yes' : 'No'}
          </button>
        </td>
        <td>
          <button class="button is-small permission-toggle ${user.canUpdateContracts ? 'is-success' : 'is-light'}" 
                  data-permission="canUpdateContracts" data-user-name="${cityssm.escapeHTML(user.userName)}">
            ${user.canUpdateContracts ? 'Yes' : 'No'}
          </button>
        </td>
        <td>
          <button class="button is-small permission-toggle ${user.canUpdateWorkOrders ? 'is-success' : 'is-light'}" 
                  data-permission="canUpdateWorkOrders" data-user-name="${cityssm.escapeHTML(user.userName)}">
            ${user.canUpdateWorkOrders ? 'Yes' : 'No'}
          </button>
        </td>
        <td>
          <button class="button is-small permission-toggle ${user.isAdmin ? 'is-success' : 'is-light'}" 
                  data-permission="isAdmin" data-user-name="${cityssm.escapeHTML(user.userName)}">
            ${user.isAdmin ? 'Yes' : 'No'}
          </button>
        </td>
        <td>
          <button class="button is-small is-danger delete-user" data-user-name="${cityssm.escapeHTML(user.userName)}">Delete</button>
        </td>
      `

      tableElement.querySelector('tbody')?.append(rowElement)
    }

    // Add event listeners for permission toggles
    tableElement.querySelectorAll('.permission-toggle').forEach(button => {
      button.addEventListener('click', function(this: HTMLButtonElement) {
        const userName = this.dataset.userName
        const permission = this.dataset.permission

        if (!userName || !permission) return

        cityssm.postJSON(
          `${sunrise.urlPrefix}/admin/doToggleUserPermission`,
          {
            userName,
            permissionField: permission
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              users: DatabaseUser[]
              message?: string
            }

            if (responseJSON.success) {
              renderUsers(responseJSON.users)
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error Updating Permission',
                message: responseJSON.message || 'Please try again.'
              })
            }
          }
        )
      })
    })

    // Add event listeners for delete buttons
    tableElement.querySelectorAll('.delete-user').forEach(button => {
      button.addEventListener('click', function(this: HTMLButtonElement) {
        const userName = this.dataset.userName

        if (!userName) return

        bulmaJS.confirm({
          title: 'Delete User',
          message: `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
          contextualColorName: 'danger',
          okButton: {
            text: 'Delete User',
            contextualColorName: 'danger'
          },
          cancelButton: {
            text: 'Cancel'
          }
        }, () => {
          cityssm.postJSON(
            `${sunrise.urlPrefix}/admin/doDeleteUser`,
            {
              userId: userName  // Note: the backend expects userId but uses it as userName
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                users?: DatabaseUser[]
                message?: string
              }

              if (responseJSON.success) {
                // Update the users list with the new data from the server
                if (responseJSON.users) {
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
                  message: responseJSON.message || 'Please try again.'
                })
              }
            }
          )
        })
      })
    })

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

  renderUsers(exports.users ?? [])
})()
