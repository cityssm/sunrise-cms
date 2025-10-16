export interface Sunrise {
    apiKey: string;
    urlPrefix: string;
    highlightMap: (mapContainerElement: HTMLElement, mapKey: string, contextualClass: 'danger' | 'success') => void;
    leafletConstants: {
        tileLayerUrl: string;
        defaultZoom: number;
        maxZoom: number;
        attribution: string;
    };
    openLeafletCoordinateSelectorModal: (options: {
        latitudeElement: HTMLInputElement;
        longitudeElement: HTMLInputElement;
        callbackFunction: (latitude: number, longitude: number) => void;
    }) => void;
    initializeUnlockFieldButtons: (containerElement: HTMLElement) => void;
    populateAliases: (containerElement: HTMLElement) => void;
    escapedAliases: {
        ExternalReceiptNumber: string;
        externalReceiptNumber: string;
        WorkOrderCloseDate: string;
        workOrderCloseDate: string;
        WorkOrderOpenDate: string;
        workOrderOpenDate: string;
    };
    dynamicsGPIntegrationIsEnabled: boolean;
    clearUnsavedChanges: () => void;
    hasUnsavedChanges: () => boolean;
    setUnsavedChanges: () => void;
    getLoadingParagraphHTML: (captionText?: string) => string;
    getMoveUpDownButtonFieldHTML: (upButtonClassNames: string, downButtonClassNames: string, isSmall?: boolean) => string;
    getSearchResultsPagerHTML: (limit: number, offset: number, count: number) => string;
    getBurialSiteUrl: (burialSiteId?: number | string, edit?: boolean, time?: boolean) => string;
    getCemeteryUrl: (cemeteryId?: number | string, edit?: boolean, time?: boolean) => string;
    getContractUrl: (contractId?: number | string, edit?: boolean, time?: boolean) => string;
    getFuneralHomeUrl: (funeralHomeId?: number | string, edit?: boolean, time?: boolean) => string;
    getWorkOrderUrl: (workOrderId?: number | string, edit?: boolean, time?: boolean) => string;
    initializeMinDateUpdate: (minDateElement: HTMLInputElement, valueDateElement: HTMLInputElement) => void;
}
