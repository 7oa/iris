(function() {
    angular.module('irisProtocolStructure')
        .directive('irisProtocolStructureFieldPlans', function($state, $uibModal, DpmPlanService, FilesService) {
            return {
                restrict: 'AE',

                scope: {
                    property: '=',
                    ngModel: '='
                },

                template: `
                    <div class="selectize-control multi iris-selectize dpm-plans-selectize">
                        <div class="selectize-input has-items" ng-style="!readonly && {'padding-right':'36px'} || {'padding-right':'6px'}">
                            <div ng-repeat="plan in selectedPlans" class="item" ng-style="readonly && {'padding-right':'40px'} || {'padding-right': '60px'}">
                                {{plan.planNumber}}
                                <a href="javascript:void(0)" class="btn-link dpm-plans-inner-btn" ng-if="plan.fileId" ng-style="readonly && {'right':'23px'} || {'right': '40px'}" tabindex="-1" uib-tooltip="{{::'label.Preview' | translate}}"><i class="fa fa-search" ng-click="previewItem(plan)"></i></a>
                                <a ng-href="{{getItemDownloadUrl(plan.fileId)}}" class="btn-link dpm-plans-inner-btn" ng-if="plan.fileId" ng-style="readonly && {'right':'6px'} || {'right': '23px'}" tabindex="-1" uib-tooltip="{{::'label.Download' | translate}}"><i class="fa fa-download"></i></a>
                                <a href="javascript:void(0)" class="btn-link dpm-plans-inner-btn" ng-if="!readonly" style="right: 6px;" tabindex="-1" uib-tooltip="{{::'label.Remove' | translate}}" ng-click="removeItem(plan)"><i class="fa fa-trash-o"></i></a>
                            </div>

                            <span class="btn btn-link dpm-plans-select-btn"
                                  uib-tooltip="{{::'label.Select' | translate}}"
                                  ng-if="!readonly"
                                  ng-click="openSelectPlansModal()">
                                <i class="fa fa-list"></i>
                            </span>
                        </div>
                    </div>`,

                link: function(scope, element, attrs) {
                    var projectId = $state.params.projectId;
                    scope.readonly = (attrs["readonly"] === 'true');

                    function refreshSelectedPlans() {
                        scope.selectedPlans = scope.ngModel
                            ? scope.plans.filter(p => scope.ngModel.indexOf(p.id) >= 0)
                            : [];
                    }

                    scope.plans = [];
                    scope.plansPromise = DpmPlanService.query(projectId).then(res => {
                        scope.plans = res;
                        refreshSelectedPlans();
                    });

                    scope.removeItem = function(item) {
                        if (!item || !item.id || !scope.ngModel || !scope.ngModel.length) return;
                        var itemIndex = scope.ngModel.indexOf(item.id);
                        if (itemIndex >= 0) scope.ngModel.splice(itemIndex, 1);
                    };

                    scope.previewItem = function(item) {
                        FilesService.openPreviewFile(item.fileId, item.file);
                    };

                    scope.getItemDownloadUrl = function(fileId) {
                        return FilesService.getFileDownloadUrl(fileId);
                    };

                    scope.openSelectPlansModal = function () {
                        $uibModal.open({
                            templateUrl: iris.config.componentsUrl + '/iris-protocol-structure/templates/iris-protocol-structure.field.plans.modal.html',
                            controller: 'IrisProtocolStructureFieldPlansModal',
                            size: 'lg',
                            resolve: {
                                'plans': () => scope.plans,
                                'selectedPlans': () => scope.selectedPlans || []
                            }
                        }).result.then((selectedPlans) => {
                            scope.ngModel = selectedPlans.map(t => t.id);
                        });
                    };

                    scope.$watch("ngModel", (nv, ov) => {
                        if (angular.equals(nv, ov)) return;
                        refreshSelectedPlans();
                    }, true);
                }
            }
        });
})();