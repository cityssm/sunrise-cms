"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepAliveMillis = void 0;
exports.getConfigProperty = getConfigProperty;
var configurator_1 = require("@cityssm/configurator");
var to_millis_1 = require("@cityssm/to-millis");
var config_js_1 = require("../data/config.js");
var configDefaults_js_1 = require("../data/configDefaults.js");
var configurator = new configurator_1.Configurator(configDefaults_js_1.configDefaultValues, config_js_1.config);
function getConfigProperty(propertyName, fallbackValue) {
    return configurator.getConfigProperty(propertyName, fallbackValue);
}
exports.default = {
    getConfigProperty: getConfigProperty
};
exports.keepAliveMillis = getConfigProperty('session.doKeepAlive')
    ? Math.max(getConfigProperty('session.maxAgeMillis') / 2, getConfigProperty('session.maxAgeMillis') - (0, to_millis_1.secondsToMillis)(10))
    : 0;
