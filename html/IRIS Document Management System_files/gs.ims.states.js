(function() {

    'use strict';

    angular.module('iris_gs_ims_states', []);
    
    angular.module('iris_gs_ims_states').config(
        function ($stateProvider) {
            $stateProvider
                // .state('module.ims', {
                //     url: '/ims/project/:projectId',
                //     resolve: {
                //         'projects': function (ProjectsService) {
                //             return ProjectsService.getProjects();
                //         }
                //     },
                //     controller: 'ModuleProjectsBaseCtrl',
                //     template: `<div class="b-content b-window flex-grid" ui-view></div>`
                // })
                .state('module.ims', {
                    url: '/ims',
                    controller: function() {},
                    template: `<div class="b-content b-window flex-grid" ui-view></div>`
                })
                .state('module.ims.general', {
                    url: '/project/:projectId/general',
                    controller: 'ModuleImsGeneralViewCtrl',
                    resolve: {
                        'workflows': WorkflowService => WorkflowService.getAllWorkflowsByType('PROJECT')
                    },
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/ims/ms.ims.general.html`
                })
                .state('module.ims.landing-page', {
                    url: '/landing-page',
                    resolve: {
                        'documentCollections': function (DocumentCollectionService) {
                            return DocumentCollectionService.query();
                        }
                    },
                    controller: 'ModuleImsLandingPageViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/ims/ms.ims.landing-page.html`
                });
        }
    )
})();
