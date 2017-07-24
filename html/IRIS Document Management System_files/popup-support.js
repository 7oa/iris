/**
 * Created by alexander.zakshevskii on 06.04.16.
 */

(function(globals) {
    'use strict';

    globals.angular.module('irisApp').controller('PopupMixin', function($scope, $uibModal) {
        $scope.popup = {
            openComponents(componentName, templateName, controllerName, params) {
                return this.open(`${globals.config.componentsUrl}/${componentName}/templates/${templateName}`,
                    controllerName, params)

            },
            openModules(templateName, controllerName, params) {
                return this.open(`${globals.config.moduleUrl}/templates/${templateName}`,
                    controllerName, params)

            },
            open: (templateUrl, controllerName, params) => {
                return $uibModal.open({
                    templateUrl: templateUrl,
                    resolve: {
                        params: () => params
                    },
                    controller: controllerName,
                    size: 'lg'
                }).result
            }
        }
    });
})({ angular, config: iris.config });