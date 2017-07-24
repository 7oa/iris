(function() {
    irisAppDependencies.add('iris_building');

    angular.module('iris_building', []);

    angular.module('iris_building').factory('Buildings', function ($resource) {
        return $resource(iris.config.apiUrl + "/construction/buildings/:id", {
            id: '@id'
        });
    });

    angular.module('iris_building')
        .factory('BuildingService', function ($translate, $uibModal, Buildings) {
            var buildingTypes = [{
                id: 'TUNNEL',
                name: $translate.instant('label.Tunnel')
            }, {
                id: 'RING',
                name: $translate.instant('label.Ring')
            }, {
                id: 'SEGMENT',
                name: $translate.instant('label.Segment')
            }, {
                id: 'STORAGE',
                name: $translate.instant('label.Storage')
            }];

            function query(filter, params) {
                filter = filter || [];
                filter = angular.toJson(filter);
                params = params || {};
                params.filter = filter;
                params['order-by'] = angular.toJson([{"name":"order","value":"desc"}]);
                return Buildings.query(params).$promise
            }

            return {
                queryByParams: (params) => Buildings.query(params).$promise,

                query,

                queryByParent: (parentId) => {
                    var filter = [
                        { f: 'parentId', v: [parentId] }
                    ];
                    return query(filter);
                },

                queryByType: (type) => {
                    var filter = [
                        { f: 'type', v: Array.isArray(type) ? type : [type] }
                    ];
                    return query(filter);
                },

                queryByParentAndType: (parentId, type) => {
                    var filter = [
                        { f: 'parentId', v: [parentId] },
                        { f: 'type', v: Array.isArray(type) ? type : [type] }
                    ];
                    return query(filter);
                },

                get: (id) => Buildings.get({id}).$promise,

                save: (item) => Buildings.save({id: item.id}, item).$promise,

                create: (params) => new Buildings(params),

                remove: (item) => Buildings.remove({id: item.id}).$promise,

                getBuildingTypes: () => buildingTypes,

                selectProjectBuildingModal: () => {
                    return $uibModal.open({
                        templateUrl: `${iris.config.componentsUrl}/buildings/templates/select.project-building.modal.html`,

                        controller: function($scope, $uibModalInstance) {
                            $scope.projectId = null;
                            $scope.buildingId = null;

                            $scope.select = function() {
                                $uibModalInstance.close($scope.buildingId);
                            }
                        }
                    }).result;
                }
            }
        });
})();
