(function() {
    angular.module('iris_documents').factory('Document', function ($resource) {
        return $resource(iris.config.apiUrl + "/documents/projects/:projectId/document-collections/:collectionAlias/documents/:documentId/:action/:actionParam", {
            projectId: '@projectId',
            collectionAlias: '@collectionAlias',
            documentId: '@documentId',
            action: '@action',
            actionParam: '@actionParam'
        }, {
            count: {
                method: "GET",
                url: iris.config.apiUrl + "/documents/projects/:projectId/document-collections/:collectionAlias/documents/count"
            },
            setState: {
                method: "POST",
                params: {action: "set-state"}
            },
            getHistoryList: {
                method: "GET",
                params: {action: "versions"},
                isArray: true
            }
        });
    });

    angular.module('iris_documents')
        .factory('DocumentService', function ($uibModal, Document) {
            return {
                query: (projectId, collectionAlias, params) => {
                    params = params || {};
                    angular.extend(params, {
                        projectId: projectId,
                        collectionAlias: collectionAlias
                    });
                    params['order-by'] || (params['order-by'] = angular.toJson([{
                        name: 'updatedOn',
                        value: 'desc'
                    }]));
                    return Document.query(params).$promise;
                },

                queryByDocumentTemplate: (projectId, collectionAlias, documentTemplateId) => {
                    var params =  {
                        projectId: projectId,
                        collectionAlias: collectionAlias,
                        filter: angular.toJson([{ f: "meta.documentTemplateId", v: [documentTemplateId] }])
                    };
                    return Document.query(params).$promise;
                },

                count: (projectId, collectionAlias, filter) => {
                    filter = filter || {};
                    angular.extend(filter, {
                        projectId: projectId,
                        collectionAlias: collectionAlias
                    });
                    return Document.count(filter).$promise;
                },

                get: (projectId, collectionAlias, documentId) => Document.get({projectId, collectionAlias, documentId}).$promise,

                save: (projectId, collectionAlias, item) => Document.save({projectId, collectionAlias, documentId: item.documentId}, item).$promise,

                create: (params) => new Document(params),
                createByTemplate: (documentTemplate) => new Document({
                    header: documentTemplate.headerDocumentFormStructure,
                    headerData: documentTemplate.headerData,
                    body: documentTemplate.bodyDocumentFormStructure,
                    bodyData: documentTemplate.bodyData,
                    meta: {
                        documentTemplateId: documentTemplate.id,
                        projectId: documentTemplate.projectId,
                        workflowId: documentTemplate.workflowId,
                    }
                }),

                remove: (projectId, collectionAlias, item) => Document.remove({projectId, collectionAlias, documentId: item.documentId}).$promise,

                setState: (projectId, collectionAlias, item, newStateAlias) => {
                    return Document.setState({projectId, collectionAlias, actionParam: newStateAlias}, item).$promise;
                },

                openDocumentModal: (document, options) => {
                    return $uibModal.open({
                        templateUrl: iris.config.baseUrl + '/common/components/documents/templates/document.modal.html',
                        size: 'lg',
                        resolve: {
                            'document': () => angular.copy(document),
                            'options': () => options,
                        },
                        controller: 'DocumentModalCtrl'
                    }).result;
                },

                getHistoryList: (projectId, collectionAlias, item) => {
                    return Document.getHistoryList({projectId, collectionAlias, documentId: item.documentId}).$promise;
                }
            }
        });
})();
