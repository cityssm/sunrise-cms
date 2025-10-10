import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { Contract } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise

  relatedContracts: Contract[]
}
;(() => {
  const sunrise = exports.sunrise

  const contractId = (
    document.querySelector('#contract--contractId') as HTMLInputElement
  ).value

  const relatedContractsContainer = document.querySelector(
    '#container--relatedContracts'
  ) as HTMLDivElement

  let relatedContracts = exports.relatedContracts

  function deleteRelatedContract(clickEvent: Event): void {
    clickEvent.preventDefault()

    const targetElement = clickEvent.currentTarget as HTMLButtonElement
    const contractRowElement = targetElement.closest(
      'tr'
    ) as HTMLTableRowElement

    const relatedContractId = contractRowElement.dataset.contractId

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Remove Related Contract',

      message: `Are you sure you want to remove this related contract?<br />
        Note that this will not delete the contract itself, only the relationship.`,
      messageIsHtml: true,

      okButton: {
        text: 'Remove Related Contract',

        callbackFunction() {
          cityssm.postJSON(
            `${sunrise.urlPrefix}/contracts/doDeleteRelatedContract`,
            {
              contractId,
              relatedContractId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                errorMessage?: string
                relatedContracts: Contract[]
                success: boolean
              }

              if (responseJSON.success) {
                relatedContracts = responseJSON.relatedContracts

                renderRelatedContracts()
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Removing Related Contract',

                  message: responseJSON.errorMessage ?? 'Please Try Again'
                })
              }
            }
          )
        }
      }
    })
  }

  function renderRelatedContracts(): void {
    relatedContractsContainer.innerHTML = ''

    if (relatedContracts.length === 0) {
      relatedContractsContainer.innerHTML = /*html*/ `
        <div class="message is-info">
          <div class="message-body">
            There are no contracts related to this contract.
          </div>
        </div>
      `
      return
    }

    const contractsTableElement = document.createElement('table')
    contractsTableElement.className =
      'table is-striped is-fullwidth is-hoverable'

    contractsTableElement.innerHTML = /*html*/ `
      <thead>
        <tr>
          <th>Contract Type</th>
          <th>Contract Date</th>
          <th>End Date</th>
          <th>Interments</th>
          <th></th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    const contractsTbodyElement = contractsTableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const relatedContract of relatedContracts) {
      let intermentsHTML = ''

      if (relatedContract.contractInterments?.length === 0) {
        intermentsHTML = '<span class="has-text-grey">(No Interments)</span>'
      } else {
        for (const interment of relatedContract.contractInterments ?? []) {
          intermentsHTML += `${interment.deceasedName}<br />`
        }
      }

      const contractRowElement = document.createElement('tr')
      contractRowElement.dataset.contractId =
        relatedContract.contractId.toString()

      // eslint-disable-next-line no-unsanitized/property
      contractRowElement.innerHTML = /*html*/ `
        <td>
          <a class="has-text-weight-bold"
            href="${sunrise.getContractUrl(relatedContract.contractId)}">
            ${cityssm.escapeHTML(relatedContract.contractType)}
          </a><br />
          <span class="is-size-7">#${relatedContract.contractId}</span>
        </td>
        <td>${relatedContract.contractStartDateString}</td>
        <td>
          ${
            relatedContract.contractEndDate
              ? relatedContract.contractEndDateString
              : '<span class="has-text-grey">(No End Date)</span>'
          }
        </td>
        <td>${intermentsHTML}</td>
        <td>
          <button
            class="button is-danger is-light is-small"
            type="button"
            title="Remove Related Contract"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-trash"></i>
            </span>
          </button>
        </td>
      `

      contractRowElement
        .querySelector('button')
        ?.addEventListener('click', deleteRelatedContract)

      contractsTbodyElement.append(contractRowElement)
    }

    relatedContractsContainer.innerHTML = ''
    relatedContractsContainer.append(contractsTableElement)
  }

  renderRelatedContracts()

  document
    .querySelector('#button--addRelatedContract')
    ?.addEventListener('click', () => {
      let modalElement: HTMLElement | undefined
      let formElement: HTMLFormElement | undefined

      let closeModalFunction: (() => void) | undefined

      function selectContract(clickEvent: Event): void {
        clickEvent.preventDefault()

        const targetElement = clickEvent.currentTarget as HTMLAnchorElement

        const selectedContractId = targetElement.dataset.contractId

        cityssm.postJSON(
          `${sunrise.urlPrefix}/contracts/doAddRelatedContract`,
          {
            contractId,
            relatedContractId: selectedContractId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              errorMessage?: string
              relatedContracts: Contract[]
              success: boolean
            }

            if (responseJSON.success) {
              relatedContracts = responseJSON.relatedContracts

              renderRelatedContracts()

              closeModalFunction?.()
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error Adding Related Contract',

                message: responseJSON.errorMessage ?? 'Please Try Again'
              })
            }
          }
        )
      }

      function loadContracts(formEvent?: Event): void {
        formEvent?.preventDefault()

        const containerElement = modalElement?.querySelector(
          '#resultsContainer--relatedContractSelect'
        ) as HTMLDivElement

        containerElement.innerHTML = sunrise.getLoadingParagraphHTML(
          'Loading Contracts...'
        )

        cityssm.postJSON(
          `${sunrise.urlPrefix}/contracts/doGetPossibleRelatedContracts`,
          formElement,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              count: number
              offset: number

              contracts: Contract[]
            }

            containerElement.innerHTML = '<div class="panel"></div>'

            for (const contract of responseJSON.contracts) {
              let intermentsHTML = ''

              if (contract.contractInterments?.length === 0) {
                intermentsHTML =
                  '<span class="has-text-grey">(No Interments)</span>'
              } else {
                for (const interment of contract.contractInterments ?? []) {
                  intermentsHTML += `${interment.deceasedName}<br />`
                }
              }

              const anchorElement = document.createElement('a')
              anchorElement.className = 'panel-block is-block is-size-7'
              anchorElement.dataset.contractId = contract.contractId.toString()

              // eslint-disable-next-line no-unsanitized/property
              anchorElement.innerHTML = /*html*/ `
                <div class="columns">
                  <div class="column is-narrow">
                    <i class="fa-solid fa-plus"></i>
                  </div>
                  <div class="column">
                    ${cityssm.escapeHTML(contract.contractType)}<br />
                    #${cityssm.escapeHTML(contract.contractId.toString())}
                  </div>
                  <div class="column">
                    ${cityssm.escapeHTML(contract.contractStartDateString)}
                  </div>
                  <div class="column">
                    ${
                      contract.contractEndDateString
                        ? cityssm.escapeHTML(
                            contract.contractEndDateString
                          )
                        : '<span class="has-text-grey">(No End Date)</span>'
                    }
                  </div>
                  <div class="column">
                    ${intermentsHTML}
                  </div>
                </div>
              `

              anchorElement.addEventListener('click', selectContract)

              containerElement.querySelector('.panel')?.append(anchorElement)
            }
          }
        )
      }

      cityssm.openHtmlModal('contract-addRelatedContract', {
        onshow(_modalElement) {
          modalElement = _modalElement
          formElement = modalElement.querySelector('form') as HTMLFormElement
          ;(
            formElement.querySelector(
              '#relatedContractSelect--notContractId'
            ) as HTMLInputElement
          ).value = contractId
          ;(
            formElement.querySelector(
              '#relatedContractSelect--notRelatedContractId'
            ) as HTMLInputElement
          ).value = contractId

          const burialSiteNameElement = formElement.querySelector(
            '#relatedContractSelect--burialSiteName'
          ) as HTMLInputElement

          burialSiteNameElement.value = (
            document.querySelector(
              '#contract--burialSiteName'
            ) as HTMLInputElement
          ).value

          burialSiteNameElement.addEventListener('change', loadContracts)

          loadContracts()
        },
        onshown(_modalElement, _closeModalFunction) {
          bulmaJS.toggleHtmlClipped()

          closeModalFunction = _closeModalFunction

          _modalElement
            .querySelector('#relatedContractSelect--burialSiteNameSearchType')
            ?.addEventListener('change', loadContracts)

          formElement?.addEventListener('submit', loadContracts)
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })
})()
