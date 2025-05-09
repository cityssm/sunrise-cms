"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const contractId = document.querySelector('#contract--contractId').value;
    const relatedContractsContainer = document.querySelector('#container--relatedContracts');
    let relatedContracts = exports.relatedContracts;
    function deleteRelatedContract(clickEvent) {
        clickEvent.preventDefault();
        const targetElement = clickEvent.currentTarget;
        const contractRowElement = targetElement.closest('tr');
        const relatedContractId = contractRowElement.dataset.contractId;
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Remove Related Contract',
            message: `Are you sure you want to remove this related contract?<br />
        Note that this will not delete the contract itself, only the relationship.`,
            messageIsHtml: true,
            okButton: {
                text: 'Remove Related Contract',
                callbackFunction() {
                    cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doDeleteRelatedContract`, {
                        contractId,
                        relatedContractId
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            relatedContracts = responseJSON.relatedContracts;
                            renderRelatedContracts();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Removing Related Contract',
                                message: responseJSON.errorMessage ?? 'Please Try Again'
                            });
                        }
                    });
                }
            }
        });
    }
    function renderRelatedContracts() {
        relatedContractsContainer.innerHTML = '';
        if (relatedContracts.length === 0) {
            relatedContractsContainer.innerHTML = `<div class="message is-info">
          <div class="message-body">
            There are no contracts related to this contract.
          </div>
          </div>`;
            return;
        }
        const contractsTableElement = document.createElement('table');
        contractsTableElement.className =
            'table is-striped is-fullwidth is-hoverable';
        contractsTableElement.innerHTML = `<thead>
      <tr>
        <th>Contract Type</th>
        <th>Contract Date</th>
        <th>End Date</th>
        <th>Interments</th>
        <th></th>
      </tr>
      </thead>
      <tbody></tbody>`;
        const contractsTbodyElement = contractsTableElement.querySelector('tbody');
        for (const relatedContract of relatedContracts) {
            let intermentsHTML = '';
            if (relatedContract.contractInterments?.length === 0) {
                intermentsHTML = '<span class="has-text-grey">(No Interments)</span>';
            }
            else {
                for (const interment of relatedContract.contractInterments ?? []) {
                    intermentsHTML += `${interment.deceasedName}<br />`;
                }
            }
            const contractRowElement = document.createElement('tr');
            contractRowElement.dataset.contractId =
                relatedContract.contractId.toString();
            // eslint-disable-next-line no-unsanitized/property
            contractRowElement.innerHTML = `<td>
          <a class="has-text-weight-bold"
            href="${sunrise.urlPrefix}/contracts/${relatedContract.contractId}">
            ${cityssm.escapeHTML(relatedContract.contractType)}
          </a><br />
          <span class="is-size-7">#${relatedContract.contractId}</span>
        </td>
        <td>${relatedContract.contractStartDateString}</td>
        <td>
          ${relatedContract.contractEndDate
                ? relatedContract.contractEndDateString
                : '<span class="has-text-grey">(No End Date)</span>'}
        </td>
        <td>${intermentsHTML}</td>
        <td>
          <button class="button is-danger is-light is-small has-tooltip-left"
            data-tooltip="Remove Related Contract"
            aria-label="Remove Related Contract"
            type="button">
            <span class="icon is-small">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </span>
          </button>
        </td>`;
            contractRowElement
                .querySelector('button')
                ?.addEventListener('click', deleteRelatedContract);
            contractsTbodyElement.append(contractRowElement);
        }
        relatedContractsContainer.innerHTML = '';
        relatedContractsContainer.append(contractsTableElement);
    }
    renderRelatedContracts();
    document
        .querySelector('#button--addRelatedContract')
        ?.addEventListener('click', () => {
        let modalElement;
        let formElement;
        let closeModalFunction;
        function selectContract(clickEvent) {
            clickEvent.preventDefault();
            const targetElement = clickEvent.currentTarget;
            const selectedContractId = targetElement.dataset.contractId;
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doAddRelatedContract`, {
                contractId,
                relatedContractId: selectedContractId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    relatedContracts = responseJSON.relatedContracts;
                    renderRelatedContracts();
                    closeModalFunction?.();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Related Contract',
                        message: responseJSON.errorMessage ?? 'Please Try Again'
                    });
                }
            });
        }
        function loadContracts(formEvent) {
            formEvent?.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doGetPossibleRelatedContracts`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                const containerElement = modalElement?.querySelector('#resultsContainer--relatedContractSelect');
                containerElement.innerHTML = '<div class="panel"></div>';
                for (const contract of responseJSON.contracts) {
                    let intermentsHTML = '';
                    if (contract.contractInterments?.length === 0) {
                        intermentsHTML =
                            '<span class="has-text-grey">(No Interments)</span>';
                    }
                    else {
                        for (const interment of contract.contractInterments ?? []) {
                            intermentsHTML += `${interment.deceasedName}<br />`;
                        }
                    }
                    const anchorElement = document.createElement('a');
                    anchorElement.className = 'panel-block is-block is-size-7';
                    anchorElement.dataset.contractId = contract.contractId.toString();
                    // eslint-disable-next-line no-unsanitized/property
                    anchorElement.innerHTML = `<div class="columns">
                <div class="column is-narrow">
                  <i class="fas fa-plus" aria-hidden="true"></i>
                </div>
                <div class="column">
                  ${cityssm.escapeHTML(contract.contractType)}<br />
                  #${cityssm.escapeHTML(contract.contractId.toString())}
                </div>
                <div class="column">
                  ${cityssm.escapeHTML(contract.contractStartDateString)}
                </div>
                <div class="column">
                  ${contract.contractEndDateString
                        ? cityssm.escapeHTML(contract.contractEndDateString)
                        : '<span class="has-text-grey">(No End Date)</span>'}
                </div>
                <div class="column">
                  ${intermentsHTML}
                </div>
                </div>`;
                    anchorElement.addEventListener('click', selectContract);
                    containerElement.querySelector('.panel')?.append(anchorElement);
                }
            });
        }
        cityssm.openHtmlModal('contract-addRelatedContract', {
            onshow(_modalElement) {
                modalElement = _modalElement;
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#relatedContractSelect--notContractId').value = contractId.toString();
                formElement.querySelector('#relatedContractSelect--notRelatedContractId').value = contractId.toString();
                formElement.querySelector('#relatedContractSelect--burialSiteName').value = document.querySelector('#contract--burialSiteName').value;
                loadContracts();
            },
            onshown(_modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                formElement?.addEventListener('submit', loadContracts);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
})();
