import type { DateString } from '@cityssm/utils-datetime';
export interface StartConsignoCloudWorkflowForm {
    contractId: string;
    workflowExpiresOn: DateString;
    workflowTitle: string;
    printNames: string | string[];
    signerFirstName: string;
    signerLastName: string;
    signerAmr: 'call' | 'sms';
    signerEmail: string;
    signerPhone: string;
}
export default function startConsignoCloudWorkflow(form: StartConsignoCloudWorkflowForm, user: User): Promise<{
    workflowId: string;
    workflowEditUrl: string;
}>;
