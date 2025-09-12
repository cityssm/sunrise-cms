;
(() => {
    function toggleFilterBlock(event) {
        event.preventDefault();
        const target = event.currentTarget;
        target.querySelector('.fa-caret-right')?.classList.toggle('fa-rotate-90');
        const nextElement = target.nextElementSibling;
        if (nextElement !== null) {
            nextElement.classList.toggle('is-hidden');
        }
    }
    const filterBlockToggleElements = document.querySelectorAll('.filter-block-toggle');
    for (const filterBlockToggleElement of filterBlockToggleElements) {
        filterBlockToggleElement.addEventListener('click', toggleFilterBlock);
    }
})();
