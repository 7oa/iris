(function () {
    var module = angular.module('irisSpoilManagement');
    module.controller('SpoilManagementConfigCtrl',
        function ($scope, $translate) {
            $scope.tabs = [{
                title: $translate.instant('label.ViewOptions'),
                contentUrl: iris.config.widgetsUrl + '/iris-spoil-management/templates/iris-spoil-management.tabs.config.html'
            }]
        });

})();