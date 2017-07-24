(function() {

    'use strict';

    angular.module('iris_gs_personnel_mgmt_states', []);

    angular.module('iris_gs_personnel_mgmt_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.personnel-mgmt', {
                    url: '/personnel-mgmt',
                    resolve: {
                        'companies': function (CompaniesService) {
                            return CompaniesService.getCompanies();
                        }
                    },
                    controller: 'ModulePersonnelMgmtCtrl',
                    template: '<div class="flex-col-auto b-window" ui-view></div>'
                })
                .state('module.personnel-mgmt.job-titles', {
                    url: '/job-titles',
                    controller: 'ModuleJobTitlesViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/personnel-mgmt/ms.personnel-mgmt.job-titles.html`
                })
                .state('module.personnel-mgmt.staff', {
                    url: '/staff',
                    controller: 'ModuleStaffViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/personnel-mgmt/ms.personnel-mgmt.staff.html`
                });
        }
    )
})();
