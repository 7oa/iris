(function () {
    angular.module('iris_projects_devices', []);

    angular.module('iris_projects_devices').directive('irisProjectDevice',
        function ($compile, $filter, $q, ProjectDeviceService, DevicesService) {
            var promises = [];
            promises.push(ProjectDeviceService.getAllProjectDevices());
            promises.push(DevicesService.getDevices().$promise);

            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    value: '=',
                    disabled: '=ngDisabled',
                    required: '=ngRequired'
                },
                link: function (scope, element, attrs) {
                    var isHideLabel = angular.isDefined(attrs.hideLabel);
                    var isInline = angular.isDefined(attrs.inline);
                    var placeholder = attrs.placeholder || "";
                    var offset = attrs.offset ? attrs.offset : 3;
                    offset = isHideLabel ? 0 : offset;
                    var template = `
                    <div iris-field
                         ${isInline ? 'inline' : ''}
                         placeholder="${placeholder}"
                         iris-field-label="${isHideLabel ? '' : `{{::'label.ProjectDevices' | translate}}`}"
                         iris-field-offset="${offset}"
                         type="selectize"
                         iris-select-directory="project_devices"
                         iris-select-optgroup-directory="projects"
                         iris-select-optgroup-field="projectId"
                         ng-required="required"
                         ng-disabled="disabled"
                         ng-model="value">
                    </div>`;
                    element.append($compile(template)(scope));

                    scope.project_devices = [];
                    scope.devices = [];

                    $q.all(promises).then(results => {
                        scope.devices = results[1];
                        scope.project_devices = results[0].map(pd => {
                            pd.name = $filter('IrisFilterField')(pd.deviceId, [scope.devices]);
                            return pd;
                        });
                    });
                },
                controller: function ($scope, ProjectsService){
                    $scope.projects = ProjectsService.getPreloadedProjects();
                }
            };
        });
})();