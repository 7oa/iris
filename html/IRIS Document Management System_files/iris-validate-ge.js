(function(globals) {
    globals.angular.module('irisApp').directive('irisValidateGe', function ($compile) {

        var directive = {
            restrict: 'A',
            require: 'ngModel',

            link: function(scope, elem, attr, ngModel) {
                var edge = attr.irisValidateGe ? Number(attr.irisValidateGe) : 0;

                //For DOM -> model validation
                ngModel.$parsers.unshift(function(value) {
                    var valid = Number(value) >= edge;
                    ngModel.$setValidity('irisValidateGe', valid);
                    return valid ? value : undefined;
                });

                //For model -> DOM validation
                ngModel.$formatters.unshift(function(value) {
                    ngModel.$setValidity('irisValidateGe', Number(value) >= edge);
                    return value;
                });
            }
        };

        return directive;
    });
})({
    angular,
    config: iris.config
});
