(function() {
    angular.module('iris_documents').factory('DocumentCollections', function ($resource) {
        return $resource(iris.config.apiUrl + "/documents/collections/:id", {
            id: '@id'
        });
    });

    angular.module('iris_documents')
        .factory('DocumentCollectionService', function (DocumentCollections) {
            return {
                query: (params) => DocumentCollections.query(params).$promise,

                get: (id) => DocumentCollections.get({id}).$promise,

                save: (item) => DocumentCollections.save({id: item.id}, item).$promise,

                create: (params) => new DocumentCollections(params),

                remove: (item) => DocumentCollections.remove({id: item.id}).$promise
            }
        });
})();
