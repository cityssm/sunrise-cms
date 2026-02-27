import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { i18n } from 'i18next'

import type { DoAddUserResponse } from '../../handlers/admin-post/doAddUser.js'
import type { DoDeleteUserResponse } from '../../handlers/admin-post/doDeleteUser.js'
import type { DoToggleUserPermissionResponse } from '../../handlers/admin-post/doToggleUserPermission.js'
import type { DatabaseUser } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const i18next: i18n

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
      title: i18next.t('admin:deleteUser'),

      message: i18next.t('admin:deleteUserConfirmation', { userName }),

      okButton: {
        contextualColorName: 'warning',
        text: i18next.t('common:delete'),

        callbackFunction() {
          cityssm.postJSON(
            `${sunrise.urlPrefix}/admin/doDeleteUser`,
            {
              userName
            },
            (responseJSON: DoDeleteUserResponse) => {
              if (responseJSON.success) {
                // Update the users list with the new data from the server
                renderUsers(responseJSON.users)

                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: i18next.t('admin:userDeletedMessage', { userName })
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: i18next.t('common:error'),

                  message: responseJSON.message
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
      (responseJSON: DoToggleUserPermissionResponse) => {
        if (responseJSON.success) {
          renderUsers(responseJSON.users)
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: i18next.t('common:error'),

            message: responseJSON.message
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
    `

    return rowElement
  }

  function renderUsers(users: DatabaseUser[]): void {
    if (users.length === 0) {
      usersContainerElement.innerHTML = '<p>No users found.</p>'
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'

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
    `

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
        (responseJSON: DoAddUserResponse) => {
          if (responseJSON.success) {
            closeModalFunction()
            renderUsers(responseJSON.users)
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding User',

              message: i18next.t('common:tryAgain')
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminUsers-add', {
      onshow(modalElement) {
        sunrise.localize(modalElement)
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

  i18next.on('initialized', () => {
    renderUsers(exports.users)
  })
})()
