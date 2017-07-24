(function () {
    angular.module('irisForm').controller('IrisFormPropertyRelatedPlansModal',
        function ($scope, $timeout, $uibModalInstance, $translate, plans, selectedPlans) {
            $scope.plans = plans;

            $scope.selectPlans = function () {
                $uibModalInstance.close($scope.gridOptions.gridAPI.selection.getSelectedRows() || []);
            };

            $scope.gridOptions = {
                data: 'plans',

                enableFiltering: true,
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: true,

                columnDefs: [
                    {
                        field: 'planNumber',
                        width: '*',
                        displayName: $translate.instant('label.dpm.PlanNumber')
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    $timeout(() => {
                        plans.forEach(plan => {
                            if (selectedPlans.find(t => t.id == plan.id)) {
                                $scope.gridOptions.gridAPI.selection.selectRow(plan);
                            }
                        });
                    })
                }
            };
        });
})();
