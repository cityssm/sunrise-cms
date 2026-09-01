/* eslint-disable runtime-cleanup/no-unmanaged-event-listeners */
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { CityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { i18n } from 'i18next'

import type { DoAddUserResponse } from '../../handlers/adminPost/doAddUser.js'
import type { DoDeleteUserResponse } from '../../handlers/adminPost/doDeleteUser.js'
import type { DoToggleUserPermissionResponse } from '../../handlers/adminPost/doToggleUserPermission.js'
import type { DatabaseUser } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: CityssmGlobal
declare const bulmaJS: BulmaJS
declare const i18next: i18n

declare const exports: {
  sunrise: Sunrise

  domain: string
  users: DatabaseUser[]
}

{
  const sunrise = exports.sunrise

  const usersContainerElement = document.querySelector(
    '#container--users'
  ) as HTMLElement

  function deleteUser(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const username = buttonElement.dataset.username

    if (username === undefined) {
      return
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: i18next.t('admin:deleteUser'),

      message: i18next.t('admin:deleteUserConfirmation', { username }),

      okButton: {
        contextualColorName: 'warning',
        text: i18next.t('delete'),

        callbackFunction() {
          cityssm.postJSON(
            `${sunrise.urlPrefix}/admin/doDeleteUser`,
            {
              username
            },
            (responseJSON: DoDeleteUserResponse) => {
              if (responseJSON.success) {
                // Update the users list with the new data from the server
                renderUsers(responseJSON.users)

                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: i18next.t('admin:userDeletedMessage', { username })
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: i18next.t('error'),

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
    const username = buttonElement.dataset.username
    const permission = buttonElement.dataset.permission

    if (username === undefined || permission === undefined) {
      return
    }

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doToggleUserPermission`,
      {
        permissionField: permission,
        username
      },
      (responseJSON: DoToggleUserPermissionResponse) => {
        if (responseJSON.success) {
          renderUsers(responseJSON.users)
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: i18next.t('error'),

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
    rowElement.dataset.username = user.username

    rowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <th class="is-vcentered">${cityssm.escapeHTML(user.username)}</th>
      `
    )

    // eslint-disable-next-line browser-security/no-innerhtml
    rowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td class="has-text-centered">
          <button
            class="button is-small permission-toggle ${user.isActive ? activePermissionClass : inactivePermissionClass}"
            data-permission="isActive"
            data-username="${cityssm.escapeHTML(user.username)}"
            type="button"
            title="Toggle Active Status"
          >
            ${cityssm.escapeHTML(user.isActive ? i18next.t('yes') : i18next.t('no'))}
          </button>
        </td>
      `
    )

    // eslint-disable-next-line browser-security/no-innerhtml
    rowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td class="has-text-centered">
          <button
            class="button is-small permission-toggle ${user.canUpdateCemeteries ? activePermissionClass : inactivePermissionClass}"
            data-permission="canUpdateCemeteries"
            data-username="${cityssm.escapeHTML(user.username)}"
            type="button"
            title="Toggle Can Update Cemeteries"
          >
            ${cityssm.escapeHTML(user.canUpdateCemeteries ? i18next.t('yes') : i18next.t('no'))}
          </button>
        </td>
      `
    )

    // eslint-disable-next-line browser-security/no-innerhtml
    rowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td class="has-text-centered">
          <button
            class="button is-small permission-toggle ${user.canUpdateContracts ? activePermissionClass : inactivePermissionClass}"
            data-permission="canUpdateContracts"
            data-username="${cityssm.escapeHTML(user.username)}"
            type="button"
            title="Toggle Can Update Contracts"
          >
            ${cityssm.escapeHTML(user.canUpdateContracts ? i18next.t('yes') : i18next.t('no'))}
          </button>
        </td>
      `
    )

    // eslint-disable-next-line browser-security/no-innerhtml
    rowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td class="has-text-centered">
          <button
            class="button is-small permission-toggle ${user.canUpdateWorkOrders ? activePermissionClass : inactivePermissionClass}"
            data-permission="canUpdateWorkOrders"
            data-username="${cityssm.escapeHTML(user.username)}"
            type="button"
            title="Toggle Can Update Work Orders"
          >
            ${cityssm.escapeHTML(user.canUpdateWorkOrders ? i18next.t('yes') : i18next.t('no'))}
          </button>
        </td>
      `
    )

    // eslint-disable-next-line browser-security/no-innerhtml
    rowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td class="has-text-centered">
          <button
            class="button is-small permission-toggle ${user.isAdmin ? activePermissionClass : inactivePermissionClass}"
            data-permission="isAdmin"
            data-username="${cityssm.escapeHTML(user.username)}"
            type="button"
            title="Toggle Is Admin"
          >
            ${cityssm.escapeHTML(user.isAdmin ? i18next.t('yes') : i18next.t('no'))}
          </button>
        </td>
      `
    )

    rowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td class="has-text-centered">
          <button
            class="button is-small is-light is-danger delete-user"
            data-username="${cityssm.escapeHTML(user.username)}"
            type="button"
            title="${cityssm.escapeHTML(i18next.t('admin:deleteUser'))}"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </span>
          </button>
        </td>
      `
    )

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
          <th>${cityssm.escapeHTML(i18next.t('admin:username'))}</th>
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

      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${sunrise.urlPrefix}/admin/doAddUser`,
        formElement,
        (responseJSON: DoAddUserResponse) => {
          if (responseJSON.success) {
            closeModalFunction()
            renderUsers(responseJSON.users)
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: `${i18next.t('error')}: ${i18next.t('admin:addUser')}`,

              message: i18next.t('tryAgain')
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

        const usernameInputElement = modalElement.querySelector(
          '#username'
        ) as HTMLInputElement

        usernameInputElement.focus()
        usernameInputElement.value = ''

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddUser)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  })

  if (i18next.isInitialized) {
    renderUsers(exports.users)
  } else {
    i18next.on('initialized', () => {
      renderUsers(exports.users)
    })
  }
}
