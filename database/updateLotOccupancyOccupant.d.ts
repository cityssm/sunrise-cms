export interface UpdateLotOccupancyOccupantForm {
    burialSiteContractId: string | number;
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
export default function updateLotOccupancyOccupant(burialSiteContractOccupantForm: UpdateLotOccupancyOccupantForm, user: User): Promise<boolean>;
