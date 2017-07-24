(function() {
    angular.module('iris_widget_shift_mgmt_header', []);

    angular.module('iris_widget_shift_mgmt_header').directive('irisShiftMgmtHeader', function ($compile,
        ShiftProtocolService, ProjectsService) {
        return {
            restrict: 'AE',
            scope: {
                params: '=',
                widget: '='
            },
            templateUrl: iris.config.widgetsUrl + '/iris-shift-mgmt-header/templates/header-view.html',

            link: function ($scope, element, attrs) {
                var demoMode = (attrs.mode == 'demo');

                const settings = typeof $scope.widget === 'string' ? JSON.parse($scope.widget).settings :
                    $scope.widget.settings;

                function convertAndFormat(time) {
                    if (time) {
                        return convertTimeToCurrentTimeZone(time).format('DD/MM/YYYY HH:mm')
                    }
                }

                function convertTimeToCurrentTimeZone(time) {
                    return moment.tz(time, $scope.timeZone);
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

                if (!demoMode && !settings.protocolId) {
                    console.log('protocol is not found');
                    return;
                }

                var fullModelPromise = demoMode ? ShiftProtocolService.getDemoFullModel() : ShiftProtocolService.getFullModelById(settings.protocolId);
                fullModelPromise.then((protocol) => {
                    $scope.projectId = protocol.protocol.projectId;
                    $scope.project = demoMode ? ProjectsService.getPreloadedProjects()[0] : ProjectsService.getProjectById($scope.projectId);
                    $scope.timeZone = $scope.project.timeZone;
                    $scope.info = getProtocolHeader(protocol);
                    $scope.headerTemplate = protocol.protocol.headerTemplate;
                });
            }
        }
    });
})();