(function() {
    angular.module('iris_documents').factory('DocumentForms', function ($resource) {
        return $resource(iris.config.apiUrl + "/documents/forms/:id", {
            id: '@id'
        });
    });

    angular.module('iris_documents').factory('DocumentFormsStructures', function ($resource) {
        return $resource(iris.config.apiUrl + "/documents/forms/:id/structure", {
            id: '@id'
        });
    });

    angular.module('iris_documents')
        .factory('DocumentFormService', function (DocumentForms, DocumentFormsStructures) {
            function query(filter) {
                filter || (filter = {});
                return DocumentForms.query({filter: angular.toJson(filter)}).$promise;
            }

            return {
                query,
                queryNotSubform: () => query([{f: 'isSubform', v: [false]}]),

                get: (id) => DocumentForms.get({id}).$promise,

                save: (item) => DocumentForms.save({id: item.id}, item).$promise,

                create: (params) => new DocumentForms(params),

                remove: (item) => DocumentForms.remove({id: item.id}).$promise,

                saveStructure: (id, structure) => DocumentFormsStructures.save({id}, structure).$promise,
            }
        });
})();
