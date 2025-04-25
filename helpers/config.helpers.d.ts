import { configDefaultValues } from '../data/configDefaults.js';
export declare function getConfigProperty<K extends keyof typeof configDefaultValues>(propertyName: K, fallbackValue?: (typeof configDefaultValues)[K]): (typeof configDefaultValues)[K];
declare const _default: {
    getConfigProperty: typeof getConfigProperty;
};
export default _default;
export declare const keepAliveMillis: number;
