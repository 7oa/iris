(function () {
    angular.module('iris_gs_system').controller('ModuleSystemCountriesViewCtrl', function ($scope, $translate, uiGridConstants, CountryList, CountriesService) {
        $scope.countries = CountryList.countries;
        var keyField = CountriesService.getKeyField();

        var refreshItems = function () {
            CountriesService.query().then(res => {
                $scope.countries.forEach(t => {
                    t.isSelected = !!res.find(k => k[keyField] === t[keyField]);
                });
                $scope.gridApi.core.refresh();
            });
        };
        refreshItems();

        $scope.toggleSelected = function(country) {
            if (country.isSelected) {
                CountriesService.remove(country).then(() => refreshItems());
            } else {
                CountriesService.save(country).then(() => refreshItems());
            }
        };

        $scope.gridOptions = {
            data: 'countries',

            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,

            enableFiltering: true,

            onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            },

            columnDefs: [
                {
                    field: 'isSelected',
                    width: '100',
                    displayName: $translate.instant('label.IsUsed'),
                    enableFiltering: false,
                    sort: {
                        direction: uiGridConstants.DESC,
                        priority: 0
                    },
                    cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-link"
                                        uib-tooltip="{{'label.ToggleIsUsed' | translate}}"
                                        ng-click="grid.appScope.toggleSelected(row.entity); $event.stopPropagation();">
                                    <i class="fa"
                                       ng-class="{'fa-check text-success': row.entity.isSelected,
                                                  'fa-times text-danger': !row.entity.isSelected}"></i>
                                </button>
                            </div>`
                }, {
                    field: 'name',
                    width: '*',
                    displayName: $translate.instant('label.Name')
                }, {
                    field: 'isoAlpha3',
                    width: '*',
                    displayName: $translate.instant('label.Code')
                }, {
                    field: 'flag',
                    width: '*',
                    displayName: $translate.instant('label.Flag'),
                    enableFiltering: false,
                    cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <img ng-src="data:image/gif;base64,{{row.entity.flag}}" alt="flag"/>
                            </div>`
                }
            ]
        };
    });
})();
