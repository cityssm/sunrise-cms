export interface Config {
    application?: ConfigApplication;
    session?: ConfigSession;
    reverseProxy?: {
        disableCompression: boolean;
        disableEtag: boolean;
        urlPrefix: string;
    };
    activeDirectory?: ConfigActiveDirectory;
    users?: {
        testing?: string[];
        canLogin?: string[];
        canUpdate?: string[];
        isAdmin?: string[];
    };
    aliases?: {
        lot: string;
        lots: string;
        map: string;
        maps: string;
    };
}
interface ConfigApplication {
    applicationName?: string;
    backgroundURL?: string;
    logoURL?: string;
    httpPort?: number;
    userDomain?: string;
}
interface ConfigSession {
    cookieName?: string;
    secret?: string;
    maxAgeMillis?: number;
    doKeepAlive?: boolean;
}
export interface ConfigActiveDirectory {
    url: string;
    baseDN: string;
    username: string;
    password: string;
}
export {};
