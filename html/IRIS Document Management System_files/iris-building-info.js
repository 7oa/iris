(function() {
    angular.module('iris_gs_buildings').directive('irisBuildingInfo', function ($compile, $filter, SegmentColumnsService, WorkflowService, IrisTimeService) {
        var directive = {
            restrict: 'EA',

            scope: {
                building: "=",
                parentBuilding: "="
            },

            template: '',

            link: function (scope, element, attrs) {
                scope.$watch('content', () => {
                    var template = `<div>{{building.type}}</div>`;

                    switch (scope.building.type) {
                        case "TUNNEL":
                            template = `
                                <table class="table table-condensed">
                                    <tr>
                                        <th>{{::'label.tunnel.kilometrageTunnelingStart' | translate}}</th>
                                        <td>{{building.tunnel.kilometrageTunnelingStart}}</td>
                                    </tr>
                                    <tr>
                                        <th>{{::'label.tunnel.kilometrageTunnelingEnd' | translate}}</th>
                                        <td>{{building.tunnel.kilometrageTunnelingEnd}}</td>
                                    </tr>
                                    <tr>
                                        <th>{{::'label.tunnel.kilometrageOfTunnelmeterZero' | translate}}</th>
                                        <td>{{building.tunnel.kilometrageByZeroMeter}}</td>
                                    </tr>
                                    <tr>
                                        <th>{{::'label.tunnel.tunnelmeterDriverStart' | translate}}</th>
                                        <td>{{building.tunnel.tunnelMeterDriverStart}}</td>
                                    </tr>
                                    <tr>
                                        <th>{{::'label.tunnel.tunnelmeterDriverEnd' | translate}}</th>
                                        <td>{{building.tunnel.tunnelMeterDriverEnd}}</td>
                                    </tr>
                                    <tr>
                                        <th>{{::'label.TunnelLength' | translate}}</th>
                                        <td>{{building.tunnel.tunnelLength}}</td>
                                    </tr>
                                </table>`;
                            break;

                        case "RING":
                            template = `
                                <table class="table table-condensed">
                                    <tr>
                                        <th rowspan="4">{{::'label.ring.CylindersPush' | translate}}</th>
                                        <td>{{::'label.Bottom' | translate}}</td>
                                        <td>{{building.ring.cylindersPush.bottomMeasurement}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Left' | translate}}</td>
                                        <td>{{building.ring.cylindersPush.leftMeasurement}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Right' | translate}}</td>
                                        <td>{{building.ring.cylindersPush.rightMeasurement}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Top' | translate}}</td>
                                        <td>{{building.ring.cylindersPush.topMeasurement}}</td>
                                    </tr>

                                    <tr>
                                        <th rowspan="4">{{::'label.ring.CylindersTailSkinArticulation' | translate}}</th>
                                        <td>{{::'label.Bottom' | translate}}</td>
                                        <td>{{building.ring.cylindersTailSkinArticulation.bottomMeasurement}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Left' | translate}}</td>
                                        <td>{{building.ring.cylindersTailSkinArticulation.leftMeasurement}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Right' | translate}}</td>
                                        <td>{{building.ring.cylindersTailSkinArticulation.rightMeasurement}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Top' | translate}}</td>
                                        <td>{{building.ring.cylindersTailSkinArticulation.topMeasurement}}</td>
                                    </tr>

                                    <tr>
                                        <th rowspan="6">{{::'label.ring.GlobalPosition' | translate}}</th>
                                        <td>X</td>
                                        <td>{{building.ring.globalX}}</td>
                                    </tr>
                                    <tr>
                                        <td>Y</td>
                                        <td>{{building.ring.globalY}}</td>
                                    </tr>
                                    <tr>
                                        <td>Z</td>
                                        <td>{{building.ring.globalZ}}</td>
                                    </tr>
                                    <tr>
                                        <td>X_WGS84</td>
                                        <td>{{building.ring.globalX_WGS84}}</td>
                                    </tr>
                                    <tr>
                                        <td>Y_WGS84</td>
                                        <td>{{building.ring.globalY_WGS84}}</td>
                                    </tr>
                                    <tr>
                                        <td>Z_WGS84</td>
                                        <td>{{building.ring.globalZ_WGS84}}</td>
                                    </tr>

                                    <tr>
                                        <th rowspan="8">{{::'label.ring.Tsc' | translate}}</th>
                                        <td>{{::'label.Bottom' | translate}} {{::'label.After' | translate}}</td>
                                        <td>{{building.ring.tscBottomAfter}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Bottom' | translate}} {{::'label.Before' | translate}}</td>
                                        <td>{{building.ring.tscBottomBefore}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Left' | translate}} {{::'label.After' | translate}}</td>
                                        <td>{{building.ring.tscLeftAfter}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Left' | translate}} {{::'label.Before' | translate}}</td>
                                        <td>{{building.ring.tscLeftBefore}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Right' | translate}} {{::'label.After' | translate}}</td>
                                        <td>{{building.ring.tscRightAfter}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Right' | translate}} {{::'label.Before' | translate}}</td>
                                        <td>{{building.ring.tscRightBefore}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Top' | translate}} {{::'label.After' | translate}}</td>
                                        <td>{{building.ring.tscTopAfter}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{::'label.Top' | translate}} {{::'label.Before' | translate}}</td>
                                        <td>{{building.ring.tscTopBefore}}</td>
                                    </tr>

                                    <tr>
                                        <th>{{::'label.ring.VerticalDeviation' | translate}}</th>
                                        <td>&nbsp;</td>
                                        <td>{{building.ring.verticalDeviation}}</td>
                                    </tr>
                                </table>`;
                            break;

                        case "SEGMENT":
                            scope.tunnelId = scope.parentBuilding.type == "STORAGE" ? scope.parentBuilding.id : scope.parentBuilding.parentId;
                            scope.workflowStates = [];
                            scope.segmentFields = [];

                            SegmentColumnsService.query(scope.tunnelId).then(sRes => {
                                var fields = [],
                                    columns = sRes.sort((a, b) => a.orderIndex > b.orderIndex ? 1 : a.orderIndex < b.orderIndex ? -1 : 0);

                                columns.forEach(column => {
                                    if (!column.isShown) return;

                                    var field = {
                                        name: $filter("irisTranslate")(column.name, column.nameTranslations),
                                        value: scope.building.segment.configuredData[column.id],
                                        type: column.type.toLowerCase()
                                    };

                                    switch (field.type) {
                                        case "date":
                                            field.value = $filter("irisTime")(field.value, this, IrisTimeService.getDateTimeFormatById(iris.config.me.profile.dateFormatId).momentjsFormatString);
                                            break;

                                        case "datetime":
                                            field.value = $filter("irisTime")(field.value, this, IrisTimeService.getDateTimeFormatById(iris.config.me.profile.dateTimeFormatId).momentjsFormatString);
                                            break;

                                        case "number":
                                            field.value = $filter("number")(field.value, column.decimals);
                                            break;

                                        case "boolean":
                                            field.value = field.value ? column.trueValue : column.falseValue;
                                            break;

                                        case "workflow":
                                            !scope.workflowStates.length && WorkflowService.getWorkflowStates(column.workflowId).then(wfRes => {
                                                scope.workflowStates = wfRes;
                                            });
                                            field.value = scope.building.segment.configuredData[column.id].current;
                                            break;
                                    }

                                    fields.push(field);
                                });

                                scope.segmentFields = fields;
                            });

                            template = `
                                <table class="table table-condensed">
                                    <tr ng-repeat="field in segmentFields">
                                        <th>{{field.name}}</th>
                                        <td ng-if="field.type != 'workflow'">{{field.value}}</td>
                                        <td ng-if="field.type == 'workflow'">{{field.value | IrisFilterField:[workflowStates]}}</td>
                                    </tr>
                                </table>`;
                            break;
                    }

                    element.html($compile(template)(scope));
                });
            }
        };

        return directive;
    });
})();
