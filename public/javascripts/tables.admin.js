;
(() => {
    const toggleButtonElements = document.querySelectorAll('.is-toggle-button');
    function toggleTableView(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const panelElement = buttonElement.closest('.panel');
        const panelBlockElement = panelElement?.querySelector('.panel-block');
        panelBlockElement.classList.toggle('is-hidden');
        // eslint-disable-next-line no-unsanitized/property
        buttonElement.innerHTML = panelBlockElement.classList.contains('is-hidden')
            ? '<span class="icon"><i class="fa-solid fa-plus" aria-hidden="true"></i></span>'
            : '<span class="icon"><i class="fa-solid fa-minus" aria-hidden="true"></i></span>';
    }
    for (const toggleButtonElement of toggleButtonElements) {
        toggleButtonElement.addEventListener('click', toggleTableView);
    }
})();
