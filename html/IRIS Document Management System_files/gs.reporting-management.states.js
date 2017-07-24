(function() {

    'use strict';

    angular.module('iris_gs_reporting_mgmt_states', []);

    angular.module('iris_gs_reporting_mgmt_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.reporting-mgmt', {
                    url: '/project/:projectId',
                    controller: 'ModuleProjectsBaseCtrl',
                    resolve: {
                        'projects': function (ProjectsService) {
                            return ProjectsService.getProjects();
                        }
                    },
                    template: '<div class="flex-col-auto b-window" ui-view></div>'
                })
                .state('module.reporting-mgmt.report-types', {
                    url: '/report-types',
                    controller: 'ModuleReportTypesViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/reporting-mgmt/ms.reporting-mgmt.report-types.html`
                })
                .state('module.reporting-mgmt.work-days-configurations', {
                    url: '/work-days-configurations',
                    controller: 'ModuleWorkDaysConfigurationsViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/reporting-mgmt/ms.reporting-mgmt.work-days-configurations.html`
                })
                .state('module.reporting-mgmt.print-templates', {
                    url: '/print-templates',
                    controller: 'ModuleTemplatesViewCtrl',
                    resolve: {
                        'templates': function (Templates) {
                            var template = Templates.query({});
                            return template.$promise.then(function (data) {
                                return data;
                            });
                        }
                    },
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/reporting-mgmt/ms.reporting-mgmt.templates.list.html`
                })
                .state('templates', {
                    url: "/templates",
                    abstract: true,
                    template: `<div class="app-content-container flex-col-auto" ui-view></div>`
                })
                .state('templates.list', {
                    url: "",
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/reporting-mgmt/ms.reporting-mgmt.templates.list.html`,
                    controller: 'ModuleTemplatesViewCtrl'
                })
                .state('templates.edit', {
                    url: "/:id/edit",
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/reporting-mgmt/ms.reporting-mgmt.templates.edit.html`,
                    controller: 'ModuleTemplatesViewCtrl'
                });
        }
    )
})();
