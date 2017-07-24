(function(globals) {
    'use strict';

    globals.angular.module('irisApp').directive('irisEditableTextarea',
        function($timeout) {

            return {
                restrict: 'EA',

                scope: {
                    value: '=',
                    translations: '=',
                    required: '=ngRequired',
                    editable: '=',
                    model: '=model',
                    label: '=',
                    save: '='
                },

                replace: true,

                template: `
                    <p ng-click="canEdit=editable"
                       class="editable-textfield"
                       ng-mouseover="hasHover=true"
                       ng-mouseleave="hasHover=false;">

                        <textarea class="form-control editable"
                                  ng-model="model"
                                  ng-disabled="!canEdit"></textarea>
                        <i class="fa fa-pencil" ng-show="hasHover && editable && !canEdit" ></i>
                        <i class="fa fa-check" ng-show="canEdit" ng-click="saveModel()" ></i>
                        <i class="fa fa-times" ng-show="canEdit" ng-click="cancelEdit()"></i>
                    </p>`,

                controller: function($scope) {
                    $scope.saveModel = () => {
                        $timeout(() => {
                            $scope.save();
                            $scope.canEdit = false;
                        });
                    };

                    $scope.cancelEdit = () => {
                        $timeout(() => {
                            $scope.canEdit = false;
                        })
                    };
                }
            }
    });
})({
    angular: angular,
    config: iris.config
});
