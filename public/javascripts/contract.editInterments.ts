/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddContractIntermentResponse } from '../../handlers/contracts-post/doAddContractInterment.js'
import type { DoDeleteContractIntermentResponse } from '../../handlers/contracts-post/doDeleteContractInterment.js'
import type { DoUpdateContractIntermentResponse } from '../../handlers/contracts-post/doUpdateContractInterment.js'
import type {
  ContractInterment,
  IntermentContainerType,
  IntermentDepth
} from '../../types/record.types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  contractInterments: ContractInterment[]
  deathAgePeriods: string[]
  intermentContainerTypes: IntermentContainerType[]
  intermentDepths: IntermentDepth[]
}
;(() => {
  const contractId = (
    document.querySelector('#contract--contractId') as HTMLInputElement
  ).value

  let contractInterments = exports.contractInterments

  const deathAgePeriods = exports.deathAgePeriods

  const intermentContainerTypes = exports.intermentContainerTypes

  const intermentDepths = exports.intermentDepths

  function initializeDeathAgeCalculator(
    fieldPrefix: 'contractIntermentAdd' | 'contractIntermentEdit'
  ): void {
    const birthYearElement = document.querySelector(
      `#${fieldPrefix}--birthYear`
    ) as HTMLInputElement

    const deathYearElement = document.querySelector(
      `#${fieldPrefix}--deathYear`
    ) as HTMLInputElement

    const calculateDeathAgeButtonElement = document.querySelector(
      '#button--calculateDeathAge'
    ) as HTMLButtonElement

    function toggleDeathAgeCalculatorButton(): void {
      if (birthYearElement.value === '' || deathYearElement.value === '') {
        calculateDeathAgeButtonElement.setAttribute('disabled', 'disabled')
      } else {
        calculateDeathAgeButtonElement.removeAttribute('disabled')
      }
    }

    toggleDeathAgeCalculatorButton()

    birthYearElement.addEventListener('change', toggleDeathAgeCalculatorButton)
    deathYearElement.addEventListener('change', toggleDeathAgeCalculatorButton)

    const deathAgeElement = document.querySelector(
      `#${fieldPrefix}--deathAge`
    ) as HTMLInputElement

    const deathAgePeriodElement = document.querySelector(
      `#${fieldPrefix}--deathAgePeriod`
    ) as HTMLSelectElement

    function calculateDeathAge(): void {
      if (birthYearElement.value === '' || deathYearElement.value === '') {
        return
      }

      const birthMonthElement = document.querySelector(
        `#${fieldPrefix}--birthMonth`
      ) as HTMLInputElement

      const birthDayElement = document.querySelector(
        `#${fieldPrefix}--birthDay`
      ) as HTMLInputElement

      const deathMonthElement = document.querySelector(
        `#${fieldPrefix}--deathMonth`
      ) as HTMLInputElement

      const deathDayElement = document.querySelector(
        `#${fieldPrefix}--deathDay`
      ) as HTMLInputElement

      const birthYear = Number.parseInt(birthYearElement.value, 10)
      const deathYear = Number.parseInt(deathYearElement.value, 10)

      let ageInYears: number

      if (
        birthMonthElement.value !== '' &&
        birthDayElement.value !== '' &&
        deathMonthElement.value !== '' &&
        deathDayElement.value !== ''
      ) {
        const birthMonth = Number.parseInt(birthMonthElement.value, 10)
        const birthDay = Number.parseInt(birthDayElement.value, 10)
        const deathMonth = Number.parseInt(deathMonthElement.value, 10)
        const deathDay = Number.parseInt(deathDayElement.value, 10)

        const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
        const deathDate = new Date(deathYear, deathMonth - 1, deathDay)

        const ageInDays = Math.floor(
          (deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (ageInDays <= 0) {
          deathAgeElement.value = '0'
          deathAgePeriodElement.value = 'Stillborn'
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        ageInYears = Math.floor(ageInDays / 365.25)

        if (ageInYears === 0) {
          deathAgeElement.value = ageInDays.toString()
          deathAgePeriodElement.value = 'Days'
          return
        }
      } else {
        ageInYears = deathYear - birthYear
      }

      if (ageInYears > 0) {
        deathAgeElement.value = ageInYears.toString()
        deathAgePeriodElement.value = 'Years'
      } else {
        deathAgeElement.value = '0'
        deathAgePeriodElement.value = 'Stillborn'
      }
    }

    calculateDeathAgeButtonElement.addEventListener('click', calculateDeathAge)
  }

  function openEditContractInterment(clickEvent: Event): void {
    const intermentNumber = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    )?.dataset.intermentNumber

    if (intermentNumber === undefined) {
      return
    }

    const contractInterment = contractInterments.find(
      (interment) => interment.intermentNumber === Number(intermentNumber)
    )

    if (contractInterment === undefined) {
      return
    }

    let closeModalFunction: () => void

    function submitForm(formEvent: Event): void {
      formEvent.preventDefault()

      const formElement = formEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        '/contracts/doUpdateContractInterment',
        formElement,
        (responseJSON: DoUpdateContractIntermentResponse) => {
          if (responseJSON.success) {
            contractInterments = responseJSON.contractInterments
            renderContractInterments()
            closeModalFunction()
          }
        }
      )
    }

    cityssm.openHtmlModal('contract-editInterment', {
      // eslint-disable-next-line complexity
      onshow(modalElement) {
        modalElement
          .querySelector('#contractIntermentEdit--contractId')
          ?.setAttribute('value', contractId)

        modalElement
          .querySelector('#contractIntermentEdit--intermentNumber')
          ?.setAttribute('value', intermentNumber)

        modalElement
          .querySelector('#contractIntermentEdit--deceasedName')
          ?.setAttribute('value', contractInterment.deceasedName)

        modalElement
          .querySelector('#contractIntermentEdit--deceasedAddress1')
          ?.setAttribute('value', contractInterment.deceasedAddress1)

        modalElement
          .querySelector('#contractIntermentEdit--deceasedAddress2')
          ?.setAttribute('value', contractInterment.deceasedAddress2)

        modalElement
          .querySelector('#contractIntermentEdit--deceasedCity')
          ?.setAttribute('value', contractInterment.deceasedCity)

        modalElement
          .querySelector('#contractIntermentEdit--deceasedProvince')
          ?.setAttribute('value', contractInterment.deceasedProvince)

        modalElement
          .querySelector('#contractIntermentEdit--deceasedPostalCode')
          ?.setAttribute('value', contractInterment.deceasedPostalCode)

        const birthYearElement = modalElement.querySelector(
          '#contractIntermentEdit--birthYear'
        ) as HTMLInputElement

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        birthYearElement.value = contractInterment.birthDate
          ? Math.floor(contractInterment.birthDate / 10_000).toString()
          : ''

        const birthMonthElement = modalElement.querySelector(
          '#contractIntermentEdit--birthMonth'
        ) as HTMLInputElement

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const birthMonth = contractInterment.birthDate
          ? Math.floor((contractInterment.birthDate % 10_000) / 100)
          : 0

        birthMonthElement.value = birthMonth > 0 ? birthMonth.toString() : ''

        const birthDayElement = modalElement.querySelector(
          '#contractIntermentEdit--birthDay'
        ) as HTMLInputElement

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const birthDay = contractInterment.birthDate
          ? contractInterment.birthDate % 100
          : 0

        birthDayElement.value = birthDay > 0 ? birthDay.toString() : ''

        modalElement
          .querySelector('#contractIntermentEdit--birthPlace')
          ?.setAttribute('value', contractInterment.birthPlace ?? '')

        const deathYearElement = modalElement.querySelector(
          '#contractIntermentEdit--deathYear'
        ) as HTMLInputElement

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        deathYearElement.value = contractInterment.deathDate
          ? Math.floor(contractInterment.deathDate / 10_000).toString()
          : ''

        const deathMonthElement = modalElement.querySelector(
          '#contractIntermentEdit--deathMonth'
        ) as HTMLInputElement

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const deathMonth = contractInterment.deathDate
          ? Math.floor((contractInterment.deathDate % 10_000) / 100)
          : 0

        deathMonthElement.value = deathMonth > 0 ? deathMonth.toString() : ''

        const deathDayElement = modalElement.querySelector(
          '#contractIntermentEdit--deathDay'
        ) as HTMLInputElement

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const deathDay = contractInterment.deathDate
          ? contractInterment.deathDate % 100
          : 0

        deathDayElement.value = deathDay > 0 ? deathDay.toString() : ''

        modalElement
          .querySelector('#contractIntermentEdit--deathPlace')
          ?.setAttribute('value', contractInterment.deathPlace ?? '')

        modalElement
          .querySelector('#contractIntermentEdit--deathAge')
          ?.setAttribute('value', contractInterment.deathAge?.toString() ?? '')

        const deathAgePeriodElement = modalElement.querySelector(
          '#contractIntermentEdit--deathAgePeriod'
        ) as HTMLSelectElement

        let deathAgePeriodIsFound = false

        for (const deathAgePeriod of deathAgePeriods) {
          const optionElement = document.createElement('option')
          optionElement.value = deathAgePeriod
          optionElement.text = deathAgePeriod

          if (deathAgePeriod === contractInterment.deathAgePeriod) {
            optionElement.selected = true
            deathAgePeriodIsFound = true
          }

          deathAgePeriodElement.append(optionElement)
        }

        if (!deathAgePeriodIsFound) {
          const optionElement = document.createElement('option')
          optionElement.value = contractInterment.deathAgePeriod ?? ''
          optionElement.text = contractInterment.deathAgePeriod ?? '(Not Set)'
          optionElement.selected = true
          deathAgePeriodElement.append(optionElement)
        }

        const containerTypeElement = modalElement.querySelector(
          '#contractIntermentEdit--intermentContainerTypeId'
        ) as HTMLSelectElement

        let containerTypeIsFound = false

        for (const containerType of intermentContainerTypes) {
          const optionElement = document.createElement('option')
          optionElement.value =
            containerType.intermentContainerTypeId.toString()
          optionElement.text = containerType.intermentContainerType

          if (
            containerType.intermentContainerTypeId ===
            contractInterment.intermentContainerTypeId
          ) {
            optionElement.selected = true
            containerTypeIsFound = true
          }

          containerTypeElement
            .querySelector(
              `optgroup[data-is-cremation-type="${containerType.isCremationType ? '1' : '0'}"]`
            )
            ?.append(optionElement)
        }

        if (
          (contractInterment.intermentContainerTypeId ?? '') !== '' &&
          !containerTypeIsFound
        ) {
          const optionElement = document.createElement('option')
          optionElement.value =
            contractInterment.intermentContainerTypeId?.toString() ?? ''
          optionElement.text = contractInterment.intermentContainerType ?? ''
          optionElement.selected = true
          containerTypeElement.append(optionElement)
        }

        const depthElement = modalElement.querySelector(
          '#contractIntermentEdit--intermentDepthId'
        ) as HTMLSelectElement

        for (const depth of intermentDepths) {
          const optionElement = document.createElement('option')
          optionElement.value = depth.intermentDepthId.toString()
          optionElement.text = depth.intermentDepth

          if (depth.intermentDepthId === contractInterment.intermentDepthId) {
            optionElement.selected = true
          }

          depthElement.append(optionElement)
        }

        modalElement
          .querySelector('#contractIntermentEdit--findagraveMemorialId')
          ?.setAttribute('value', contractInterment.findagraveMemorialId?.toString() ?? '')
      },
      onshown(modalElement, closeModal) {
        closeModalFunction = closeModal

        bulmaJS.toggleHtmlClipped()
        ;(
          modalElement.querySelector(
            '#contractIntermentEdit--deceasedName'
          ) as HTMLInputElement
        ).focus()

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', submitForm)

        initializeDeathAgeCalculator('contractIntermentEdit')
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteContractInterment(clickEvent: Event): void {
    const intermentNumber = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    )?.dataset.intermentNumber

    if (intermentNumber === undefined) {
      return
    }

    function doDelete(): void {
      cityssm.postJSON(
        '/contracts/doDeleteContractInterment',
        {
          contractId,
          intermentNumber
        },
        (responseJSON: DoDeleteContractIntermentResponse) => {
          if (responseJSON.success) {
            contractInterments = responseJSON.contractInterments
            renderContractInterments()
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Interment?',

      message:
        'Are you sure you want to remove this interment from the contract?',

      okButton: {
        text: 'Yes, Remove Interment',

        callbackFunction: doDelete
      }
    })
  }

  // eslint-disable-next-line complexity
  function renderContractInterments(): void {
    const containerElement = document.querySelector(
      '#container--contractInterments'
    ) as HTMLElement

    if (contractInterments.length === 0) {
      containerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">There are no interments associated with this record.</p>
        </div>
      `

      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'
    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Name</th>
          <th>Details</th>
          <th class="is-hidden-print"><span class="is-sr-only">Options</span></th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    for (const interment of contractInterments) {
      const tableRowElement = document.createElement('tr')
      tableRowElement.dataset.intermentNumber =
        interment.intermentNumber?.toString()

      let findagraveLinkHTML = ''

      if (interment.findagraveMemorialUrl !== null) {
        findagraveLinkHTML = /* html */ `
          <a
            class="tag is-dark"
            href="${interment.findagraveMemorialUrl}"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span class="icon"><i class="fa-solid fa-link"></i></span>
            <span>Find a Grave</span>
          </a>
        `
      } else if (interment.findagraveMemorialSearchUrl !== null) {
        findagraveLinkHTML = /* html */ `
          <a
            class="tag is-dark"
            href="${interment.findagraveMemorialSearchUrl}"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span class="icon"><i class="fa-solid fa-magnifying-glass"></i></span>
            <span>Search on Find a Grave</span>
          </a>
        `
      }

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = /* html */ `
        <td>
          ${cityssm.escapeHTML(interment.deceasedName)}<br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(interment.deceasedAddress1)}<br />
            ${interment.deceasedAddress2 === '' ? '' : `${cityssm.escapeHTML(interment.deceasedAddress2)}<br />`}
            ${cityssm.escapeHTML(interment.deceasedCity)}, ${cityssm.escapeHTML(
              interment.deceasedProvince
            )}<br />
            ${cityssm.escapeHTML(interment.deceasedPostalCode)}
          </span><br />
          ${findagraveLinkHTML}
        </td>
        <td>
          <div class="columns mb-0">
            <div class="column">
              <strong>Birth:</strong>
            </div>
            <div class="column">
              ${cityssm.escapeHTML(
                (interment.birthDateString ?? '') === ''
                  ? '(No Birth Date)'
                  : (interment.birthDateString ?? '')
              )}<br />
              ${cityssm.escapeHTML(interment.birthPlace ?? '(No Birth Place)')}
            </div>
          </div>
          <div class="columns mb-0">
            <div class="column">
              <strong>Death:</strong>
            </div>
            <div class="column">
              ${cityssm.escapeHTML(interment.deathDateString ?? '(No Death Date)')}<br />
              ${cityssm.escapeHTML(interment.deathPlace ?? '(No Death Place)')}
            </div>
          </div>
          <div class="columns mb-0">
            <div class="column">
              <strong>Age:</strong>
            </div>
            <div class="column">
              ${cityssm.escapeHTML((interment.deathAge ?? '') === '' ? '(No Age)' : (interment.deathAge?.toString() ?? ''))}
              ${cityssm.escapeHTML(interment.deathAgePeriod ?? '')}
            </div>
          </div>
          <div class="columns mb-0">
            <div class="column">
              <strong>Container:</strong>
            </div>
            <div class="column">
              ${cityssm.escapeHTML(interment.intermentContainerType ?? '(No Container Type)')}
            </div>
          </div>
          <div class="columns">
            <div class="column">
              <strong>Depth:</strong>
            </div>
            <div class="column">
              ${cityssm.escapeHTML(interment.intermentDepth ?? '(No Depth)')}
            </div>
          </div>
        </td>
        <td class="is-hidden-print has-text-right">
          <button class="button is-small is-info is-light button--edit mb-1" type="button" title="Edit Interment">
            <span class="icon"><i class="fa-solid fa-pencil-alt"></i></span>
            <span>Edit</span>
          </button>
          <br />
          <button class="button is-small is-danger is-light button--delete" type="button" title="Remove Interment">
            <span class="icon"><i class="fa-solid fa-trash"></i></span>
          </button>
        </td>
      `

      tableRowElement
        .querySelector('.button--edit')
        ?.addEventListener('click', openEditContractInterment)

      tableRowElement
        .querySelector('.button--delete')
        ?.addEventListener('click', deleteContractInterment)

      tableElement.querySelector('tbody')?.append(tableRowElement)
    }

    containerElement.innerHTML = ''
    containerElement.append(tableElement)
  }

  document
    .querySelector('#button--addInterment')
    ?.addEventListener('click', () => {
      let closeModalFunction: () => void

      function submitForm(formEvent: Event): void {
        formEvent.preventDefault()

        const formElement = formEvent.currentTarget as HTMLFormElement

        cityssm.postJSON(
          '/contracts/doAddContractInterment',
          formElement,
          (responseJSON: DoAddContractIntermentResponse) => {
            if (responseJSON.success) {
              contractInterments = responseJSON.contractInterments
              renderContractInterments()
              closeModalFunction()
            }
          }
        )
      }

      cityssm.openHtmlModal('contract-addInterment', {
        onshow(modalElement) {
          modalElement
            .querySelector('#contractIntermentAdd--contractId')
            ?.setAttribute('value', contractId)

          const deathAgePeriodElement = modalElement.querySelector(
            '#contractIntermentAdd--deathAgePeriod'
          ) as HTMLSelectElement

          for (const deathAgePeriod of deathAgePeriods) {
            const optionElement = document.createElement('option')
            optionElement.value = deathAgePeriod
            optionElement.text = deathAgePeriod

            deathAgePeriodElement.append(optionElement)
          }

          const containerTypeElement = modalElement.querySelector(
            '#contractIntermentAdd--intermentContainerTypeId'
          ) as HTMLSelectElement

          for (const containerType of intermentContainerTypes) {
            const optionElement = document.createElement('option')
            optionElement.value =
              containerType.intermentContainerTypeId.toString()
            optionElement.text = containerType.intermentContainerType

            containerTypeElement
              .querySelector(
                `optgroup[data-is-cremation-type="${containerType.isCremationType ? '1' : '0'}"]`
              )
              ?.append(optionElement)
          }

          const depthElement = modalElement.querySelector(
            '#contractIntermentAdd--intermentDepthId'
          ) as HTMLSelectElement

          for (const depth of intermentDepths) {
            const optionElement = document.createElement('option')
            optionElement.value = depth.intermentDepthId.toString()
            optionElement.text = depth.intermentDepth

            depthElement.append(optionElement)
          }
        },
        onshown(modalElement, closeModal) {
          closeModalFunction = closeModal
          bulmaJS.toggleHtmlClipped()
          ;(
            modalElement.querySelector(
              '#contractIntermentAdd--deceasedName'
            ) as HTMLInputElement
          ).focus()

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', submitForm)

          initializeDeathAgeCalculator('contractIntermentAdd')
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })

  renderContractInterments()
})()
