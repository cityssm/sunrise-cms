"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepAliveMillis = void 0;
exports.getConfigProperty = getConfigProperty;
const configurator_1 = require("@cityssm/configurator");
const to_millis_1 = require("@cityssm/to-millis");
const config_js_1 = require("../data/config.js");
const configDefaults_js_1 = require("../data/configDefaults.js");
const configurator = new configurator_1.Configurator(configDefaults_js_1.configDefaultValues, config_js_1.config);
function getConfigProperty(propertyName, fallbackValue) {
    return configurator.getConfigProperty(propertyName, fallbackValue);
}
exports.default = {
    getConfigProperty
};
exports.keepAliveMillis = getConfigProperty('session.doKeepAlive')
    ? Math.max(getConfigProperty('session.maxAgeMillis') / 2, getConfigProperty('session.maxAgeMillis') - (0, to_millis_1.secondsToMillis)(10))
    : 0;
