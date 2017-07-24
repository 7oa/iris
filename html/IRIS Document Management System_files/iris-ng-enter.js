(function () {
    angular.module('irisApp').directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown", function (e) {
                if (e.which === 13) {
                    if (e.ctrlKey || e.shiftKey) {
                        this.value += "\n";
                    } else {
                        scope.$apply(function () {
                            scope.$eval(attrs.ngEnter, {'e': e});
                        });
                    }
                    e.preventDefault();
                }
            });
        };
    });
})();