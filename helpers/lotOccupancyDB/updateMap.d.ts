interface UpdateMapForm {
    mapId: string;
    mapName: string;
    mapDescription: string;
    mapSVG: string;
    mapLatitude: string;
    mapLongitude: string;
    mapAddress1: string;
    mapAddress2: string;
    mapCity: string;
    mapProvince: string;
    mapPostalCode: string;
    mapPhoneNumber: string;
}
export declare function updateMap(mapForm: UpdateMapForm, user: User): Promise<boolean>;
export default updateMap;
