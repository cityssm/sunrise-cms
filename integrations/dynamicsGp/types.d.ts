export interface DynamicsGPDocument {
    documentType: 'Cash Receipt' | 'Invoice';
    documentDate: Date;
    documentDescription: string[];
    documentNumber: string;
    documentTotal: number;
}
