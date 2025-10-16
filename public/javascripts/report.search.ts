;(() => {
  const menuTabElements: NodeListOf<HTMLAnchorElement> =
    document.querySelectorAll('.menu a')

  const tabContainerElements: NodeListOf<HTMLElement> =
    document.querySelectorAll('.tabs-container > div')

  function selectTab(clickEvent: Event): void {
    clickEvent.preventDefault()

    // Remove .is-active from all tabs
    for (const menuTabElement of menuTabElements) {
      menuTabElement.classList.remove('is-active')
    }

    // Set .is-active on clicked tab
    const selectedTabElement = clickEvent.currentTarget as HTMLAnchorElement
    selectedTabElement.classList.add('is-active')

    // Hide all but selected tab
    const selectedTabContainerId = selectedTabElement.href.slice(
      Math.max(0, selectedTabElement.href.indexOf('#') + 1)
    )

    for (const tabContainerElement of tabContainerElements) {
      tabContainerElement.classList.toggle(
        'is-hidden',
        tabContainerElement.id !== selectedTabContainerId
      )
    }
  }

  for (const menuTabElement of menuTabElements) {
    menuTabElement.addEventListener('click', selectTab)
  }
})()
