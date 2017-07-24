(function () {
    angular.module('iris_gs_alarming').controller('ModuleSchemesViewCtrl',
        function ($scope, $state, $uibModal, $translate, $timeout, uiGridConstants, AlarmingService, groups, companies, levels, channels, mainIntervalScanners) {
            var refreshReceivers = function() {
                $scope.selectedReceivers = AlarmingService.getReceiversData(groups, false, $scope.item.alarmSchemaNotificationSubscriptions, companies);

                $scope.refreshReceiversGrid();
            };

            $scope.availableAlarmTypes = AlarmingService.getAlarmingTypes();

            $scope.removeReceivers = function() {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        var rows = $scope.gridSelectedReceiversOptions.gridApi.selection.getSelectedRows(),
                            groupsIds = rows.map(row => row.groupId);

                        $scope.item.alarmSchemaNotificationSubscriptions = $scope.item.alarmSchemaNotificationSubscriptions.filter(ns => {
                            return groupsIds.indexOf(ns.userGroup.id) == -1;
                        });

                        $scope.gridSelectedReceiversOptions.gridApi.selection.clearSelectedRows();

                        refreshReceivers();
                    }
                });
            };

            $scope.refreshAllReceivers = function(row, channel) {
                if (channel) {
                    const entity = row.entity;
                    if (entity.channels[channel] === undefined) {
                        entity.channels[channel] = true
                    } else if (typeof(entity.channels[channel]) === 'object') {
                        entity.channels[channel] = false
                    }
                }

                if(row) {
                    row.entity.$$selected = AlarmingService.setSelectedReceiver(row.entity.channels);

                    $scope.gridAllReceiversOptions.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);

                    $timeout(() => {
                        if(row.entity.$$selected) {
                            $scope.gridAllReceiversOptions.gridApi.selection.selectRow(row.entity);
                        } else {
                            $scope.gridAllReceiversOptions.gridApi.selection.unSelectRow(row.entity);
                        }
                    });
                } else {
                    $scope.allReceivers = AlarmingService.getReceiversData(groups, true, $scope.item.alarmSchemaNotificationSubscriptions, companies);

                    $timeout(() => {
                        $scope.gridAllReceiversOptions.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);

                        $scope.gridAllReceiversOptions.gridApi.selection.selectAllRows();
                    }, $scope.gridAllReceiversOptions.gridApi ? 0 : 500);
                }
            };

            $scope.refreshReceiversGrid = function() {
                $timeout(() => {
                    $scope.gridSelectedReceiversOptions.gridApi.core.handleWindowResize();
                    $scope.gridSelectedReceiversOptions.gridApi.core.queueGridRefresh();
                });
            };

            $scope.saveReceivers = function() {
                $scope.item.alarmSchemaNotificationSubscriptions = AlarmingService.getReceiversForSave($scope.allReceivers);

                refreshReceivers();

                $scope.modalInstance.close();

                /*if($scope.item.id) {
                    $scope.saveItem();
                }*/
            };

            $scope.openReceivers = function () {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/alarming/ms.alarming.receivers.edit.html',
                    size: 'lg',
                    scope: $scope
                });

                $scope.modalInstance.opened.then(function() {
                    $scope.refreshAllReceivers();
                });
            };

            $scope.channels = channels;
            $scope.levels = levels;

            $scope.selectedReceivers = [];
            $scope.selectedReceiversCount = 0;
            $scope.gridSelectedReceiversOptions = AlarmingService.getGridSelectedReceiversOptions($scope, 'gridSelectedReceiversOptions', 'selectedReceivers', 'selectedReceiversCount');

            $scope.allReceivers = [];
            $scope.allReceiversCount = 0;
            $scope.gridAllReceiversOptions = AlarmingService.getGridAllReceiversOptions($scope, 'gridAllReceiversOptions', 'allReceivers', 'allReceiversCount');
            // ---

            $scope.$parent.setItem = function(item) {
                $scope.conditionsFields = AlarmingService.getConditionsFields(item.conditions || []);
                $scope.conditionsData = AlarmingService.getConditionsData($scope.conditionsFields);

                $scope.$parent.item = item;

                $timeout(() => angular.element('[autofocus] input[type="text"]').focus());

                refreshReceivers();
            };

            $scope.$parent.removeItem = function(item) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        var loaderPath = '.app-content';
                        iris.loader.start(loaderPath);

                        AlarmingService.removeScheme(item.device.id, item.id).then(response => {
                            iris.loader.stop(loaderPath);

                            alertify.success($translate.instant('label.Alarming.AlarmingSchemeRemoved'));

                            $scope.getItems(AlarmingService.getSchemes);

                            $scope.setNewItem();
                        });
                    }
                });
            };

            $scope.$parent.editFullItem = function(item) {
                $state.go('module.scheme', { deviceId: item.device.id, schemeId: item.id }, { reload: true });
            };

            $scope.$parent.copyItem = function(srcItem) {
                var item = angular.copy(srcItem);

                delete item.id;

                $scope.setItem(item);

                $scope.saveItem('label.Alarming.AlarmingSchemeCopied', response => {
                    $scope.items.unshift(response);

                    var gridApi = $scope.gridOptions.gridApi;

                    gridApi.selection.clearSelectedRows();
                    gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);

                    $timeout(() => {
                        var rows = gridApi.core.getVisibleRows(),
                            rowIndex;

                        rows.some((row, index) => {
                            var result = false;

                            if(row.entity.id == response.id) {
                                result = true;

                                rowIndex = index;
                            }

                            return result;
                        });

                        if(angular.isDefined(rowIndex)) {
                            var entity = rows[rowIndex].entity;

                            $scope.setItem(entity);

                            gridApi.selection.selectRow(entity, {});
                            gridApi.core.scrollTo(entity);
                        }
                    });
                });
            };

            $scope.saveItem = function (labelSuccess, callback) {
                labelSuccess = labelSuccess || 'label.Alarming.AlarmingSchemeSaved';

                var loaderPath = '.app-content';
                iris.loader.start(loaderPath);

                AlarmingService.saveScheme($scope.item, $scope.conditionsFields, $scope.conditionsData).then(response => {
                    iris.loader.stop(loaderPath);

                    alertify.success($translate.instant(labelSuccess));

                    if(angular.isFunction(callback)) {
                        callback(response);
                    } else {
                        $scope.getItems(AlarmingService.getSchemes);
                        $scope.setNewItem();
                    }
                }, function() {
                    iris.loader.stop(loaderPath);
                });
            };

            $scope.eval = function(expr) {
                if(angular.isString(expr)){
                    return $scope.$eval(expr);
                }
            };

            $scope.gridOptions.columnDefs = [
                {
                    field: 'id',
                    width: 50,
                    displayName: $translate.instant('label.Id')
                },
                {
                    field: 'name',
                    width: 150,
                    displayName: $translate.instant('label.Name')
                },
                {
                    field: 'alarmSchemaType',
                    width: 150,
                    displayName: $translate.instant('label.Type'),
                    cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            {{::'label.AlarmSchemaType.' + row.entity.alarmSchemaType | translate}}
                        </div>`
                },
                {
                    field: 'description',
                    width: '*',
                    displayName: $translate.instant('label.Description')
                },
                {
                    field: 'alarmSchemaNotificationSubscriptions',
                    width: '*',
                    displayName: $translate.instant('label.Alarming.Receivers'),
                    cellFilter: 'alarmingReceiversFilter:grid.appScope.groups'
                },
                {
                    field: 'active',
                    width: 60,
                    displayName: $translate.instant('label.Active'),
                    cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <i class="fa fa-check" ng-if="row.entity.active"></i>
                        </div>`
                },
                {
                    name: 'actions',
                    displayName: $translate.instant('label.Actions'),
                    width: 150,
                    enableSorting: false,
                    cellTemplate: `<div class="ui-grid-cell-contents actions">
                        <button class="btn btn-link"
                                uib-tooltip="{{'label.Edit' | translate}}"
                                ng-click="grid.appScope.editFullItem(row.entity, $event);">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="btn btn-link"
                                uib-tooltip="{{'label.Copy' | translate}}"
                                ng-click="grid.appScope.copyItem(row.entity); $event.stopPropagation();">
                            <i class="fa fa-copy"></i>
                        </button>
                        <button class="btn btn-link"
                                uib-tooltip="{{'label.Remove' | translate}}"
                                ng-click="grid.appScope.removeItem(row.entity); $event.stopPropagation();">
                            <i class="fa fa-trash-o"></i>
                        </button>
                    </div>`
                }
            ];

            $scope.hasMainIntervalScanners = !!mainIntervalScanners.length;

            $scope.$parent.groups = {};
            angular.forEach(groups, group => {
                $scope.$parent.groups[group.id] = group;
            });

            $scope.getItems(AlarmingService.getSchemes);
            $scope.setNewItem();
        });

        angular.module('iris_gs_alarming').filter('alarmingReceiversFilter', function() {
            return function(ns, groups) {
                var groupTitles = [],
                    groupIds = [];

                angular.forEach(ns, scheme => {
                    if(groupIds.indexOf(scheme.userGroup.id) == -1) {
                        var group = groups[scheme.userGroup.id];

                        if(group) {
                            groupTitles.push(group.name);
                        }

                        groupIds.push(scheme.userGroup.id);
                    }
                });

                return groupTitles.join(', ');
            };
        })
})();
