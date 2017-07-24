(function () {
    angular.module('iris_gs_system').controller('ModuleSystemDepartmentsViewCtrl', function ($scope, $translate, $state, $filter,
                                                                                             companies, parent,
                                                                                             DepartmentService) {
        $scope.companyId = $state.params["companyId"] || null;
        $scope.parentId = $state.params["parentId"] || null;

        $scope.goToCompany = function (companyId) {
            $state.go($state.current, {companyId, parentId: null});
        };

        $scope.goToParent = function (parentId) {
            $state.go($state.current, {parentId});
        };

        if (!$scope.companyId && companies.length) {
            $scope.goToCompany(companies[0].id);
        }

        $scope.companies = companies;
        $scope.departments = [];

        parent && (parent.translatedName = $filter("irisTranslate")(parent.name, parent.translations.name));
        $scope.parent = parent;
        $scope.parentArray = [parent];
        $scope.parents = [];

        $scope.parentId && $scope.parent.parents && $scope.parent.parents.length && DepartmentService.queryWithFilter($scope.companyId, [{ f: 'id', v: $scope.parent.parents }]).then(res => {
            $scope.parents = res;
        });

        var requestDepartments = function () {
            $scope.companyId && DepartmentService.queryByParent($scope.companyId, $scope.parentId).then(departments => {
                $scope.departments = departments
            });
        };
        requestDepartments();

        $scope.create = function () {
            $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
            $scope.department = DepartmentService.create({
                parentId: $scope.parentId,
                companyId: $scope.companyId
            });
        };
        $scope.create();

        $scope.save = function () {
            DepartmentService.save($scope.department).then(() => {
                alertify.success($translate.instant('label.SavedSuccessfully'));
                requestDepartments();
                $scope.create();
            });
        };

        $scope.remove = function (item) {
            alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                if (e) {
                    DepartmentService.remove(item.companyId, item.id).then(() => {
                        alertify.success($translate.instant('message.DeleteItemSuccessful'));
                        requestDepartments();
                        $scope.create();
                    });
                }
            });
        };

        $scope.gridOptions = {
            data: 'departments',
            enableFullRowSelection: true,
            enableSelectAll: false,
            selectionRowHeaderWidth: 35,
            multiSelect: false,

            columnDefs: [
                {
                    field: 'name',
                    width: '*',
                    displayName: $translate.instant('label.Name'),
                    cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                {{row.entity.name | irisTranslate:row.entity.translations.name}}
                            </div>`
                },
                {
                    name: 'actions',
                    displayName: $translate.instant('label.Actions'),
                    width: 250,
                    enableSorting: false,
                    cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <button class="btn btn-default" ng-click="grid.appScope.goToParent(row.entity.id)">
                                <i class="fa fa-arrow-right"></i>
                                {{::'label.SubDepartments' | translate}}
                            </button>
                            <button class="btn btn-danger"
                                    uib-tooltip="{{'label.Remove' | translate}}"
                                    ng-click="grid.appScope.remove(row.entity); $event.stopPropagation();">
                                <i class="fa fa-trash-o"></i>
                            </button>
                        </div>`
                }
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridOptions.gridAPI = gridApi;

                gridApi.selection && gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    if ($scope.department && $scope.department.id == row.entity.id) {
                        $scope.create();
                    } else {
                        $scope.department = angular.copy(row.entity);
                    }
                });
            }
        };
    })
})();
