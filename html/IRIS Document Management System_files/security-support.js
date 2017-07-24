(function(globals) {
    'use strict';

    globals.angular.module('irisApp').controller('SecurityMixin', function($scope, SecurityService) {
        $scope.hasPermission = function (module, type, action) {
            return SecurityService.hasPermissions(module, type, action);
        };

        $scope.hasConfigRights = function (module) {
            module = module || iris.config.module;
            return SecurityService.hasPermissions(module, 'Module', 'config');
        }
    });
})({ angular, config: iris.config });