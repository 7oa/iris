(function () {
    irisAppDependencies.add('iris_cutter_track_settings');

    angular.module('iris_cutter_track_settings', []);

    angular.module('iris_cutter_track_settings')
        .factory('CutterTrackSettingsService', function ($translate) {
            var trackSettings = [{
                id: 'installedTool',
                name: $translate.instant('label.cutter.InstalledTool')
            }, {
                id: 'toolManufacturer',
                name: $translate.instant('label.cutter.ToolManufacturer')
            }, {
                id: 'diskDiameter',
                name: $translate.instant('label.cutter.DiskDiameter'),
                unit: 'INCH',
                needUnit: true,
                decimal: 0,
                needDecimal: true
            }, {
                id: 'currentWear',
                name: $translate.instant('label.cutter.CurrentWear'),
                unit: 'MILLIMETER',
                needUnit: true,
                needDecimal: true,
                decimal: 1
            }, {
                id: 'maxToleranceWear',
                name: $translate.instant('label.cutter.MaxTolerableWear'),
                unit: 'MILLIMETER',
                needUnit: true,
                needDecimal: true,
                decimal: 1
            }, {
                id: 'toolType',
                name: $translate.instant('label.cutter.ToolType')
            }, {
                id: 'lastWearMeasurementDate',
                name: $translate.instant('label.cutter.LastWearMeasurementDate')
            }, {
                id: 'lastWearMeasurementTunnelMeter',
                name: $translate.instant('label.cutter.LastWearMeasurementTunnelMeter'),
                unit: 'METER',
                needUnit: true,
                needDecimal: true,
                decimal: 3
            }, {
                id: 'lastToolChangeDate',
                name: $translate.instant('label.cutter.LastToolChangeDate')
            }, {
                id: 'lastToolChangeTunnelMeter',
                name: $translate.instant('label.cutter.LastToolChangeTunnelMeter'),
                unit: 'METER',
                needUnit: true,
                needDecimal: true,
                decimal: 3
            }, {
                id: 'radius',
                name: $translate.instant('label.Radius'),
                unit: 'MILLIMETER',
                needUnit: true,
                needDecimal: true,
                decimal: 1
            }, {
                id: 'numberOfChanges',
                name: $translate.instant('label.cutter.NumberOfChanges'),
                needDecimal: true,
                decimal: 0
            }, {
                id: 'totalWear',
                name: $translate.instant('label.cutter.TotalWear'),
                unit: 'MILLIMETER',
                needUnit: true,
                needDecimal: true,
                decimal: 1
            }, {
                id: 'wearLastChange',
                name: $translate.instant('label.cutter.WearAtLastChange'),
                unit: 'MILLIMETER',
                needUnit: true,
                needDecimal: true,
                decimal: 1
            }];

            var advanceOptions = [{
                id: 'advance',
                name: $translate.instant('label.Advance'),
                alias: 'label.advance'
            }, {
                id: 'stroke',
                name: $translate.instant('label.Stroke'),
                alias: 'label.stroke'
            }
            ];

            var maintenanceSettings = [{
                id: 'status',
                name: $translate.instant('label.Status')
            }, {
                id: 'trackId',
                name: $translate.instant('label.cutter.TrackId')
            }, {
                id: 'installedTool',
                name: $translate.instant('label.cutter.InstalledTool')
            }, {
                id: 'toolManufacturer',
                name: $translate.instant('label.cutter.ToolManufacturer')
            }, {
                id: 'diskDiameter',
                name: $translate.instant('label.cutter.DiskDiameter'),
                unit: 'INCH',
                needUnit: true,
                decimal: 0,
                needDecimal: true
            }, {
                id: 'currentWear',
                name: $translate.instant('label.cutter.CurrentWear'),
                unit: 'MILLIMETER',
                needUnit: true,
                needDecimal: true,
                decimal: 1
            }, {
                id: 'maxToleranceWear',
                name: $translate.instant('label.cutter.MaxTolerableWear'),
                unit: 'MILLIMETER',
                needUnit: true,
                needDecimal: true,
                decimal: 1
            }, {
                id: 'installationWear',
                name: $translate.instant('label.cutter.InstallationWear'),
                unit: 'MILLIMETER',
                needUnit: true,
                needDecimal: true,
                decimal: 1
            }, {
                id: 'wearIndex',
                name: $translate.instant('label.cutter.WearIndex'),
                unit: 'MILLIMETERPERMETER',
                needUnit: true,
                needDecimal: true,
                decimal: 2
            }, {
                id: 'lastWearMeasurementDate',
                name: $translate.instant('label.cutter.LastWearMeasurementDate')
            }, {
                id: 'lastWearMeasurementTunnelMeter',
                name: $translate.instant('label.cutter.LastWearMeasurementTunnelMeter'),
                unit: 'METER',
                needUnit: true,
                needDecimal: true,
                decimal: 3
            }, {
                id: 'lastToolChangeDate',
                name: $translate.instant('label.cutter.LastToolChangeDate')
            }, {
                id: 'lastToolChangeTunnelMeter',
                name: $translate.instant('label.cutter.LastToolChangeTunnelMeter'),
                unit: 'METER',
                needUnit: true,
                needDecimal: true,
                decimal: 3
            }, {
                id: 'maxTunnelMeter',
                name: $translate.instant('label.cutter.MaxTunnelMeter'),
                unit: 'METER',
                needUnit: true,
                needDecimal: true,
                decimal: 3
            }, {
                id: 'currentTunnelMeter',
                name: $translate.instant('label.cutter.CurrentTunnelMeter'),
                unit: 'METER',
                needUnit: true,
                needDecimal: true,
                decimal: 3
            }];

            return {
                getTrackSettings: () => trackSettings,
                getAdvanceOptionss: () => advanceOptions,
                getMaintenanceSettings: () => maintenanceSettings,

                getTrackSettingByAlias: field => trackSettings.filter(ts => ts.field == field)[0]
            }
        });
})();
