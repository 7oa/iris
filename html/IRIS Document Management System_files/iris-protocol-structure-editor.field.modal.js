(function() {
    angular.module('irisProtocolStructure')
        .controller('IrisProtocolStructureEditorFieldModalCtrl', function ($scope, $uibModalInstance, $state, field, fieldTypes, parentProperty, ProjectSettingsService, IrisProtocolStructureService) {
            var projectId = $state.params.projectId;

            $scope.field = field;
            $scope.fieldTypes = fieldTypes;
            $scope.parentProperty = parentProperty;
            $scope.formulaLanguages = IrisProtocolStructureService.getFormulaLanguages();
            $scope.field.settings || ($scope.field.settings = {});

            ProjectSettingsService.getProjectSettingsById("dpm", projectId).then(res => {
                res.settings = res.settings || {};
                $scope.dpm_settings = res;
            });

            $scope.accept = function() {
                if (field.type == 'group' && field.settings && field.settings.isBarcode) {
                    var barcodeProperty = field.properties.filter(t => t.type == 'barcode');
                    if (!barcodeProperty || !barcodeProperty.length) {
                        field.properties.push(new IrisProtocolStructureService.field('barcode', {settings: {}}, true));
                    }
                }
                $uibModalInstance.close(field);
            };

            $scope.mapToOptionsDirectory = function(settings) {
                settings.options || (settings.options = []);
                $scope.optionsDirectory = settings.options.map(o => { return { value: o }; });
            };

            if ($scope.field.type == 'selection' || $scope.field.type == 'radio') {
                $scope.mapToOptionsDirectory($scope.field.settings);
            }
        });
})();