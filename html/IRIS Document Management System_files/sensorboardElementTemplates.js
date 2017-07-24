(function () {
    //irisAppDependencies.add('iris_sensorboards');

    //angular.module('iris_sensorboards', []);

    angular.module('iris_sensorboards').factory('SensorboardElementTemplates', function ($resource) {
        return $resource(iris.config.apiUrl + "/sensorboards/element-templates/:id", {id: '@id'});
    });

    angular.module('iris_sensorboards').factory('SensorboardElementTemplatesService',
        function (SensorboardElementTemplates) {
            return {
                query: () => SensorboardElementTemplates.query().$promise,

                get: (id) => SensorboardElementTemplates.get({id: id}).$promise,

                save: (elementTemplate) => SensorboardElementTemplates.save(elementTemplate).$promise,

                create: (params) => new SensorboardElementTemplates(params),

                remove: (elementTemplate) => SensorboardElementTemplates.remove({id: elementTemplate.id}).$promise
            };
        });
})();
