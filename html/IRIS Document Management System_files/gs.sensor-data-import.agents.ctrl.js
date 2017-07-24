(function () {
    angular.module('iris_gs_sensor_data_import').controller('ModuleAgentsViewCtrl',
        function ($scope, $translate, $state, $uibModal, ProgramAgentsService) {
            $scope.agents = [];
            $scope.types = ProgramAgentsService.getTypes();
            $scope.modules = ProgramAgentsService.getModules();

            $scope.requestList = function () {
                ProgramAgentsService.query().then(res =>  {
                    $scope.agents = res;
                });
            };
            $scope.requestList();

            $scope.add = function () {
                $state.go('module.sensor-data-import.agents.edit', {id: 'add'});
            };

            $scope.edit = function (agent) {
                $state.go('module.sensor-data-import.agents.edit', {id: agent.id});
            };

            $scope.remove = function (agent) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        ProgramAgentsService.remove(agent).then(() => {
                                alertify.success($translate.instant('message.DeleteItemSuccessful'));
                                $scope.requestList();
                            }
                        );
                    }
                });
            };

            $scope.execute = function(agent) {
                $state.go('module.sensor-data-import.agents.run', {id: agent.id});
            };

            $scope.gridOptions = {
                data: 'agents',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name')
                    },
                    {
                        field: 'type',
                        width: '*',
                        displayName: $translate.instant('label.Type'),
                        cellFilter: 'IrisFilterField:[grid.appScope.types]'
                    },
                    {
                        field: 'module',
                        width: '*',
                        displayName: $translate.instant('label.Module'),
                        cellFilter: 'IrisFilterField:[grid.appScope.modules]'
                    },
                    {
                        field: 'urlSuffix',
                        width: '*',
                        displayName: $translate.instant('label.agents.UrlSuffix')
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 150,
                        enableSorting: false,
                        cellTemplate: `<div class="ui-grid-cell-contents">
                            <button class="btn btn-default" ng-click="grid.appScope.execute(row.entity)" uib-tooltip="{{'label.Execute' | translate}}">
                                <i class="fa fa-play"></i>
                            </button>
                            <button class="btn btn-default" ng-click="grid.appScope.edit(row.entity)" uib-tooltip="{{'label.Edit' | translate}}">
                                <i class="fa fa-pencil"></i>
                            </button>
                            <button class="btn btn-danger" ng-click="grid.appScope.remove(row.entity)" uib-tooltip="{{'label.Delete' | translate}}">
                                <i class="fa fa-trash-o"></i>
                            </button>
                        </div>`
                    }
                ]
            };
        })
})();
