(function () {
    angular.module('iris_gs_reporting_mgmt').controller('ModuleTemplatesViewCtrl',
        function ($scope, $state, $stateParams, $filter, $translate, Templates, PageSizes, ReportsService) {
            $scope.pageSizeOptions = PageSizes;
            $scope.pageOrientationOptions = ReportsService.getPageOrientations();
            $scope.forms = {};
            ($scope.refreshTemplates = function () {
                $scope.templates = Templates.query();
            })();

            if ($state.is('templates.add')) {
                $scope.template = new Templates({
                    pageSize: 'A4',
                    pageOrientation: 'portrait',
                    margin_top: 0,
                    margin_right: 0,
                    margin_bottom: 0,
                    margin_left: 0,
                    header_height: 100,
                    footer_height: 100
                });
            } else {
                $scope.templates.$promise.then(function () {
                    $scope.origin_template = $filter('filter')($scope.templates, {id: +$stateParams.id}, true)[0];
                    $scope.template = angular.copy($scope.origin_template);
                });
            }
            $scope.subjects = [];

            $scope.save = function () {
                Templates.save({}, $scope.template, function (value) {
                    alertify.success($translate.instant('text.TemplateSaved'));
                    if ($state.is('templates.add')) {
                        $scope.templates.push(value);
                    } else {
                        angular.extend($scope.origin_template, value);
                    }
                    $state.go('templates.list');
                });
            };

            $scope.remove = function (t) {
                alertify.confirm($translate.instant("text.RemoveTemplateConfirm"), function (e) {
                    if (e) {
                        t.$remove({}, function () {
                            alertify.success($translate.instant('text.TemplateRemoved'));
                            $scope.refreshTemplates();
                        });
                    }
                });
            };

            $scope.createTemplate = function () {
                $scope.template = new Templates({
                    pageSize: 'A4',
                    pageOrientation: 'portrait',
                    margin_top: 0,
                    margin_right: 0,
                    margin_bottom: 0,
                    margin_left: 0,
                    header_height: 100,
                    footer_height: 100
                });
                $state.go('templates.edit');
            };

            $scope.gridOptions = {
                data: 'templates',
                enableFullRowSelection: false,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'id',
                        width: '40',
                        displayName: 'ID'
                    },
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name')
                    },
                    {
                        field: 'updatedOn',
                        width: '*',
                        displayName: $translate.instant('label.UpdatedOn'),
                        cellFilter: 'irisTime:grid.appScope:"@{datetime}"'
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: '150',
                        enableSorting: false,
                        cellTemplate: `<div class="ui-grid-cell-contents actions">
                                            <a ui-sref="templates.edit({id:row.entity.id})"
                                                class="btn btn-sm btn-default" uib-tooltip="{{'label.Edit' | translate}}">
                                                <i class="fa fa-pencil"></i>
                                            </a>
                                            <button ng-if="!(row.entity.isBundle && !row.entity.id)" class="btn btn-danger" ng-click="row.entity.isBundle ? grid.appScope.removeBundle(row.entity.id) : grid.appScope.remove(row.entity)" uib-tooltip="{{'label.Remove' | translate}}">
                                                <i class="fa fa-trash-o"></i>
                                            </button>                
                                        </div>`
                    }
                ]
            };
        });
})();