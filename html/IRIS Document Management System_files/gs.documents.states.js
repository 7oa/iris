(function() {

    'use strict';

    angular.module('iris_gs_documents_states', []);
    
    angular.module('iris_gs_documents_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.documents', {
                    url: '/documents',
                    controller: function() {},
                    template: `<div class="b-content b-window flex-grid" ui-view></div>`
                })
                .state('module.documents.collections', {
                    url: '/collections',
                    controller: 'ModuleDocumentsCollectionsCtrl',
                    resolve: {
                        'modules': function($translate, AdminModulesService) {
                            return AdminModulesService.getAdminModules().then(res => {
                                return res.map(t => {
                                    return {
                                        id: t.module.moduleCode,
                                        name: $translate.instant(t.module.i18nLabel)
                                    };
                                });
                            });
                        }
                    },
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/documents/ms.documents.collections.html`
                })
                .state('module.documents.forms', {
                    url: '/forms',
                    controller: 'ModuleDocumentsFormsCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/documents/ms.documents.forms.html`
                })
                .state('module.documents.forms.structure', {
                    url: '/:formId/structure',
                    controller: 'ModuleDocumentsFormsStructureCtrl',
                    resolve: {
                        'form': function($stateParams, DocumentFormService) {
                            return DocumentFormService.get($stateParams['formId']);
                        }
                    },
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/documents/ms.documents.forms.structure.html`
                })
                .state('module.documents.templates', {
                    url: '/project/:projectId/templates',
                    resolve: {
                        'projects': function (ProjectsService) {
                            return ProjectsService.getProjects();
                        },
                        'forms': function (DocumentFormService) {
                            return DocumentFormService.queryNotSubform();
                        },
                        'collectionNames': function (DocumentCollectionService) {
                            return DocumentCollectionService.query();
                        },
                        'workflows': function (WorkflowService, $stateParams) {
                            if($stateParams.projectId === '-' || !$stateParams.projectId) return [];
                            return WorkflowService.getWorkflows($stateParams.projectId);
                        },
                        'agents': function (ProgramAgentsService) {
                            return ProgramAgentsService.query();
                        }
                    },
                    controller: 'ModuleDocumentsTemplatesCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/documents/ms.documents.templates.html`
                });
        }
    )
})();
