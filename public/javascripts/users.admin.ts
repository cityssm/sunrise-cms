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
        <td>${user.isActive ? 'Yes' : 'No'}</td>
        <td>${user.canUpdateCemeteries ? 'Yes' : 'No'}</td>
        <td>${user.canUpdateContracts ? 'Yes' : 'No'}</td>
        <td>${user.canUpdateWorkOrders ? 'Yes' : 'No'}</td>
        <td>${user.isAdmin ? 'Yes' : 'No'}</td>
        <td>
          <button class="button is-small is-danger">Delete</button>
        </td>
      `

      tableElement.querySelector('tbody')?.append(rowElement)
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
