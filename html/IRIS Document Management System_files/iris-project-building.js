(function () {
    angular.module('iris_projects_buildings', []);

    angular.module('iris_projects_buildings').directive('irisProjectBuilding',
        function ($compile, $filter, $timeout, BuildingService) {
            return {
                restrict: 'EA',
                replace: true,

                scope: {
                    valueHolder: '=',
                    disabled: '=ngDisabled',
                    required: '=ngRequired'
                },

                controller: function ($scope, ProjectsService){
                    $scope.projects = ProjectsService.getPreloadedProjects();
                    $scope.project_buildings = [];
                    $scope.buildings = [];
                },

                link: function (scope, element, attrs) {
                    var isHideLabel = angular.isDefined(attrs.hideLabel);
                    var isInline = angular.isDefined(attrs.inline);
                    var autoInit = angular.isDefined(attrs.autoInit);
                    var placeholder = attrs.placeholder || "";
                    var offset = attrs.offset ? attrs.offset : 3;
                    var buildingIdField = attrs.buildingField || "buildingId";
                    var projectIdField = attrs.projectField || "projectId";
                    var buildingTypeFilter = attrs.buildingType ? JSON.parse(attrs.buildingType.replace(/'/g, "\"")) : ["TUNNEL", "STORAGE"];
                    offset = isHideLabel ? 0 : offset;

                    var template = `
                    <div iris-field
                         ${isInline ? 'inline' : ''}
                         placeholder="${placeholder}"
                         iris-field-label="${isHideLabel ? '' : `{{::'label.ProjectBuildings' | translate}}`}"
                         iris-field-offset="${offset}"
                         type="selectize"
                         iris-select-directory="project_buildings"
                         iris-select-optgroup-directory="projects"
                         iris-select-optgroup-field="projectId"
                         ng-required="required"
                         ng-disabled="disabled"
                         ng-model="value">
                    </div>`;
                    element.append($compile(template)(scope));

                    BuildingService.queryByType(buildingTypeFilter).then(res => {
                        var source = [];

                        scope.projects.forEach(p => {
                            res.filter(b => b.projectIds && b.projectIds.filter(pb => pb.projectId == p.id).length).forEach(b => {
                                source.push({id: '' + p.id + b.id, projectId: p.id, buildingId: b.id, name: b.name});
                            });
                        });

                        scope.buildings = res;
                        scope.project_buildings = source;

                        if (autoInit && !scope.valueHolder[buildingIdField] && scope.project_buildings.length) {
                            scope.value = scope.project_buildings[0].id;
                        }
                    });

                    function processValueHolder() {
                        var newValue = null;
                        if (scope.valueHolder[projectIdField] && scope.valueHolder[buildingIdField]) {
                            newValue = '' + scope.valueHolder[projectIdField] + scope.valueHolder[buildingIdField];
                        }
                        if (scope.value != newValue) scope.value = newValue;
                    }
                    processValueHolder();

                    scope.$watch("valueHolder." + projectIdField, function(nv, ov) {
                        if (nv == ov) return;
                        //console.log("p", nv);
                        $timeout(() => processValueHolder());
                    });

                    scope.$watch("valueHolder." + buildingIdField, function(nv, ov) {
                        if (nv == ov) return;
                        //console.log("b", nv);
                        $timeout(() => processValueHolder());
                    });

                    scope.$watch("value", function(nv, ov) {
                        if (nv == ov) return;
                        //console.log("pb", nv);
                        $timeout(() => {
                            var newProjectId = $filter("IrisFilterField")(nv, [scope.project_buildings, 'projectId']),
                                newBuildingId = $filter("IrisFilterField")(nv, [scope.project_buildings, 'buildingId']);

                            if (!scope.valueHolder[projectIdField] || scope.valueHolder[projectIdField] != newProjectId) scope.valueHolder[projectIdField] = newProjectId;
                            if (!scope.valueHolder[buildingIdField] || scope.valueHolder[buildingIdField] != newBuildingId) scope.valueHolder[buildingIdField] = newBuildingId;
                        });
                    });
                }
            };
        });
})();