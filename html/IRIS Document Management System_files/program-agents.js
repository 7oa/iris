(function() {
    irisAppDependencies.add('iris_program_agents');

    angular.module('iris_program_agents', []);

    angular.module('iris_program_agents').factory('ProgramAgents', function ($resource) {
        return $resource(iris.config.apiUrl + "/agents/:id", {
            id: '@id'
        });
    });

    angular.module('iris_program_agents').factory('ProgramAgentsIntegration', function ($resource) {
        return $resource(iris.config.apiUrl + "/integration/agents-debug/run/:id", {
            id: '@id'
        }, {
            save: {
                method: 'post',
                transformResponse(response) {
                    return {result: response}
                }
            }
        });
    });

    angular.module('iris_program_agents')
        .factory('ProgramAgentsService', function ($translate, ProgramAgents, ProgramAgentsIntegration) {
            var types = [
                { id: "IMPORT", name: $translate.instant("label.Import") }
            ];

            var modules = [
                { id: "MODULE", name: $translate.instant("label.Module") }
            ];

            var methods = [
                { id: "POST", name: "POST" },
                { id: "GET", name: "GET" },
                { id: "DELETE", name: "DELETE" }
            ];

            function query(params) {
                return ProgramAgents.query(params).$promise;
            }

            return {
                query,

                queryWithFilter: (filter) => query({filter: angular.toJson(filter)}),

                get: (id) => ProgramAgents.get({id: id}).$promise,

                save: agent => ProgramAgents.save(agent).$promise,

                create: params => new ProgramAgents(params),

                remove: agent => ProgramAgentsIntegration.remove({id: agent.id}).$promise,

                run: function(agent, body, params) {
                    params.id = agent.id;
                    return ProgramAgentsIntegration.save(params, body).$promise
                },

                getTypes: () => types,
                getModules: () => modules,
                getMethods: () => methods
            }
        });
})();