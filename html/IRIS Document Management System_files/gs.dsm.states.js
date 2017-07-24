(function() {

    'use strict';

    angular.module('iris_gs_dsm_states', []);
    
    angular.module('iris_gs_dsm_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.dsm', {
                    url: '/dsm/project/:projectId',
                    resolve: {
                        'projects': function (ProjectsService) {
                            return ProjectsService.getProjects();
                        }
                    },
                    controller: 'ModuleProjectsBaseCtrl',
                    template: `<div class="b-content b-window flex-grid" ui-view></div>`
                })
                .state('module.dsm.general', {
                    url: '/general',
                    controller: 'ModuleDsmGeneralViewCtrl',
                    resolve: {
                        'documentCollections': function (DocumentCollectionService) {
                            return DocumentCollectionService.query();
                        }
                    },
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/dsm/ms.dsm.general.html`
                });
        }
    )
})();
