(function() {
    
    irisAppDependencies.add('iris_admin_modules');

    angular.module('iris_admin_modules', []);

    angular.module('iris_admin_modules').factory('AdminModules', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/modules/all/:code/:action", {
            code: '@code',
            action: '@action'
        },{
            toggleEnabled: {
                method: 'POST',
                params: {action: 'toggle-enabled'}
            }
        });
    });

    angular.module('iris_admin_modules').factory('AdminModulesService',
        function ($filter, AdminModules) {
            return {
                getAdminModules: function(){
                    return AdminModules.query().$promise;
                },

                toggleEnabled: function (module) {
                    return AdminModules.toggleEnabled(module).$promise;
                }

            }
        });



    angular.module('iris_admin_modules').factory('UserTokens', function ($resource) {
        return $resource(iris.config.apiUrl + "/security/user/:user_id/access-tokens/:id", {
            id: '@id',
            user_id: '@user_id'
        }, {
            getTokensForUser: {
                method: "GET",
                url: iris.config.apiUrl + "/security/user/:user_id/access-tokens",
                isArray: true
            },
            createTokenForUser: {
                method: "POST",
                url: iris.config.apiUrl + "/security/user/:user_id/access-tokens"
            }
        });
    });

    angular.module('iris_admin_modules').factory('UserTokensService',
        function (UserTokens) {
            return {
                getTokensForUser: (userId) => UserTokens.getTokensForUser({user_id: userId}).$promise,

                updateToken: token => UserTokens.save(token).$promise,

                createToken: (userId) => UserTokens.createTokenForUser({user_id: userId}).$promise,

                deleteToken: token => UserTokens.remove({user_id: token.userId, id: token.id}).$promise,
            }
        });

    angular.module('iris_admin_modules').factory('RestrictionsResource', function($resource) {
        return $resource(`${iris.config.apiUrl}/security/system/restrictions/:action/:value`, {})
    });

    angular.module('iris_admin_modules').factory('RestrictionsService', function(RestrictionsResource) {
        return {
            get() {
                return RestrictionsResource.get().$promise
            },

            save(config) {
                return RestrictionsResource.save(config).$promise
            }
        }
    });
})();

