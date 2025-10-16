export interface DynamicsGPDocument {
    documentType: 'Cash Receipt' | 'Invoice';
    documentDate: Date;
    documentNumber: string;
    documentDescription: string[];
    documentTotal: number;
}
