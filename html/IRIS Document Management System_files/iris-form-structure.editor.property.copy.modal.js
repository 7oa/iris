(function() {
    angular.module('irisForm')
        .controller('IrisFormStructureEditorPropertyCopyModalCtrl', function ($scope, $uibModalInstance, $translate, $filter, rootForm, property, IrisFormStructureService) {
            $scope.forms = [];
            $scope.selectedForm = null;

            var rootAlias = "__ROOT__";

            $scope.forms.push({
                id: rootAlias,
                name: $translate.instant('label.Root'),
                entity: rootForm.structure
            });

            function scanForForms(form, aliasPrefix, namePrefix) {
                if (!form.properties || !form.properties.length) return;
                form.properties.forEach(p => {
                    var propertyName = p.name || $translate.instant("label.NoName"),
                        newAlias = aliasPrefix ? `${aliasPrefix}.${p.alias}` : p.alias,
                        newName = namePrefix ? `${namePrefix} > ${propertyName}` : propertyName;

                    if (p.type == "FORM" && !p.settings.documentFormId) {
                        $scope.forms.push({
                            id: newAlias,
                            name: newName,
                            entity: p
                        });

                        scanForForms(p, newAlias, newName);
                    }
                })
            }
            scanForForms(rootForm.structure, rootAlias, $translate.instant('label.Root'));

            $scope.copy = function() {
                var clonedProperty = IrisFormStructureService.flushAlias(angular.copy(property), "GUID"),
                    targetForm = $filter("IrisFilterField")($scope.selectedForm, [$scope.forms, "entity"]);
                targetForm.properties.push(clonedProperty);
                $uibModalInstance.close();
            };

            $scope.close = function() {
                $uibModalInstance.close();
            };
        });
})();