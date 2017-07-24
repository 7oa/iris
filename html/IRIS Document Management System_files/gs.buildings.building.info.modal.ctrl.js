(function () {
    angular.module('iris_gs_buildings').controller('ModuleBuildingInfoModalCtrl',
        function ($scope, building, parentBuilding) {
            $scope.building = building;
            $scope.parentBuilding = parentBuilding;
        });
})();
