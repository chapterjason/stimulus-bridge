/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

module.exports = function createControllersModule(config) {
    let controllerContents = 'export default {';
    let autoImportContents = '';

    if ('undefined' !== typeof config['placeholder']) {
        throw new Error(
            'Your controllers.json file was not found. Be sure to add a Webpack alias from "@symfony/stimulus-bridge/controllers.json" to *your* controllers.json file.'
        );
    }

    if ('undefined' === typeof config['controllers']) {
        throw new Error('Your Stimulus configuration file (assets/controllers.json) lacks a "controllers" key.');
    }

    for (let packageName in config.controllers) {
        const packageConfig = require(packageName + '/package.json');

        for (let controllerName in config.controllers[packageName]) {
            const controllerReference = packageName + '/' + controllerName;

            // Find package config for the controller
            if ('undefined' === typeof packageConfig.symfony.controllers[controllerName]) {
                throw new Error(
                    'Controller "' + controllerReference + '" does not exist in the package and cannot be compiled.'
                );
            }

            const controllerPackageConfig = packageConfig.symfony.controllers[controllerName];
            const controllerUserConfig = config.controllers[packageName][controllerName];

            if (!controllerUserConfig.enabled) {
                continue;
            }

            const controllerMain = packageName + '/' + controllerPackageConfig.main;
            const webpackMode = controllerUserConfig.webpackMode;

            controllerContents +=
                "\n  '" +
                controllerReference +
                '\': import(/* webpackMode: "' +
                webpackMode +
                '" */ \'' +
                controllerMain +
                "'),";

            for (let autoimport in controllerUserConfig.autoimport || []) {
                if (controllerUserConfig.autoimport[autoimport]) {
                    autoImportContents += "import '" + autoimport + "';\n";
                }
            }
        }
    }

    return `${autoImportContents}${controllerContents}\n};`;
};
