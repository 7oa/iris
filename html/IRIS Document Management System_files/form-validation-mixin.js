/**
 * Created by kulmann on 06.05.16.
 */

(function() {
    'use strict';

    angular.module('irisApp').directive('irisForm', function ($compile, $translate) {
        return {
            restrict: 'AE',
            link: function (scope, element, attrs) {
                var template = `
                <p class="alert alert-danger" ng-repeat="message in serverErrorMessages">
                    {{::message.message}}
                </p>`;

                scope.serverErrorMessages = [];
                element.prepend($compile(template)(scope));

                scope.$parent.validateForm = function (error, form) {
                    scope.serverErrorMessages = [];
                    if(!error.data || !error.data.details) return;

                    var formName = attrs.name || attrs.ngForm;

                    if(!scope[formName]) return;

                    scope.serverErrorMessages = error.data.details
                        .map(er => {
                            var ngModelCtrl = element.find(`[iris-field][name="${er.entityField}"] [ng-model]:first-child`).controller('ngModel');
                            if(!ngModelCtrl) return;

                            ngModelCtrl.$setValidity('server-validation', false);
                            ngModelCtrl.$viewChangeListeners.push(function validate(){
                                ngModelCtrl.$setValidity('server-validation', true);
                                ngModelCtrl.$viewChangeListeners.length = 0;
                            });

                            return {
                                field: er.entityField,
                                message: $translate.instant(er.code, er.args)
                            };
                        });

                }
            }
        }
    });

})();