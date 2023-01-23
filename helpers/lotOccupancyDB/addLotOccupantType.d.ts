import type * as recordTypes from '../../types/recordTypes';
interface AddLotOccupantTypeForm {
    lotOccupantType: string;
    fontAwesomeIconClass?: string;
    occupantCommentTitle?: string;
    orderNumber?: number;
}
export declare function addLotOccupantType(lotOccupantTypeForm: AddLotOccupantTypeForm, requestSession: recordTypes.PartialSession): Promise<number>;
export default addLotOccupantType;
