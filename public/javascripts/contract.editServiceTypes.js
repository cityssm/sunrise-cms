(() => {
    const sunrise = exports.sunrise;
    const contractId = document.querySelector('#contract--contractId').value;
    const serviceTypes = exports.serviceTypes;
    let contractServiceTypes = exports.contractServiceTypes;
    function deleteContractServiceType(clickEvent) {
        const serviceTypeId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .serviceTypeId ?? '', 10);
        const serviceType = contractServiceTypes.find((currentServiceType) => currentServiceType.serviceTypeId === serviceTypeId);
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doDeleteContractServiceType`, {
                contractId,
                serviceTypeId
            }, (responseJSON) => {
                if (responseJSON.success) {
                    contractServiceTypes = responseJSON.contractServiceTypes;
                    renderContractServiceTypes();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Service Type Removed Successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Error Removing Service Type'
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Remove Service Type',
            message: `Are you sure you want to remove this service type from the contract?<br />
          <strong>${cityssm.escapeHTML(serviceType?.serviceType ?? '')}</strong>`,
            messageIsHtml: true,
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Remove Service Type'
            }
        });
    }
    function openEditServiceType(clickEvent) {
        const serviceTypeId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .serviceTypeId ?? '', 10);
        const serviceType = contractServiceTypes.find((currentServiceType) => currentServiceType.serviceTypeId === serviceTypeId);
        if (!serviceType) {
            return;
        }
        let editFormElement;
        let editCloseModalFunction;
        function updateContractServiceType(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doUpdateContractServiceType`, editFormElement, (responseJSON) => {
                if (responseJSON.success) {
                    contractServiceTypes = responseJSON.contractServiceTypes;
                    if (editCloseModalFunction !== undefined) {
                        editCloseModalFunction();
                    }
                    renderContractServiceTypes();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Service Type Updated Successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Service Type',
                        message: responseJSON.errorMessage
                    });
                }
            });
        }
        cityssm.openHtmlModal('contract-editServiceType', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement
                    .querySelector('#contractServiceTypeEdit--contractId')
                    ?.setAttribute('value', contractId);
                modalElement
                    .querySelector('#contractServiceTypeEdit--serviceTypeId')
                    ?.setAttribute('value', serviceTypeId.toString());
                const serviceTypeNameElement = modalElement.querySelector('#contractServiceTypeEdit--serviceTypeName');
                serviceTypeNameElement.textContent = serviceType.serviceType;
                const detailsElement = modalElement.querySelector('#contractServiceTypeEdit--contractServiceDetails');
                detailsElement.value = serviceType.contractServiceDetails ?? '';
                editFormElement = modalElement.querySelector('form');
                editFormElement.addEventListener('submit', updateContractServiceType);
            },
            onshown(_modalElement, closeModalFunction) {
                editCloseModalFunction = closeModalFunction;
            },
            onremoved() {
                editFormElement = undefined;
                editCloseModalFunction = undefined;
            }
        });
    }
    function renderContractServiceTypes() {
        const containerElement = document.querySelector('#container--contractServiceTypes');
        if (contractServiceTypes.length === 0) {
            containerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">There are no service types associated with this contract.</p>
        </div>
      `;
            return;
        }
        let tableHTML = /* html */ `
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Service Type</th>
            <th>Details</th>
            <th class="has-width-1"></th>
          </tr>
        </thead>
        <tbody>
    `;
        for (const contractServiceType of contractServiceTypes) {
            tableHTML += /* html */ `
        <tr data-service-type-id="${contractServiceType.serviceTypeId.toString()}">
          <td>${cityssm.escapeHTML(contractServiceType.serviceType)}</td>
          <td>
            <span class="service-details">${cityssm.escapeHTML(contractServiceType.contractServiceDetails ?? '')}</span>
          </td>
          <td class="is-nowrap">
            <button
              class="button is-small is-info is-light button--editServiceType"
              type="button"
              title="Edit Details"
            >
              <span class="icon"><i class="fa-solid fa-pencil"></i></span>
              <span>Edit</span>
            </button>
            <button
              class="button is-small is-danger is-light button--deleteServiceType"
              type="button"
              title="Remove Service Type"
            >
              <span class="icon"><i class="fa-solid fa-trash"></i></span>
              <span>Remove</span>
            </button>
          </td>
        </tr>
      `;
        }
        tableHTML += /* html */ `
        </tbody>
      </table>
    `;
        // eslint-disable-next-line no-unsanitized/property
        containerElement.innerHTML = tableHTML;
        const editButtons = containerElement.querySelectorAll('.button--editServiceType');
        for (const editButton of editButtons) {
            editButton.addEventListener('click', openEditServiceType);
        }
        const deleteButtons = containerElement.querySelectorAll('.button--deleteServiceType');
        for (const deleteButton of deleteButtons) {
            deleteButton.addEventListener('click', deleteContractServiceType);
        }
    }
    function openAddServiceType() {
        // Get service types not already added
        const availableServiceTypes = serviceTypes.filter((serviceType) => !contractServiceTypes.some((contractServiceType) => contractServiceType.serviceTypeId === serviceType.serviceTypeId));
        if (availableServiceTypes.length === 0) {
            bulmaJS.alert({
                contextualColorName: 'info',
                message: 'All available service types have already been added to this contract.'
            });
            return;
        }
        let addFormElement;
        let addCloseModalFunction;
        function addContractServiceType(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doAddContractServiceType`, addFormElement, (responseJSON) => {
                if (responseJSON.success) {
                    contractServiceTypes = responseJSON.contractServiceTypes;
                    if (addCloseModalFunction !== undefined) {
                        addCloseModalFunction();
                    }
                    renderContractServiceTypes();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Service Type Added Successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Service Type',
                        message: responseJSON.errorMessage
                    });
                }
            });
        }
        cityssm.openHtmlModal('contract-addServiceType', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement
                    .querySelector('#contractServiceTypeAdd--contractId')
                    ?.setAttribute('value', contractId);
                const selectElement = modalElement.querySelector('#contractServiceTypeAdd--serviceTypeId');
                selectElement.innerHTML = '';
                for (const serviceType of availableServiceTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value = serviceType.serviceTypeId.toString();
                    optionElement.textContent = serviceType.serviceType;
                    selectElement.append(optionElement);
                }
                addFormElement = modalElement.querySelector('form');
                addFormElement.addEventListener('submit', addContractServiceType);
            },
            onshown(_modalElement, closeModalFunction) {
                addCloseModalFunction = closeModalFunction;
            },
            onremoved() {
                addFormElement = undefined;
                addCloseModalFunction = undefined;
            }
        });
    }
    document
        .querySelector('#button--addServiceType')
        ?.addEventListener('click', openAddServiceType);
    renderContractServiceTypes();
})();
