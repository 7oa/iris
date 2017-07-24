(function() {

    'use strict';

    angular.module('iris_gs_system_states', []);
    
    angular.module('iris_gs_system_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.system', {
                    url: '/system',
                    controller: function() {},
                    template: `<div class="b-content b-window flex-grid" ui-view></div>`
                })
                .state('module.system.countries', {
                    url: '/countries',
                    controller: 'ModuleSystemCountriesViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/system/ms.system.countries.html`
                })
                .state('module.system.departments', {
                    url: '/departments?companyId&parentId',
                    controller: 'ModuleSystemDepartmentsViewCtrl',
                    resolve: {
                        'companies': (CompaniesService) => CompaniesService.getCompanies(),
                        'parent': ($stateParams, DepartmentService) => $stateParams['companyId'] && $stateParams['parentId'] ? DepartmentService.get($stateParams['companyId'], $stateParams['parentId']) : null
                    },
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/system/ms.system.departments.html`
                });
        }
    )
})();
