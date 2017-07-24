(function () {

    angular.module('iris_gs_base_view', []);
    
    angular.module('iris_gs_base_view').controller('UserSettingsBaseViewCtrl',
        function ($scope, $stateParams, $translate, UserSettingsService, GlobalSettingsService, UserService) {
            $scope.users = UserService.getUsers();

            $scope.updateSettingsList = function () {
                UserSettingsService.getUserSettingsList($stateParams.settings).then(function (data) {
                    $scope.settings_list = data;
                });
            };
            $scope.updateSettingsList();

            $scope.gridOptions = {
                data: 'settings_list',
                headerRowHeight: 60,
                columnDefs: [
                    {
                        name: '#',
                        displayName: '#',
                        width: 40,
                        enableSorting: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{rowRenderIndex + 1}}</div>'
                    }, {
                        name: 'id',
                        width: 40
                    }, {
                        field: 'userId',
                        displayName: $translate.instant('label.User'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.userId != null ? (row.entity.userId | IrisFilterField:[grid.appScope.users,\'email\']) : (\'label.Default\' | translate)}}</div>'
                    }, {
                        name: 'actions',
                        width: 150,
                        displayName: $translate.instant('label.Actions'),
                        enableSorting: false,
                        cellTemplate: `
                            <div class="ui-grid-cell-contents actions">
                                <a href="javascript:void(0)" ng-click="grid.appScope.openModuleSettingsModal(row)" class="btn btn-default">
                                    <i class="fa fa-pencil"></i> {{'label.Edit' | translate}}
                                </a>
                                <button class="btn btn-danger" ng-click="grid.appScope.remove(row.entity)" ng-if="row.entity.id > 0" uib-tooltip="{{row.entity.userId ? 'label.Remove' : 'label.Reset' | translate}}">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`
                    }
                ],
                rowTemplate: `<div iris-ui-grid-row></div>`,
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;
                }
            };

            $scope.onDblClick = function (row) {
                $scope.openModuleSettingsModal(row);
            };

            $scope.remove = function (settings) {
                alertify.confirm($translate.instant(settings.userId ? 'message.DeleteItemConfirm' : 'message.ResetItemConfirm'), function (e) {
                    if (e) {
                        iris.loader.start();
                        UserSettingsService.removeUserSettings($stateParams.settings, settings).then(function () {
                            iris.loader.stop();
                            alertify.success($translate.instant(settings.userId ? 'message.DeleteItemSuccessful' : 'message.ResetItemSuccessful'));
                            $scope.updateSettingsList();
                        });
                    }
                });
            }
        });

    angular.module('iris_gs_base_view').controller('DeviceSettingsBaseViewCtrl',
        function ($scope, $stateParams, $translate, DeviceSettingsService, GlobalSettingsService, DevicesService) {
            $scope.devices = DevicesService.getDevices();

            $scope.updateSettingsList = function () {
                DeviceSettingsService.getDeviceSettingsList($stateParams.settings).then(function (data) {
                    $scope.settings_list = data;
                });
            };
            $scope.updateSettingsList();

            $scope.gridOptions = {
                data: 'settings_list',
                enablePaginationControls: false,
                paginationPageSize: 10,
                showGridFooter: true,
                columnDefs: [
                    {
                        name: '#',
                        displayName: '#',
                        width: 40,
                        enableSorting: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{rowRenderIndex + 1}}</div>'
                    }, {
                        name: 'id',
                        width: 40
                    }, {
                        field: 'deviceId',
                        displayName: $translate.instant('label.Device'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.deviceId != null ? (row.entity.deviceId | IrisFilterField:[grid.appScope.devices,\'name\']) : (\'label.Default\' | translate)}}</div>'
                    }, {
                        name: 'actions',
                        width: 150,
                        displayName: $translate.instant('label.Actions'),
                        enableSorting: false,
                        cellTemplate: `
                            <div class="ui-grid-cell-contents actions">
                                <a href="javascript:void(0)" ng-click="grid.appScope.openModuleSettingsModal(row)" class="btn btn-default">
                                    <i class="fa fa-pencil"></i> {{'label.Edit' | translate}}
                                </a>
                                <button class="btn btn-danger" ng-click="grid.appScope.remove(row.entity)" ng-if="row.entity.id > 0" uib-tooltip="{{row.entity.deviceId ? 'label.Remove' : 'label.Reset' | translate}}">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`
                    }
                ],
                rowTemplate: "<div ng-dblclick=\"grid.appScope.onDblClick(row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell ></div>",
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;
                }
            };

            $scope.onDblClick = function (row) {
                $scope.openModuleSettingsModal(row);
            };

            $scope.remove = function (settings) {
                alertify.confirm($translate.instant(settings.deviceId ? 'message.DeleteItemConfirm' : 'message.ResetItemConfirm'), function (e) {
                    if (e) {
                        iris.loader.start();
                        DeviceSettingsService.removeDeviceSettings($stateParams.settings, settings).then(function () {
                            iris.loader.stop();
                            alertify.success($translate.instant(settings.deviceId ? 'message.DeleteItemSuccessful' : 'message.ResetItemSuccessful'));
                            $scope.updateSettingsList();
                        });
                    }
                });
            }
        });

    angular.module('iris_gs_base_view').controller('ProjectSettingsBaseViewCtrl',
        function ($scope, $stateParams, $translate, ProjectSettingsService, GlobalSettingsService, ProjectsService) {
            $scope.projects = ProjectsService.getProjects();

            $scope.updateSettingsList = function () {
                ProjectSettingsService.getProjectSettingsList($stateParams.settings).then(function (data) {
                    $scope.settings_list = data;
                });
            };
            $scope.updateSettingsList();

            $scope.gridOptions = {
                data: 'settings_list',
                columnDefs: [
                    {
                        name: '#',
                        displayName: '#',
                        width: 40,
                        enableSorting: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{rowRenderIndex + 1}}</div>'
                    }, {
                        name: 'id',
                        width: 40
                    }, {
                        field: 'projectId',
                        displayName: $translate.instant('label.Project'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.projectId != null ? (row.entity.projectId | IrisFilterField:[grid.appScope.projects,\'name\']) : (\'label.Default\' | translate)}}</div>'
                    }, {
                        name: 'actions',
                        width: 150,
                        displayName: $translate.instant('label.Actions'),
                        enableSorting: false,
                        cellTemplate: `
                            <div class="ui-grid-cell-contents actions">
                                <a href="javascript:void(0)" ng-click="grid.appScope.openModuleSettingsModal(row)" class="btn btn-default">
                                    <i class="fa fa-pencil"></i> {{'label.Edit' | translate}}
                                </a> 
                                <button class="btn btn-danger" ng-click="grid.appScope.remove(row.entity)" ng-if="row.entity.id > 0" uib-tooltip="{{row.entity.projectId ? 'label.Remove' : 'label.Reset' | translate}}">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`
                    }
                ],
                rowTemplate: "<div iris-ui-grid-row></div>"
            };

            $scope.onDblClick = function (row) {
                $scope.openModuleSettingsModal(row);
            };

            $scope.remove = function (settings) {
                alertify.confirm($translate.instant(settings.projectId ? 'message.DeleteItemConfirm' : 'message.ResetItemConfirm'), function (e) {
                    if (e) {
                        iris.loader.start();
                        ProjectSettingsService.removeProjectSettings($stateParams.settings, settings).then(function () {
                            iris.loader.stop();
                            alertify.success($translate.instant(settings.projectId ? 'message.DeleteItemSuccessful' : 'message.ResetItemSuccessful'));
                            $scope.updateSettingsList();
                        });
                    }
                });
            }
        });

    angular.module('iris_gs_base_view').controller('ModuleSettingsBaseViewCtrl',
        function ($scope, $controller, $filter, $stateParams, GlobalSettingsService) {
            $scope.module = GlobalSettingsService.getModule($stateParams.module);

            $scope.module_settings = GlobalSettingsService.getModuleSettings($scope.module, $stateParams.settings);

            $scope.settings_list = [];

            // Dynamically add fields depending on settings to grid
            $scope.addFieldsToGrid = function (fields) {
                if ($scope.gridOptions && $scope.gridOptions.columnDefs && angular.isArray($scope.gridOptions.columnDefs))
                    $scope.gridOptions.columnDefs.splice.apply($scope.gridOptions.columnDefs, [3, 0].concat(fields));
            };

            $scope.openModuleSettingsModal = function (row, data) {
                var field = $scope.module_settings.type + 'Id';
                var object_id;
                //edit element
                if (row && row.entity[field]) object_id = row.entity[field];
                //edit default
                if (row && !row.entity[field]) object_id = 'default';
                //create new element
                if (!row) object_id = null;

                var size = $scope.size || 'lg';
                return GlobalSettingsService.openEditModuleSettings($stateParams.module, $stateParams.settings, object_id, data, size).then(function () {
                    $scope.updateSettingsList();
                    $scope.$emit('modalClosed')
                });
            };

            //Remove default settings value if not needed
            $scope.removeDefaultItem = function (items_list) {
                for(var i in items_list){
                    if(!items_list[i].id) {
                        delete items_list[i];
                        return;
                    }
                }
            };

            if ($scope.module_settings && $scope.module_settings.type) {
                //console.log("Extending:" +  $filter('PascalCase')($scope.module_settings.type) + 'SettingsBaseViewCtrl');
                angular.extend($scope, $controller($filter('PascalCase')($scope.module_settings.type) + 'SettingsBaseViewCtrl', {$scope: $scope}));
            }
        });

    angular.module('iris_gs_base_view').controller('ModuleDirectoriesBaseViewCtrl',
        function ($scope, $translate, $filter, $stateParams, GlobalSettingsService, SecurityService) {

            $scope.gridOptions = {
                data: 'items',
                columnDefs: [
                    {
                        name: '#',
                        enableFiltering: false,
                        displayName: '#',
                        width: 40,
                        enableSorting: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{rowRenderIndex + 1}}</div>'
                    },
                    {
                        name: 'id',
                        width: 40,
                        type: 'number'
                    },
                    {
                        name: 'actions',
                        width: '*',
                        enableFiltering: false,
                        displayName: $translate.instant('label.Actions'),
                        enableSorting: false,
                        cellTemplate: ''
                    }
                ],
                rowTemplate: "<div ng-dblclick=\"grid.appScope.onDblClick(row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell ></div>",
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;
                }
            };

            $scope.gridRowActions = {
                "edit": {
                    order:    10,
                    template: '<a href="javascript:void(0)" ng-if="grid.appScope.hasPermissionToUpdate(row.entity)" ng-click="grid.appScope.openModuleSettingsModal(row)" class="btn btn-default" title="{{\'label.Edit\' | translate}}" id="editDevice"><i class="fa fa-pencil"></i></a>'
                },
                "delete": {
                    order:    20,
                    template: '<button class="btn btn-danger" ng-if="grid.appScope.hasPermissionToDelete" ng-click="grid.appScope.remove(row.entity)" uib-tooltip="{{\'label.Remove\' | translate}}"><i class="fa fa-trash-o"></i></button>'
                }
            };

            $scope.updateGridRowActions = function() {

                var cellTemplate = Object.keys($scope.gridRowActions)
                    .map(function(k){return $scope.gridRowActions[k];})
                    .sort(function(o1,o2){return o1.order < o2.order ? -1 : (o1.order == o2.order ? 0 : 1);})
                    .map(function(o){return o.template;})
                    .join('&nbsp;');

                cellTemplate = "<div class='ui-grid-cell-contents actions'>" + cellTemplate + "</div>";

                $scope.gridOptions.columnDefs.filter(function(o){return o.name == "actions";})[0].cellTemplate = cellTemplate;
            };

            $scope.updateGridRowActions();


            $scope.onDblClick = function(row){
                // open edit-dialog on double-click the row only when having permission to edit
                if ($scope.hasPermissionToUpdate(row.entity)) {
                    $scope.openModuleSettingsModal(row);
                }
            };

            $scope.openModuleSettingsModal = function (row, data) {
                return GlobalSettingsService.openEditModuleSettings($stateParams.module,$stateParams.settings,row && row.entity ? row.entity.id : null, data)
                    .then(() => {
                        $scope.$emit('modalClosed');
                        $scope.loadItems && $scope.loadItems();
                    });
            };

            // Dynamically add fields depending on settings to grid
            $scope.addFieldsToGrid = function (fields) {
                if($scope.gridOptions && $scope.gridOptions.columnDefs && angular.isArray($scope.gridOptions.columnDefs))
                    $scope.gridOptions.columnDefs.splice.apply($scope.gridOptions.columnDefs,[2,0].concat(fields));
            };

            // Dynamically remove field(s).
            $scope.removeFieldFromGrid = function(fieldName) {
                var columnDefs = $scope.gridOptions.columnDefs;
                var fieldDefObject = columnDefs.filter(function(fieldDefObj){return fieldDefObj.name == fieldName;})[0];
                if(!fieldDefObject)
                    return null;
                var fieldDefIndex = columnDefs.indexOf(fieldDefObject);
                columnDefs.splice(fieldDefIndex,1);
                return fieldDefObject;
            };

            $scope.removeFieldsFromGrid = function(fieldNames) {
                var removedFields = [];
                fieldNames.forEach(function(fieldName){
                    var removedField = $scope.removeFieldFromGrid(fieldName);
                    if(removedField)
                        removedFields.push(removedField);
                });
                return removedFields;
            };

            var module = GlobalSettingsService.getModule($stateParams.module);
            var settings = GlobalSettingsService.getModuleSettings(module, $stateParams.settings);

            /* if settings.subject is provided, it is used to check permissions for add / delete (in general) / update (for the given entity) */
            function hasPermissionTo(action, entity) {
                return (settings && settings.subject) ? SecurityService.hasPermissions(entity ? entity.id : '*', settings.subject, action) : true;
            }
            $scope.hasPermissionToUpdate = function (entity) {
                return hasPermissionTo('update', entity);
            }
            $scope.hasPermissionToAdd = hasPermissionTo('add');
            $scope.hasPermissionToDelete = hasPermissionTo('delete');
            $scope.disableAddButton = !$scope.hasPermissionToAdd;


            $scope.toolbarTemplateUrl = '';
            if (module && settings && settings.customToolbar) {
                $scope.toolbarTemplateUrl = iris.config.componentsUrl + '/global-settings/templates/toolbar/module.settings.' + module.alias + '.' + settings.alias + '.toolbar.view.html';
                //console.log("toolbar template url: ", $scope.toolbarTemplateUrl);
            }

            $scope.customActionsTemplateUrl = '';
            if (module && settings && settings.customActions) {
                $scope.customActionsTemplateUrl = iris.config.componentsUrl + '/global-settings/templates/actions/module.settings.' + module.alias + '.' + settings.alias + '.actions.view.html';
                console.log("actions template url: ", $scope.customActionsTemplateUrl);
            }
        });

})();