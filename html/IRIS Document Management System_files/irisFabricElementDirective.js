(function () {

    angular.module('irisFabric')
        .directive('irisFabricElement', function () {
            return {
                restrict: 'AE',
                require: '^irisFabric',
                replace: false,

                scope: {
                    properties: '='
                },

                link: function ($scope, element, attrs, controller) {
                    var irisFabricScope = controller.getIrisFabricScope();

                    irisFabricScope.getFabricEditor().then((fabricEditor) => {
                        if (irisFabricScope.onElementAddHandler && (typeof irisFabricScope.onElementAddHandler === "function"))
                            irisFabricScope.onElementAddHandler.call(irisFabricScope.api, $scope.properties);

                        $scope.$on('$destroy', function () {
                            $scope.properties.dispose();
                            fabricEditor.renderAll();
                        });

                        if ($scope.properties.elementType === "group") {
                            $scope.properties.elements.forEach((e) => {
                                if (irisFabricScope.elements.indexOf(e) < 0)
                                    irisFabricScope.elements.push(e);
                            });
                        }

                        if (!$scope.properties.elementName) {
                            var amountOfElements = irisFabricScope.elements.filter(e => e.elementType === $scope.properties.elementType).length,
                                elementType = $scope.properties.elementType;
                            $scope.properties.elementName = `${elementType.name} ${amountOfElements}`;
                        }

                        $scope.refreshElementState = function () {
                            $scope.properties.refreshState(irisFabricScope.api.getManagedVariables());
                            fabricEditor.renderAll();
                        };

                        if ($scope.properties.attached && $scope.properties.viewObject) {
                            $scope.properties.attach();
                            fabricEditor.renderAll();
                            if ($scope.properties.activateOnCreate) fabricEditor.setActiveObject($scope.properties.viewObject);
                            $scope.refreshElementState();
                        }

                        var applyElementChanges = function (newValue, oldValue) {
                            if (newValue != oldValue) {
                                $scope.refreshElementState();
                            }
                        };

                        $scope.$watch('properties.stateDefault', applyElementChanges, true);
                        $scope.$watch('properties.dataSeriesValue', applyElementChanges, true);
                        $scope.$watch('properties.stateConditions', applyElementChanges, true);
                        $scope.$watch('properties.dataSeries', applyElementChanges, true);
                        $scope.$watch('properties.dataSeriesMin', applyElementChanges, true);
                        $scope.$watch('properties.dataSeriesMax', applyElementChanges, true);
                        $scope.$watch('properties.dataSeriesValue', applyElementChanges, true);
                        $scope.$watch('properties.dataSeriesMinValue', applyElementChanges, true);
                        $scope.$watch('properties.dataSeriesMaxValue', applyElementChanges, true);
                    });
                }
            };
        });
})();