(function () {
    angular.module('iris_taskmanagement').factory('Tags', function ($resource) {
        return $resource(iris.config.apiUrl + '/tags/:id', {
            id: '@id'
        });
    });

    angular.module('iris_taskmanagement')
        .factory('TagsService', function ($translate, Tags) {
            return {
                getTags: (params) => {
                    params = params || {};
                    params.filter = params.filter || [];
                    params.filter.push({f: "type", v: ["Tag"]});
                    params.filter = angular.toJson(params.filter);
                    return Tags.query(params).$promise
                },

                getCustomTags: (params) => {
                    params = params || {};
                    return Tags.query(params).$promise
                },

                getTag: id => Tags.get({id}).$promise,

                saveTag: tag => Tags.save(tag).$promise,

                createTag: params => new Tags(params),

                removeTag: tag => Tags.remove({id: tag.id}).$promise
            }
        });
})();