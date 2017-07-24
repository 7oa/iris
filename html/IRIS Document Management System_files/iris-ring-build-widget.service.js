(function () {
    angular.module('irisRingBuildWidget').factory('IrisRingBuildWidgetService',
        function ($translate, $q, $window, ProjectsService, RingsService, JackConfigurationService) {
            var defaultSettings = {
                jackExtension: {
                    label: "Jack Extension",
                    translations: {}
                },
                tailSkinGap: {
                    label: "Tail Skin Gap",
                    translations: {}
                },
                beforeRingBuild: {
                    label: "Before Ring Build",
                    translations: {}
                },
                afterRingBuild: {
                    label: "After Ring Build",
                    translations: {}
                },
                right: {
                    label: "R",
                    translations: {}
                },
                left: {
                    label: "L",
                    translations: {}
                },
                top: {
                    label: "T",
                    translations: {}
                },
                bottom: {
                    label: "B",
                    translations: {}
                },
                unit: "MILLIMETER",
                decimals: 0,
                ring: {
                    keyStone: {
                        visible: true,
                        shape: "circle",
                        size: 15,
                        fill: "#cc0000"
                    },
                    ringType: {
                        visible: true,
                        label: "Ring Type",
                        translations: {}
                    },
                    keyStonePosition: {
                        visible: true,
                        label: "Key Stone Position",
                        translations: {}
                    }
                }
            };

            var demoData = {
                keyStoneAngle: 30,
                ringType: {
                    name: "R",
                    orientationName: "2"
                },
                cylindersPush: {
                    top: 2616,
                    right: 2583,
                    bottom: 2559,
                    left: 2592
                },
                cylindersPushAfter: {
                    top: 739,
                    right: 708,
                    bottom: 689,
                    left: 720
                },
                tscBefore: {
                    top: 75,
                    right: 75,
                    bottom: 100,
                    left: 75
                },
                tscAfter: {
                    top: 80,
                    right: 80,
                    bottom: 90,
                    left: 80
                }
            };

            return {
                getDefaultSettings: function () {
                    return defaultSettings;
                },

                getDemoData: function () {
                    return demoData;
                },

                getData: function(projectId, deviceId, ringNumber) {
                    var projectDevice = ProjectsService.getProjectDevice(projectId, deviceId);
                    if(!projectDevice) return;

                    return RingsService.getRing(projectDevice.id, ringNumber);
                },

                preSave: function(widget) {
                    var defer = $q.defer();

                    if (widget.settings.ring.keyStone.visible && widget.deviceId) {
                        JackConfigurationService.getJackConfigurations(widget.deviceId).then((jacks) => {
                            console.log(jacks);
                            if (jacks && jacks.length) {
                                defer.resolve("save");
                            } else {
                                var oldLabels = alertify.labels;
                                alertify.set({ labels : { ok: $translate.instant('label.ringBuild.ThrustJackWarningSaveAndGo'), cancel: $translate.instant('label.OnlySave') } });
                                alertify.confirm($translate.instant('text.ringBuild.ThrustJackWarning'), function (e) {
                                    alertify.set({ labels : oldLabels });
                                    if (e) {
                                        defer.resolve("go");
                                    } else {
                                        //defer.resolve(false);
                                        defer.resolve("save");
                                    }
                                });
                            }
                        });
                    } else {
                        defer.resolve("save");
                    }

                    return defer.promise;
                },

                postSave: function(widget, preSaveResult) {
                    if (preSaveResult === "go") {
                        $window.location.href = `configuration/module/ringbuild-management/ringbuild-management/device/${widget.deviceId}/jack-configuration`;
                    }
                }
            };
        });

})();