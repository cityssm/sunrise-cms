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

interface ConfigUserPermissions {
  canLogin?: string[]
  canUpdate?: string[]
  canUpdateCemeteries?: string[]
  canUpdateContracts?: string[]
  canUpdateWorkOrders?: string[]
  isAdmin?: string[]
}

declare const exports: {
  sunrise: Sunrise

  configUsers?: ConfigUserPermissions
  domain: string
  users: DatabaseUser[]
}

{
  const sunrise = exports.sunrise

  const usersContainerSelector = '#container--users'
  const configUsersContainerSelector = '#container--configUsers'

  const usersContainerElement = document.querySelector(
    usersContainerSelector
  ) as HTMLElement

  const configUsersContainerElement = document.querySelector(
    configUsersContainerSelector
  ) as HTMLElement | null

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
            ${cityssm.escapeHTML(i18next.t(user.isActive ? 'yes' : 'no'))}
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
            ${cityssm.escapeHTML(i18next.t(user.canUpdateCemeteries ? 'yes' : 'no'))}
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
            ${cityssm.escapeHTML(i18next.t(user.canUpdateContracts ? 'yes' : 'no'))}
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
            ${cityssm.escapeHTML(i18next.t(user.canUpdateWorkOrders ? 'yes' : 'no'))}
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
            ${cityssm.escapeHTML(i18next.t(user.isAdmin ? 'yes' : 'no'))}
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

  function buildConfigUserRowElement(
    username: string,
    configUserPermissions: ConfigUserPermissions
  ): HTMLTableRowElement {
    const rowElement = document.createElement('tr')

    rowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <th class="is-vcentered">${cityssm.escapeHTML(username)}</th>
      `
    )

    const permissionDefinitions = [
      ['canLogin', configUserPermissions.canLogin ?? []],
      ['canUpdate', configUserPermissions.canUpdate ?? []],
      ['canUpdateCemeteries', configUserPermissions.canUpdateCemeteries ?? []],
      ['canUpdateContracts', configUserPermissions.canUpdateContracts ?? []],
      ['canUpdateWorkOrders', configUserPermissions.canUpdateWorkOrders ?? []],
      ['isAdmin', configUserPermissions.isAdmin ?? []]
    ] as const

    for (const [, permissionNames] of permissionDefinitions) {
      const hasPermission = permissionNames.some(
        (currentUsername) => currentUsername.toLowerCase() === username.toLowerCase()
      )

      rowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td class="has-text-centered">
            <span class="tag ${hasPermission ? 'is-success' : 'is-light'}">
              ${cityssm.escapeHTML(i18next.t(hasPermission ? 'yes' : 'no'))}
            </span>
          </td>
        `
      )
    }

    return rowElement
  }

  function renderConfigUsers(): void {
    if (configUsersContainerElement === null) {
      return
    }

    const configUserNames = [
      ...(exports.configUsers?.canLogin ?? []),
      ...(exports.configUsers?.canUpdate ?? []),
      ...(exports.configUsers?.canUpdateCemeteries ?? []),
      ...(exports.configUsers?.canUpdateContracts ?? []),
      ...(exports.configUsers?.canUpdateWorkOrders ?? []),
      ...(exports.configUsers?.isAdmin ?? [])
    ]

    const uniqueConfigUserNames = [
      ...new Set(configUserNames.map((username) => username.toLowerCase()))
    ].toSorted((left, right) => left.localeCompare(right))

    if (uniqueConfigUserNames.length === 0) {
      configUsersContainerElement.innerHTML = '<p>No config users found.</p>'
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'

    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>${cityssm.escapeHTML(i18next.t('admin:username'))}</th>
          <th class="has-text-centered">${cityssm.escapeHTML(i18next.t('admin:canLogin'))}</th>
          <th class="has-text-centered">${cityssm.escapeHTML(i18next.t('admin:canUpdate'))}</th>
          <th class="has-text-centered">${cityssm.escapeHTML(i18next.t('admin:canUpdateCemeteries'))}</th>
          <th class="has-text-centered">${cityssm.escapeHTML(i18next.t('admin:canUpdateContracts'))}</th>
          <th class="has-text-centered">${cityssm.escapeHTML(i18next.t('admin:canUpdateWorkOrders'))}</th>
          <th class="has-text-centered">${cityssm.escapeHTML(i18next.t('admin:isAdmin'))}</th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    for (const username of uniqueConfigUserNames) {
      const rowElement = buildConfigUserRowElement(username, exports.configUsers ?? {})
      tableElement.querySelector('tbody')?.append(rowElement)
    }

    configUsersContainerElement.replaceChildren(tableElement)
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

  const menuTabElements = document.querySelectorAll(
    '.tabs a[href^="#tab--"]'
  ) as NodeListOf<HTMLAnchorElement>
  const tabContainerElements = document.querySelectorAll(
    '.tab-container > div'
  ) as NodeListOf<HTMLElement>

  function selectTab(clickEvent: Event): void {
    clickEvent.preventDefault()

    for (const menuTabElement of menuTabElements) {
      menuTabElement.parentElement?.classList.remove('is-active')
    }

    const selectedTabElement = clickEvent.currentTarget as HTMLAnchorElement
    selectedTabElement.parentElement?.classList.add('is-active')

    const selectedTabContainerId = selectedTabElement.href.slice(
      Math.max(0, selectedTabElement.href.indexOf('#') + 1)
    )

    for (const tabContainerElement of tabContainerElements) {
      tabContainerElement.classList.toggle(
        'is-hidden',
        tabContainerElement.id !== selectedTabContainerId
      )
    }
  }

  for (const menuTabElement of menuTabElements) {
    menuTabElement.addEventListener('click', selectTab)
  }

  if (i18next.isInitialized) {
    renderUsers(exports.users)
    renderConfigUsers()
  } else {
    i18next.on('initialized', () => {
      renderUsers(exports.users)
      renderConfigUsers()
    })
  }
}
