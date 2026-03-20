import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { i18n } from 'i18next'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const i18next: i18n

  /*
   * LOGOUT MODAL
   */
;(() => {
  function doLogout(): void {
    const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''

    globalThis.localStorage.clear()
    globalThis.location.href = `${urlPrefix}/logout`
  }

  document
    .querySelector('#cityssm-theme--logout-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: i18next.t('login:logout'),

        message: i18next.t('login:logoutConfirm'),

        okButton: {
          callbackFunction: doLogout,
          text: i18next.t('login:logout')
        }
      })
    })
})()

/*
 * KEEP ALIVE
 */
;(() => {
  const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''

  const keepAliveMillis =
    document.querySelector('main')?.dataset.sessionKeepAliveMillis

  let keepAliveInterval: NodeJS.Timeout | undefined

  function doKeepAlive(): void {
    cityssm.postJSON(
      `${urlPrefix}/keepAlive`,
      {
        t: Date.now()
      },
      (rawResponseJson: unknown) => {
        const responseJson = rawResponseJson as {
          activeSession: boolean
        }

        if (!responseJson.activeSession) {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Session Expired',

            message: 'Your session has expired. Please log in again.',

            okButton: {
              callbackFunction: () => {
                globalThis.location.reload()
              },
              text: 'Refresh Page'
            }
          })

          globalThis.clearInterval(keepAliveInterval)
        }
      }
    )
  }

  if (keepAliveMillis !== undefined && keepAliveMillis !== '0') {
    keepAliveInterval = globalThis.setInterval(
      doKeepAlive,
      Number.parseInt(keepAliveMillis, 10)
    )
  }
})()

/*
 * QUICK SEARCH
 */
;(() => {
  const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''

  function doContractQuickSearch(formEvent: Event): void {
    formEvent.preventDefault()

    const contractField = (
      document.querySelector(
        '#quickSearchContract--searchField'
      ) as HTMLSelectElement
    ).value

    const searchValue = (
      document.querySelector(
        '#quickSearchContract--searchValue'
      ) as HTMLInputElement
    ).value

    if (contractField === 'deceasedName') {
      globalThis.location.href = `${urlPrefix}/contracts/?deceasedName=${encodeURIComponent(searchValue)}`
    } else if (contractField === 'contractNumber') {
      globalThis.location.href = `${urlPrefix}/contracts/?contractNumber=${encodeURIComponent(searchValue)}`
    } else {
      bulmaJS.alert({
        contextualColorName: 'danger',
        title: 'Invalid Search',

        message: 'Please enter a valid search value.'
      })
    }
  }

  function doWorkOrderQuickSearch(formEvent: Event): void {
    formEvent.preventDefault()

    const workOrderNumber = (
      document.querySelector(
        '#quickSearchWorkOrder--workOrderNumber'
      ) as HTMLInputElement
    ).value

    globalThis.location.href = `${urlPrefix}/workOrders/byWorkOrderNumber/${encodeURIComponent(workOrderNumber)}`
  }

  document
    .querySelector('#navbar--quickSearch')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      cityssm.openHtmlModal('quickSearch', {
        onshow(modalElement) {
          ;(
            modalElement.querySelector(
              '#quickSearch--contractsLink'
            ) as HTMLAnchorElement
          ).href = `${urlPrefix}/contracts`
          ;(
            modalElement.querySelector(
              '#quickSearch--workOrdersLink'
            ) as HTMLAnchorElement
          ).href = `${urlPrefix}/workOrders`
        },
        onshown(modalElement) {
          bulmaJS.toggleHtmlClipped()

          modalElement.querySelector('input')?.focus()

          modalElement
            .querySelector('#form--quickSearchContract')
            ?.addEventListener('submit', doContractQuickSearch)

          modalElement
            .querySelector('#form--quickSearchWorkOrder')
            ?.addEventListener('submit', doWorkOrderQuickSearch)
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })
})()

/*
 * HTML-ESLINT HELPERS
 */
;(() => {
  /*
   * Data Setters
   */

  // SELECTs WITH data-value ATTRIBUTE
  for (const selectElement of document.querySelectorAll(
    'select[data-value]'
  ) as NodeListOf<HTMLSelectElement>) {
    const dataValue = selectElement.dataset.value

    if (dataValue !== undefined) {
      for (const optionElement of selectElement.options) {
        if (optionElement.value === dataValue) {
          optionElement.selected = true
          break
        }
      }
    }
  }

  // OPTIONs WITH data-selected ATTRIBUTE
  for (const optionElement of document.querySelectorAll(
    'option[data-selected]'
  ) as NodeListOf<HTMLOptionElement>) {
    const dataSelected = optionElement.dataset.selected

    if (dataSelected === 'true' || dataSelected === 'selected') {
      optionElement.selected = true
    }
  }

  // INPUTs WITH data-checked ATTRIBUTE
  for (const inputElement of document.querySelectorAll(
    'input[type="checkbox"][data-checked], input[type="radio"][data-checked]'
  ) as NodeListOf<HTMLInputElement>) {
    const dataChecked = inputElement.dataset.checked

    if (dataChecked === 'true' || dataChecked === 'checked') {
      inputElement.checked = true
    }
  }

  /*
   * Data Validators
   */

  // INPUTs WITH data-pattern ATTRIBUTE
  for (const inputElement of document.querySelectorAll(
    'input[data-pattern]'
  ) as NodeListOf<HTMLInputElement>) {
    const dataPattern = inputElement.dataset.pattern

    if (dataPattern !== undefined && dataPattern !== '') {
      inputElement.pattern = dataPattern
    }
  }

  // INPUTs WITH data-required="true|required" ATTRIBUTE
  for (const inputElement of document.querySelectorAll(
    'input[data-required="true"], input[data-required="required"]'
  ) as NodeListOf<HTMLInputElement>) {
    inputElement.required = true
  }

  /*
   * Data States
   */

  // INPUTs and SELECTs WITH data-autofocus="true|autofocus" ATTRIBUTE
  for (const inputElement of document.querySelectorAll(
    'input[data-autofocus="true"], input[data-autofocus="autofocus"], select[data-autofocus="true"], select[data-autofocus="autofocus"]'
  ) as NodeListOf<HTMLElement>) {
    inputElement.autofocus = true
    inputElement.focus()
  }

  // INPUTs, SELECTs, and OPTIONs WITH data-disabled="true|disabled" ATTRIBUTE
  for (const inputElement of document.querySelectorAll(
    'input[data-disabled="true"], input[data-disabled="disabled"], select[data-disabled="true"], select[data-disabled="disabled"], option[data-disabled="true"], option[data-disabled="disabled"]'
  ) as NodeListOf<HTMLInputElement | HTMLOptionElement | HTMLSelectElement>) {
    inputElement.disabled = true
  }

  // INPUTs WITH data-readonly="true|readonly" ATTRIBUTE
  for (const inputElement of document.querySelectorAll(
    'input[data-readonly="true"], input[data-readonly="readonly"]'
  ) as NodeListOf<HTMLInputElement>) {
    inputElement.readOnly = true
  }
})()
