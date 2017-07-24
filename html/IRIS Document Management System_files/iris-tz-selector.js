
(function() {

    irisAppDependencies.add("iris_tz_selector");

    angular.module("iris_tz_selector", ["iris_time"]);

    angular.module("iris_tz_selector").controller("IrisTimeZoneSelector", ["$scope", "irisTime", function ($scope, irisTime) {

        var sProjectTimeZone = irisTime.selectedProjectTimeZone;
        var sUserTimeZone    = irisTime.configuredUserTimeZone;

        var aTimeZoneDescriptors = [];

        if(sProjectTimeZone) {
            aTimeZoneDescriptors.push({
                value:  sProjectTimeZone,
                title:  sProjectTimeZone.replace(/\_/g,' '),
                icon:   "home"
            });
        }

        if(sUserTimeZone && sUserTimeZone != sProjectTimeZone) {
            aTimeZoneDescriptors.push({
                value:  sUserTimeZone,
                title:  sUserTimeZone.replace(/\_/g,' '),
                icon:   "user"
            });
        }

        var oSelectedTimeZone = aTimeZoneDescriptors.filter(function(o){return o.value == irisTime.effectiveGlobalTimeZone;})[0]

        aTimeZoneDescriptors.selected = oSelectedTimeZone;

        $scope.selectableTimeZones = aTimeZoneDescriptors;

        $scope.selectionEnabled = irisTime.timeZoneSelectionEnabled && aTimeZoneDescriptors.length > 1;

        $scope.$watch(function(){return irisTime.timeZoneSelectionEnabled;},function(bEnabled)
        {
            $scope.selectionEnabled = bEnabled && aTimeZoneDescriptors.length > 1;
        });

        $scope.selectTimeZone = function(sTimeZone) {

            var oTimeZoneDescriptor = aTimeZoneDescriptors.filter(function(o){return o.value == sTimeZone;})[0];

            if (oTimeZoneDescriptor) {

                irisTime.configuredGlobalTimeZone = sTimeZone;

                aTimeZoneDescriptors.selected = oTimeZoneDescriptor;
            }
        };

        $scope.$watch(function(){return irisTime.effectiveGlobalTimeZone;},function(sNewZone, sOldZone)
        {
            $scope.selectTimeZone(sNewZone);
        });
    }]);

    angular.module("iris_tz_selector").directive("irisTimeZoneSelectField", [function () {

        var directive = {

            templateUrl: iris.config.componentsUrl + "/time/templates/iris-time-zone-select-field.view.html"

        };

        return directive;
    }]);

    // Disable timezone selector until it is clarified
    // if it is needed anyway and if so where to put it !
    //
    //$(function() {
    //
    //    var oJqoHost = $("<li ng-controller='IrisTimeZoneSelector' iris-time-zone-select-field='' class='dropdown top-level'></li>");
    //
    //    $("#iris-master-options > #info-bar > ol").prepend(oJqoHost);
    //
    //    angular.element(document).injector().invoke(function ($compile) {
    //
    //        var scope = angular.element(oJqoHost).scope();
    //
    //        $compile(oJqoHost)(scope);
    //    });
    //});

}());