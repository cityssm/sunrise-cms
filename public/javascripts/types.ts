export interface Sunrise {
  urlPrefix: string
  apiKey: string

  highlightMap: (
    mapContainerElement: HTMLElement,
    mapKey: string,
    contextualClass: 'success' | 'danger'
  ) => void

  initializeDatePickers: (containerElement: HTMLElement) => void
  // initializeTimePickers: (containerElement: HTMLElement) => void;

  initializeUnlockFieldButtons: (containerElement: HTMLElement) => void

  populateAliases: (containerElement: HTMLElement) => void

  escapedAliases: {
    ExternalReceiptNumber: string
    externalReceiptNumber: string
    WorkOrderOpenDate: string
    workOrderOpenDate: string
    WorkOrderCloseDate: string
    workOrderCloseDate: string
  }

  dynamicsGPIntegrationIsEnabled: boolean

  getRandomColor: (seedString: string) => string

  setUnsavedChanges: () => void
  clearUnsavedChanges: () => void
  hasUnsavedChanges: () => boolean

  getMoveUpDownButtonFieldHTML: (
    upButtonClassNames: string,
    downButtonClassNames: string,
    isSmall?: boolean
  ) => string
  getLoadingParagraphHTML: (captionText?: string) => string
  getSearchResultsPagerHTML: (
    limit: number,
    offset: number,
    count: number
  ) => string

  getFuneralHomeURL: (funeralHomeId?: number | string, edit?: boolean, time?: boolean) => string
  getCemeteryURL: (cemeteryId?: number | string, edit?: boolean, time?: boolean) => string
  getBurialSiteURL: (burialSiteId?: number | string, edit?: boolean, time?: boolean) => string
  getContractURL: (
    contractId?: number | string,
    edit?: boolean,
    time?: boolean
  ) => string
  getWorkOrderURL: (
    workOrderId?: number | string,
    edit?: boolean,
    time?: boolean
  ) => string
}
