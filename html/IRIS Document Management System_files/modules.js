(function () {
    angular.module('iris_modules', []);

    angular.module('iris_modules').factory('Modules', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/modules");
    });

    angular.module('iris_modules').factory('ModuleService',
        function (Modules, $translate) {
            var modules = Modules.query({}, function (values) {
                for (var i = 0, c = values.length; i < c; i++) {
                    var module = values[i];
                    module.name = $translate.instant(module.i18nLabel);
                }
                console.log(values)
                return values;
            });

            var adminModules = iris.data.adminModules || [];
            adminModules.forEach(m => {
                m.module.enabled = m.irisModule.enabled;
                m.module.name = $translate.instant(m.module.i18nLabel);
            });
            adminModules = adminModules.map(m => m.module);

            return {
                getModules: function () {
                    return modules;
                },
                getActiveModules: function () {
                    return adminModules.filter(m => m.enabled);
                }
            }
        });

})();