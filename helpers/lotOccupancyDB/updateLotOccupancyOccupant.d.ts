import type * as recordTypes from '../../types/recordTypes';
interface UpdateLotOccupancyOccupantForm {
    lotOccupancyId: string | number;
    lotOccupantIndex: string | number;
    lotOccupantTypeId: string | number;
    occupantName: string;
    occupantFamilyName: string;
    occupantAddress1: string;
    occupantAddress2: string;
    occupantCity: string;
    occupantProvince: string;
    occupantPostalCode: string;
    occupantPhoneNumber: string;
    occupantEmailAddress: string;
    occupantComment: string;
}
export declare function updateLotOccupancyOccupant(lotOccupancyOccupantForm: UpdateLotOccupancyOccupantForm, requestSession: recordTypes.PartialSession): Promise<boolean>;
export default updateLotOccupancyOccupant;
