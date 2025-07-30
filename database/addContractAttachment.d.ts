export default function addContractAttachment(attachment: {
    contractId: number | string;
    attachmentDetails?: string;
    attachmentTitle?: string;
    fileName: string;
    filePath: string;
}, user: User): number;
