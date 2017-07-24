(function() {

    'use strict';

    angular.module('iris_gs_dpm_states', []);
    
    angular.module('iris_gs_dpm_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.dpm', {
                    url: '/dpm/project/:projectId',
                    resolve: {
                        'projects': (ProjectsService) => ProjectsService.getPreloadedProjects()
                    },
                    controller: 'ModuleProjectsBaseCtrl',
                    template: `<div class="b-content b-window flex-grid" ui-view></div>`
                })
                .state('module.dpm.general', {
                    url: '/general',
                    controller: 'ModuleDpmGeneralViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/dpm/ms.dpm.general.html`,
                    resolve: {
                        'importAgents': function (ProgramAgentsService) {
                            return ProgramAgentsService.queryWithFilter([{f:"isFile", v:true}]);
                        },
                        'printTemplates': function(ReportsService) {
                            return ReportsService.getTemplates();
                        }
                    }
                })
                .state('module.dpm.protocol-templates', {
                    url: '/protocol-templates?filter',
                    controller: 'ModuleDpmProtocolTemplatesCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/dpm/ms.dpm.protocol-templates.html`
                })
                .state('module.dpm.protocol-templates.header', {
                    url: '/:protocolTemplateId/header',
                    controller: 'ModuleDpmProtocolTemplatesStructureCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/dpm/ms.dpm.protocol-templates.header.html`
                })
                .state('module.dpm.protocol-templates.body', {
                    url: '/:protocolTemplateId/body',
                    controller: 'ModuleDpmProtocolTemplatesStructureCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/dpm/ms.dpm.protocol-templates.body.html`
                });
        }
    )
})();
