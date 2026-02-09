(() => {
    const sunrise = exports.sunrise;
    const workOrderSearchFiltersFormElement = document.querySelector('#form--searchFilters');
    const workOrderMilestoneYearElement = workOrderSearchFiltersFormElement.querySelector('#searchFilter--workOrderMilestoneYear');
    const workOrderMilestoneMonthElement = workOrderSearchFiltersFormElement.querySelector('#searchFilter--workOrderMilestoneMonth');
    const milestoneCalendarContainerElement = document.querySelector('#container--milestoneCalendar');
    function renderBlankCalendar(dateInTheMonthString) {
        const calendarDate = cityssm.dateStringToDate(dateInTheMonthString);
        const calendarMonth = calendarDate.getMonth();
        calendarDate.setDate(1);
        const tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-bordered is-narrow is-fixed is-size-7';
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr class="is-info">
          <th><abbr title="Sunday">Sun</abbr></th>
          <th><abbr title="Monday">Mon</abbr></th>
          <th><abbr title="Tuesday">Tue</abbr></th>
          <th><abbr title="Wednesday">Wed</abbr></th>
          <th><abbr title="Thursday">Thu</abbr></th>
          <th><abbr title="Friday">Fri</abbr></th>
          <th><abbr title="Saturday">Sat</abbr></th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tableBodyElement = tableElement.querySelector('tbody');
        if (calendarDate.getDay() !== 0) {
            const emptyRow = document.createElement('tr');
            for (let dayOfWeek = 0; dayOfWeek < calendarDate.getDay(); dayOfWeek += 1) {
                const emptyCell = document.createElement('td');
                emptyCell.className = 'has-background-white-ter';
                emptyCell.innerHTML = '&nbsp;';
                emptyRow.append(emptyCell);
            }
            tableBodyElement.append(emptyRow);
        }
        while (calendarDate.getMonth() === calendarMonth) {
            const dateCell = document.createElement('td');
            dateCell.dataset.dateString = cityssm.dateToString(calendarDate);
            dateCell.style.height = '3rem';
            // eslint-disable-next-line no-unsanitized/property
            dateCell.innerHTML = /* html */ `
        <a href="${sunrise.urlPrefix}/workOrders/workday/?workdayDateString=${cityssm.dateToString(calendarDate)}">
          ${calendarDate.getDate().toString()}
        </a>
      `;
            if (calendarDate.getDay() === 0) {
                const newRow = document.createElement('tr');
                newRow.append(dateCell);
                tableBodyElement.append(newRow);
            }
            else {
                tableBodyElement.querySelector('tr:last-child')?.append(dateCell);
            }
            calendarDate.setDate(calendarDate.getDate() + 1);
        }
        if (calendarDate.getDay() !== 0) {
            const finalRow = tableBodyElement.querySelector('tr:last-child');
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            while (finalRow.children.length < 7) {
                const emptyCell = document.createElement('td');
                emptyCell.className = 'has-background-white-ter';
                emptyCell.innerHTML = '&nbsp;';
                finalRow.append(emptyCell);
            }
        }
        milestoneCalendarContainerElement.append(tableElement);
    }
    function buildWorkOrderElement(workOrder) {
        const workOrderElement = document.createElement('a');
        workOrderElement.className = 'box mt-2 mb-0 px-2 py-1 container--workOrder';
        workOrderElement.dataset.workOrderId = String(workOrder.workOrderId);
        workOrderElement.dataset.isComplete =
            workOrder.workOrderCloseDate === null ? '0' : '1';
        workOrderElement.href = sunrise.getWorkOrderUrl(workOrder.workOrderId);
        // eslint-disable-next-line no-unsanitized/property
        workOrderElement.innerHTML = /* html */ `
      <div class="columns m-0 is-gapless is-mobile">
        <div class="column has-text-weight-semibold">
          #${cityssm.escapeHTML(workOrder.workOrderNumber ?? '')}
        </div>
        <div class="column is-narrow">
          <span class="icon is-small">
            ${workOrder.workOrderCloseDate === null
            ? '<i class="fa-solid fa-play" title="Open"></i>'
            : '<i class="fa-solid fa-stop" title="Closed"></i>'}
          </span>
        </div>
      </div>
    `;
        // Add burial sites and interred names
        const burialSiteNames = new Set();
        const deceasedNames = new Set();
        for (const burialSite of workOrder.workOrderBurialSites ?? []) {
            burialSiteNames.add(burialSite.burialSiteName);
        }
        for (const contract of workOrder.workOrderContracts ?? []) {
            burialSiteNames.add(contract.burialSiteName ?? '');
            for (const interment of contract.contractInterments ?? []) {
                deceasedNames.add(interment.deceasedName ?? '');
            }
        }
        for (const burialSiteName of burialSiteNames) {
            if (burialSiteName === '') {
                continue;
            }
            workOrderElement.insertAdjacentHTML('beforeend', 
            /* html */ `
          <div class="columns m-0 is-gapless is-mobile">
            <div class="column is-narrow">
              <span class="icon is-small">
                <i class="fa-solid fa-map-pin"></i>
              </span>
            </div>
            <div class="column">
              ${cityssm.escapeHTML(burialSiteName)}
            </div>
          </div>
        `);
        }
        for (const deceasedName of deceasedNames) {
            if (deceasedName === '') {
                continue;
            }
            workOrderElement.insertAdjacentHTML('beforeend', 
            /* html */ `
          <div class="columns m-0 is-gapless is-mobile">
            <div class="column is-narrow">
              <span class="icon is-small">
                <i class="fa-solid fa-user"></i>
              </span>
            </div>
            <div class="column">
              ${cityssm.escapeHTML(deceasedName)}
            </div>
          </div>
        `);
        }
        return workOrderElement;
    }
    function renderMilestones(workOrderMilestones) {
        milestoneCalendarContainerElement.innerHTML = '';
        if (workOrderMilestones.length === 0) {
            milestoneCalendarContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">No Milestones Found</p>
        </div>
      `;
            // return
        }
        let dateString = workOrderMilestones[0]?.workOrderMilestoneDateString;
        dateString ??=
            workOrderMilestoneYearElement.value.padStart(4, '0') +
                '-' +
                workOrderMilestoneMonthElement.value.padStart(2, '0') +
                '-01';
        renderBlankCalendar(dateString);
        const currentDateString = cityssm.dateToString(new Date());
        // Render the milestones
        for (const workOrderMilestone of workOrderMilestones) {
            const milestoneDate = cityssm.dateStringToDate(workOrderMilestone.workOrderMilestoneDateString ?? '');
            const calendarDateCell = milestoneCalendarContainerElement.querySelector(`td[data-date-string="${cityssm.dateToString(milestoneDate)}"]`);
            let workOrderElement = calendarDateCell.querySelector(`[data-work-order-id="${workOrderMilestone.workOrderId}"]`);
            if (workOrderElement === null) {
                workOrderElement = buildWorkOrderElement(workOrderMilestone);
                calendarDateCell.append(workOrderElement);
            }
            // eslint-disable-next-line no-unsanitized/method
            workOrderElement.insertAdjacentHTML('beforeend', 
            /* html */ `
          <div
            class="columns m-0 is-gapless is-mobile container--workOrderMilestone"
            data-is-complete="${workOrderMilestone.workOrderMilestoneCompletionDate === null ? '0' : '1'}"
          >
            <div class="column is-narrow">
              <span class="icon is-small">
                ${workOrderMilestone.workOrderMilestoneCompletionDate === null
                ? '<i class="fa-regular fa-square" title="Not Completed"></i>'
                : '<i class="fa-solid fa-check" title="Completed"></i>'}
              </span>
            </div>
            <div class="column">
              ${cityssm.escapeHTML(workOrderMilestone.workOrderMilestoneType ?? '(No Type)')}
            </div>
          </div>
        `);
            if (workOrderMilestone.workOrderMilestoneTime !== null) {
                workOrderElement.insertAdjacentHTML('beforeend', 
                /* html */ `
            <p class="is-italic has-text-right">
              ${cityssm.escapeHTML(workOrderMilestone.workOrderMilestoneTimePeriodString ?? '')}
            </p>
          `);
            }
            if (workOrderMilestone.workOrderMilestoneCompletionDate === null &&
                (workOrderMilestone.workOrderMilestoneDateString ?? '') <
                    currentDateString) {
                workOrderElement.classList.add('has-background-warning-light');
            }
        }
    }
    function getMilestones(event) {
        if (event !== undefined) {
            event.preventDefault();
        }
        milestoneCalendarContainerElement.innerHTML =
            sunrise.getLoadingParagraphHTML('Loading Milestones...');
        cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/doGetWorkOrderMilestones`, workOrderSearchFiltersFormElement, (responseJSON) => {
            renderMilestones(responseJSON.workOrderMilestones);
        });
    }
    document
        .querySelector('#button--previousMonth')
        ?.addEventListener('click', () => {
        const currentMonth = workOrderMilestoneMonthElement.value;
        if (currentMonth === '1') {
            // Ensure the previous year is available
            const previousYear = Number(workOrderMilestoneYearElement.value) - 1;
            if (document.querySelector(`option[value="${previousYear}"]`) === null) {
                const newOption = document.createElement('option');
                newOption.value = String(previousYear);
                newOption.textContent = String(previousYear);
                workOrderMilestoneYearElement.prepend(newOption);
            }
            workOrderMilestoneYearElement.value = String(Number(workOrderMilestoneYearElement.value) - 1);
            workOrderMilestoneMonthElement.value = '12';
        }
        else {
            workOrderMilestoneMonthElement.value = String(Number(currentMonth) - 1);
        }
        getMilestones();
    });
    document
        .querySelector('#button--nextMonth')
        ?.addEventListener('click', () => {
        const currentMonth = workOrderMilestoneMonthElement.value;
        if (currentMonth === '12') {
            // Ensure the next year is available
            const nextYear = Number(workOrderMilestoneYearElement.value) + 1;
            if (document.querySelector(`option[value="${nextYear}"]`) === null) {
                const newOption = document.createElement('option');
                newOption.value = String(nextYear);
                newOption.textContent = String(nextYear);
                workOrderMilestoneYearElement.append(newOption);
            }
            workOrderMilestoneYearElement.value = String(Number(workOrderMilestoneYearElement.value) + 1);
            workOrderMilestoneMonthElement.value = '1';
        }
        else {
            workOrderMilestoneMonthElement.value = String(Number(currentMonth) + 1);
        }
        getMilestones();
    });
    workOrderMilestoneYearElement.addEventListener('change', getMilestones);
    workOrderMilestoneMonthElement.addEventListener('change', getMilestones);
    workOrderSearchFiltersFormElement.addEventListener('submit', getMilestones);
    getMilestones();
})();
