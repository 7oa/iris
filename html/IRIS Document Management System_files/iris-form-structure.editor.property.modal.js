(function() {
    angular.module('irisForm')
        .controller('IrisFormStructureEditorPropertyModalCtrl', function ($scope, $uibModalInstance, $window, $filter, $translate, $timeout,
                                                                          property, propertyTypes, parentProperty, rootForm, aliasType, mode,
                                                                          DocumentFormService, IrisFormStructureService, BuildingService) {
            $scope.property = property;
            $scope.propertyTypes = propertyTypes;
            $scope.parentProperty = parentProperty;
            $scope.rootForm = rootForm;
            $scope.aliasType = aliasType;
            $scope.mode = mode;
            $scope.formulaLanguages = IrisFormStructureService.getFormulaLanguages();
            $scope.formLayouts = IrisFormStructureService.getFormLayouts();
            $scope.property.settings || ($scope.property.settings = {});

            var initialAlias = property.alias;

            function scanForBuildings(form, aliasPrefix, namePrefix) {
                if (!form.properties || !form.properties.length) return;
                form.properties.forEach(p => {
                    var propertyName = p.name || $translate.instant("label.NoName"),
                        newAlias = (aliasPrefix || '') + `["${p.alias}"]`,
                        newName = namePrefix ? `${namePrefix} > ${propertyName}` : propertyName;

                    if (p.type == "FORM") scanForBuildings(p, newAlias, newName);
                    if (p.type == "BUILDING" && p.alias != $scope.property.alias) $scope.parentBuildings.push({
                        id: newAlias,
                        name: newName
                    });
                })
            }

            $scope.forms = [];
            ($scope.property.type == "FORM") && DocumentFormService.query().then(fRes => {
                $scope.forms = fRes.filter(f => f.id != $scope.rootForm.id);
            });

            $scope.buildingTypes = BuildingService.getBuildingTypes();
            $scope.parentBuildings = [];
            ($scope.property.type == "BUILDING") && scanForBuildings($scope.rootForm.structure);

            $scope.accept = function() {
                var similarCount = parentProperty.properties.filter(p => p.alias == property.alias).length;
                if ((mode == "ADD" || initialAlias != property.alias) && similarCount > 0) {
                    alertify.error($translate.instant("message.AliasNotUnique"));
                    return;
                }

                if (property.type == 'FORM' && property.settings.isBarcode) {
                    var barcodeProperty = property.properties.filter(t => t.type == 'BARCODE');
                    if (!barcodeProperty || !barcodeProperty.length) {
                        property.properties.push(new IrisFormStructureService.property('BARCODE', {}, true));
                    }
                } else if (property.type == "FORM" && property.documentFormId) {
                    var linkedForm = $scope.forms.find(f => f.id == property.documentFormId);
                    if (linkedForm && linkedForm.structure && linkedForm.structure.documentFormStructureId) {
                        property.documentFormStructureId = linkedForm.structure.documentFormStructureId;
                        property.structure || (property.structure = {});
                        property.properties = angular.copy(linkedForm.structure.properties);
                    } else {
                        property.documentFormId = null;
                        alertify.error("Linked form is not valid");
                        return;
                    }
                }

                $uibModalInstance.close(property);
            };

            $scope.mapToOptionsDirectory = function(settings) {
                settings.options || (settings.options = []);
                $scope.optionsDirectory = settings.options.map(o => { return { value: o }; });
            };

            if ($scope.property.settings && $scope.property.settings.options) {
                $scope.mapToOptionsDirectory($scope.property.settings);
            }

            $scope.selectImage = function(imageContainer, imageField) {
                var dialog = $window.document.createElement('input');
                dialog.type = 'file';

                dialog.addEventListener('change', function() {
                    if (!dialog.files.length) return;

                    var reader  = new FileReader();
                    reader.onloadend = function () {
                        imageContainer[imageField] = reader.result;
                        $scope.$apply();
                    };
                    reader.readAsDataURL(dialog.files[0]);
                }, false);

                dialog.click();
            };

            $scope.clearImage = function(imageContainer, imageField) {
                imageContainer[imageField] = null;
            };

            $scope.processName = function(forceSet) {
                if ($scope.aliasType != "NAME") return;
                if (!forceSet && $scope.property.alias && $scope.property.alias.trim().length) return;

                $timeout(() => {
                    $scope.property.alias = $filter("latinize")($scope.property.name).replace(/\W+/g, '_').toLowerCase();
                });
            };

            $scope.hasExtraEditor = function(propertyType) {
                return $filter("IrisFilterField")(propertyType,[$scope.propertyTypes, "hasExtraEditor"]);
            };

            $scope.hasDefault = function(propertyType) {
                return !$filter("IrisFilterField")(propertyType,[$scope.propertyTypes, "noDefault"]);
            };
        });
})();