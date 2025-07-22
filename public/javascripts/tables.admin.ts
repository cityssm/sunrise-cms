;(() => {
  const toggleButtonElements = document.querySelectorAll('.is-toggle-button')

  function toggleTableView(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const panelElement = buttonElement.closest('.panel')

    const panelBlockElement = panelElement?.querySelector(
      '.panel-block'
    ) as HTMLDivElement

    panelBlockElement.classList.toggle('is-hidden')

    // eslint-disable-next-line no-unsanitized/property
    buttonElement.innerHTML = panelBlockElement.classList.contains('is-hidden')
      ? '<span class="icon"><i class="fa-solid fa-plus"></i></span>'
      : '<span class="icon"><i class="fa-solid fa-minus"></i></span>'
  }

  for (const toggleButtonElement of toggleButtonElements) {
    toggleButtonElement.addEventListener('click', toggleTableView)
  }
})()
