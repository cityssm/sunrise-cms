export interface APIRequest {
    params?: {
        apiKey?: string;
    };
}
export interface UserRequest {
    session?: {
        user?: User;
    };
}
export declare function apiKeyIsValid(request: APIRequest): boolean;
export declare function userCanUpdate(request: UserRequest): boolean;
export declare function userCanUpdateWorkOrders(request: UserRequest): boolean;
export declare function userIsAdmin(request: UserRequest): boolean;
export declare function getUser(userName: string): User | undefined;
