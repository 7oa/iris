(function() {

    'use strict';

    function getTreeParents(node, id, result) {
        if (!result) {
            result = []
        }

        if (node.id === id) {
            return result
        } else {
            result.push(node);

            for (var i = 0; i < node.childStates.length; i++) {
                var child = node.childStates[i];
                var match = getTreeParents(child, id, result.slice());
                if (match) {
                    return match
                }
            }
        }

        return null
    }

    function getChosenTreeChildren(node, selectedNodes, result) {
        if (selectedNodes.findIndex((i) => i.id === node.id) >= 0) {
            result.push(node)
        }

        if (node.childStates.length > 0) {
            for (var i = 0; i < node.childStates.length; i++) {
                getChosenTreeChildren(node.childStates[i], selectedNodes, result);
            }
        }
    }

    angular.module('iris_gs_workshift_management_protocol_template')
        .controller('ModuleShiftProtocolTemplateEditCtrl',
            function($scope, $controller, $translate, $filter, params, $uibModalInstance,
                     ShiftProtocolTemplateService, DevicesService, OperatingStateService,
                     JobTitleService, ProjectsService, ReportsService) {

                var modelId = params.id;
                var projectId = params.projectId;

                $scope.config = iris.config;
                $scope.templates = ReportsService.getTemplates();

                if (modelId) {
                    $scope.model = { };
                    ShiftProtocolTemplateService.getById(modelId).then((model) => {
                        $scope.model = model;
                        $scope.model.jobTitleIDs = $scope.model.jobTitles.map((i) => i.id);
                    })
                } else {
                    $scope.model = ShiftProtocolTemplateService.createTemplate();
                }

                $scope.save = function() {
                    if ($scope.model.jobTitleIDs) {
                        $scope.model.jobTitles = $scope.jobTitles.filter(
                            (i) => $scope.model.jobTitleIDs.indexOf(i.id.toString()) >= 0);
                    }

                    ShiftProtocolTemplateService.save(modelId, $scope.model)
                        .then(function() {
                            alertify.success($translate.instant('message.ShiftProtocolTemplateSaved'));
                            $uibModalInstance.close();
                        })
                };

                $scope.devices = DevicesService.getDevices();
                $scope.projects = ProjectsService.getProjects();
                JobTitleService.getJobTitles().then(jobTitles => $scope.jobTitles = jobTitles);
                $scope.manualOperatingStates = [];

                OperatingStateService.findAllManualStatesByProjectId(projectId).then((manualOpStates) =>
                    $scope.manualOperatingStates = manualOpStates);

                $scope.gridSizes = [{value: '5m'},{value: '10m'}, {value: '30m'}, {value: '1h'}];

                $scope.selectOpState = function(opState) {
                    var opStateId = opState.id;
                    var parents = $scope.manualOperatingStates.map((i) => getTreeParents(i, opStateId))
                        .find((i) => i !== null);

                    var array = $scope.model.manualOperatingStates || [];

                    //select all tree parents of the item
                    parents.forEach((parent) =>
                        array.findIndex((i) => i.id === parent.id) < 0 && array.push(parent));

                    if (array.findIndex((i) => i.id === opStateId) < 0) {
                        array.push(opState)
                    } else {
                        var items = [opState];
                        getChosenTreeChildren(opState, array, items);
                        items.forEach((i) => {
                            var index = array.findIndex((a) => a.id === i.id);
                            if (index >= 0) {
                                array.splice(index, 1)
                            }
                        })
                    }

                    $scope.model.manualOperatingStates = array;

                    $scope.validateOperatingStatesForUniqeness();
                };

                $scope.hasOpState = (id) =>
                    $scope.model.manualOperatingStates &&
                        $scope.model.manualOperatingStates.findIndex((i) => i.id === id) >= 0;

                $scope.validateOperatingStatesForUniqeness = () => {
                    const selStates = $scope.model.manualOperatingStates;
                    const selStatesIds = new Set(selStates.map((i) => i.code));
                    $scope.operatingStateError = selStatesIds.size !== selStates.length;
                };

                $scope.formValid = () => {
                    return !$scope.ManageShiftProtocolModelsEdit.$invalid &&
                        !$scope.operatingStateError;
                };

                $scope.validateEmailRecipients = () =>
                    $filter('emailValid')($scope.model.errorNotificationRecipients);

                var calculatedInterval = null;

                $scope.$watch('model.defaultGridResolution', function() {
                    var refreshInterval = $scope.model.displayRefreshInterval;
                    var resolution = $scope.model.defaultGridResolution;
                    if ((!refreshInterval || calculatedInterval === refreshInterval) && resolution) {
                        resolution = parseInt(resolution.replace('m', ''));
                        calculatedInterval = $scope.model.displayRefreshInterval = (resolution * 60) / 2;
                    }
                })
            })
})();