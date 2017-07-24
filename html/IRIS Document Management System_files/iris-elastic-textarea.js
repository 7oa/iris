(function () {
    angular.module('irisApp').directive('elastic',
        function($timeout) {
            return {
                restrict: 'A',
                link: function($scope, element) {
                    $scope.initialHeight = $scope.initialHeight || element[0].style.height;
                    let resize = function () {
                        element[0].style.height = $scope.initialHeight;
                        element[0].style.height = "" + element[0].scrollHeight + "px";
                    };
                    element.on("blur keyup change", resize);
                    $timeout(resize, 0);
                }
            };
        });
})();