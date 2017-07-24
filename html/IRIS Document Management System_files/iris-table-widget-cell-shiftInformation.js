(function () {
    angular.module('irisTableWidget').directive('irisTableWidgetCellShiftInformation',
        function ($q, $filter, $compile, $http, $translate, $interpolate, ShiftModelService, IrisTableWidgetService, ProjectsService) {
            return {
                restrict: 'EA',
                scope: {
                    widget: '=',
                    cell: '=',
                    interval: "="
                },
                template: '',

                controller: function ($scope) {
                    $scope.cell.params.pointInTime || ($scope.cell.params.pointInTime = "START");
                    $scope.shiftModels = [];

                    var shiftModelsDefer = $q.defer();
                    $scope.shiftModelsPromise = shiftModelsDefer.promise;

                    function refreshShiftModels(shiftBundleId, autoSelect) {
                        if (shiftBundleId) {
                            ShiftModelService.findAllByBundleId(shiftBundleId).then(res => {
                                $scope.shiftModels = res;
                                if (autoSelect) $scope.cell.params.shiftModels = res.map(t => t.id);
                                shiftModelsDefer.resolve($scope.shiftModels);
                            })
                        } else {
                            $scope.shiftModels = [];
                            $scope.cell.params.shiftModels = null;
                            shiftModelsDefer.resolve($scope.shiftModels);
                        }
                    }
                    refreshShiftModels($scope.widget.settings.shiftBundleId);

                    $scope.$watch("cell.params.shiftBundleId", function(nv, ov) {
                        if (angular.equals(nv, ov)) return;
                        refreshShiftModels(nv, true);
                    });
                },

                link: function (scope, element, attrs) {
                    var mode = attrs["mode"];

                    scope.timeZone = ProjectsService.getProjectById(scope.widget.projectId).timeZone;

                    scope.getShiftModelsLabel = function() {
                        var res = "";
                        scope.cell.params.shiftModels && scope.cell.params.shiftModels.forEach(m => {
                            if (res) res += ", ";
                            res += $filter("IrisFilterField")(m, [scope.widget.projectShiftModels]);
                        });
                        return res || $translate.instant("label.NotSpecified");
                    };

                    function convertAndFormat(time) {
                        if (time) {
                            return convertTimeToCurrentTimeZone(time).format('DD/MM/YYYY HH:mm')
                        }
                    }

                    function convertTimeToCurrentTimeZone(time) {
                        return moment.tz(time, scope.timeZone);
                    }

                    function getProtocolPeriod(protocol) {
                        const start = convertTimeToCurrentTimeZone(protocol.startTime).format('DD/MM/YYYY HH:mm');
                        const end = convertTimeToCurrentTimeZone(protocol.endTime).format('DD/MM/YYYY HH:mm');
                        return `${start} - ${end}`
                    }

                    function getProtocolHeader(protocol) {
                        const result = {
                            name: protocol.protocol.displayName,
                            shift: { name: protocol.shiftName },
                            period: getProtocolPeriod(protocol.protocol),
                            lastModified: convertAndFormat(protocol.protocol.updatedOn),
                            lastDataImport: convertAndFormat(protocol.protocol.lastDataImport),
                            advance: {
                                chainage: {
                                    start: protocol.advanceInfo.startChainage && parseInt(protocol.advanceInfo.startChainage),
                                    end: protocol.advanceInfo.endChainage && parseInt(protocol.advanceInfo.endChainage)
                                },
                                tunnelmeter: {
                                    start: protocol.advanceInfo.startTunnelMeter && parseInt(protocol.advanceInfo.startTunnelMeter),
                                    end: protocol.advanceInfo.endTunnelMeter && parseInt(protocol.advanceInfo.endTunnelMeter)
                                },
                                interval: {
                                    start: protocol.advanceInfo.startRingNumber && parseInt(protocol.advanceInfo.startRingNumber),
                                    end: protocol.advanceInfo.endRingNumber && parseInt(protocol.advanceInfo.endRingNumber)
                                }
                            }
                        };

                        const shiftStaffs = protocol.protocol.shiftStaffs;
                        if (shiftStaffs && shiftStaffs.length) {
                            shiftStaffs.forEach(shiftStaff => {
                                result[`job${shiftStaff.jobTitle.id}`] = `${shiftStaff.profile.fullName}`;
                            });
                        }

                        return result;
                    }

                    scope.cellValue = null;
                    function refreshCellValue() {
                        if (mode == "demo") {
                            scope.cellValue = $translate.instant("label.ShiftData");
                        } else {
                            scope.shiftModelsPromise.then(() => {
                                scope.widget.shiftReportsPromise.then(data => {
                                    var arr = data.filter(d => d.protocol.startTime && d.protocol.endTime && new Date(d.protocol.startTime) >= new Date(scope.interval.from) && new Date(d.protocol.endTime) <= new Date(scope.interval.to));

                                    if (scope.cell.params.shiftBundleId) {
                                        arr = arr.filter(d => d.protocol.shiftModelBundleId == scope.cell.params.shiftBundleId);

                                        if (scope.cell.params.shiftModels && scope.cell.params.shiftModels.length) {
                                            var shiftModels = scope.shiftModels.filter(t => scope.cell.params.shiftModels.map(m => Number(m)).indexOf(t.id) >= 0).map(t => t.name);
                                            arr = arr.filter(d => shiftModels.indexOf(d.shiftName) >= 0);
                                        }
                                    }

                                    if (!arr || !arr.length) return;
                                    var shiftReport = scope.cell.params.pointInTime == "START" ? arr[0] : arr[arr.length - 1];
                                    scope.cellValue = $interpolate($filter("IrisFilterField")(scope.cell.params.shiftParameter.id, [IrisTableWidgetService.getShiftParameters()]))(getProtocolHeader(shiftReport));
                                });
                            });
                        }
                    }

                    switch (mode) {
                        case "edit":
                            var template = "<div><i>{{'label.ShiftModelBundle' | translate}}:</i> {{cell.params.shiftBundleId | IrisFilterField:[widget.shiftBundles,'title']}}</div>";
                            template += "<div><i>{{'label.ShiftModel' | translate}}:</i> {{getShiftModelsLabel()}}</div>";
                            template += "<div><i>{{'label.widget.time.type.date' | translate}}:</i> {{cell.params.pointInTime | IrisFilterField:[widget.pointsInTime]}}</div>";
                            element.html($compile(template)(scope));
                            break;
                        case "view":
                        case "demo":
                            refreshCellValue();
                            var template = "<span>{{cellValue}}</span>";
                            element.html($compile(template)(scope));
                            break;
                        default:
                            var template = "<span class='alert alert-warning'>[mode] not defined</span>";
                            element.html(template);
                            break;
                    }
                }
            };
        });
})();

