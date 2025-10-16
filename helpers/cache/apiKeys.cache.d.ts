export declare function getCachedApiKeys(): Record<string, string>;
export declare function getApiKeyByUserName(userName: string): string | undefined;
export declare function getUserNameFromApiKey(apiKey: string): string | undefined;
export declare function clearApiKeysCache(): void;
