(function() {
    irisAppDependencies.add('iris_jack_configurations');

    angular.module('iris_jack_configurations', []);

    angular.module('iris_jack_configurations').factory('JackConfigurations', function ($resource) {
        return $resource(iris.config.apiUrl + "/construction/devices/:deviceId/jack-configuration/:id", {
            id: '@id',
            deviceId: '@deviceId'
        });
    });

    angular.module('iris_jack_configurations')
        .factory('JackConfigurationService', function (JackConfigurations) {
            return {
                getJackConfigurations: deviceId => JackConfigurations.query({deviceId:deviceId}).$promise,

                getJackConfiguration: (deviceId, id) => JackConfigurations.get({deviceId:deviceId, id: id}).$promise,

                saveJackConfiguration: jackConfiguraration => JackConfigurations.save(jackConfiguraration).$promise,

                createJackConfiguration: params => new JackConfigurations(params),

                removeJackConfiguration: jackConfiguraration => JackConfigurations.remove({
                    deviceId: jackConfiguraration.deviceId,
                    id: jackConfiguraration.id
                }).$promise
            }
        });

})();
