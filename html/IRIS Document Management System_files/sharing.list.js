/**
 * Created by herbrichm on 21.07.16.
 */
(function() {
    irisAppDependencies.add('iris_sharing');

    angular.module('iris_sharing', []);

    angular.module('iris_sharing').directive('irisSharingList',
        function ($filter, $timeout, $translate, $q,
                  UserService, UserGroupsService, SensorsService,
                  IrisUtilsService, DataSeriesService, NaviConfigService) {
            return {
                restrict: 'EA',
                scope: {
                    params: '='
                },
                templateUrl: iris.config.componentsUrl + '/sharing/templates/iris-sharing-list.html',
                link: function (scope, element, attrs) {
                    scope.filter = {
                        specificType: 'usergroups' //default
                    };
                    scope.sharingOptions = {
                        type: scope.params.shareType || 'private', //default
                        subject: scope.params.subject,
                        subjectId: scope.params.subjectId,
                        actions: ['access'],
                        restrictions: [true]
                    };

                    scope.$watch('sharingOptions.type', function(newVal, oldVal){
                        scope.params.shareType = scope.sharingOptions.type;
                    }, true);

                    scope.$watch('params', function(newVal, oldVal){
                        scope.sharingOptions = {
                            type: scope.params.shareType || 'private', //default
                            subject: scope.params.subject,
                            subjectId: scope.params.subjectId,
                            actions: ['access'],
                            restrictions: [true]
                        };
                    }, true);

                    scope.sharingMainTypes = [{value:'private', label:$translate.instant('label.Private')},
                        {value:'specific', label:$translate.instant('label.Specific')},
                        {value:'public', label:$translate.instant('label.Public')}];

                    scope.init = function(){
                        scope.selectableUsers = UserService.getUsers();
                        console.log('Available users', scope.selectableUsers);
                    };

                    scope.init();
                    
                }
            }
        }
    );

})();