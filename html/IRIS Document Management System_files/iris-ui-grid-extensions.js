(function () {
    angular.module('irisApp').decorator('GridOptions', function ($delegate, uiGridConstants) {
        var initialize = $delegate.initialize;

        $delegate.initialize = function (baseOptions) {
            baseOptions.enablePaginationControls = !!baseOptions.enablePaginationControls;
            baseOptions.showGridFooter = angular.isDefined(baseOptions.showGridFooter) ? baseOptions.showGridFooter : true;
            baseOptions.paginationPageSize = baseOptions.paginationPageSize || 25;
            baseOptions.minRowsToShow = baseOptions.minRowsToShow || 25;
            baseOptions.rowHeight = baseOptions.rowHeight || 40;
            baseOptions.virtualizationThreshold = baseOptions.virtualizationThreshold || 25;
            baseOptions.enableColumnMenus = !!baseOptions.enableColumnMenus;
            baseOptions.enableVerticalScrollbar = typeof(baseOptions.enableVerticalScrollbar) !== "undefined" ? baseOptions.enableVerticalScrollbar : uiGridConstants.scrollbars.NEVER;
            baseOptions.enableHorizontalScrollbar = typeof(baseOptions.enableHorizontalScrollbar) !== "undefined" ? baseOptions.enableHorizontalScrollbar : uiGridConstants.scrollbars.NEVER;
            baseOptions.gridFooterTemplate = baseOptions.gridFooterTemplate || "<div iris-ui-grid-footer></div>";

            return initialize.apply(this, arguments);
        };

        return $delegate;
    });

    angular.module('irisApp').config(function ($provide) {

        $provide.decorator('GridOptions', function($delegate, i18nService) {

            if (iris.config.me.profile.language) {
                console.log("Set the language for ui-grid to " + iris.config.me.profile.language);
                i18nService.setCurrentLang(iris.config.me.profile.language);
            }

            return $delegate;
        });
    });

    angular.module('irisApp').decorator('FileUploader', function($delegate) {
        $delegate.prototype.onAfterAddingFile = function (fileItem) {
            fileItem.headers = {
                'x-iris-access-token': iris.config.accessToken
            };
        };

        return $delegate;
    })

    angular.module('irisApp').directive('irisUiGridFooter', function () {
        return {
            restrict: 'AE',
            replace: true,
            template: `
            <div class="ui-grid-footer-info ui-grid-grid-footer flex-grid ui-grid-footer-style-{{ style }}">
                <div class="flex-col-4 items-info">
                    {{ 'label.TotalItems' | translate }} {{ grid.rows.length < grid.options.totalItems ? grid.options.totalItems : grid.rows.length }}
                    <span ng-if="grid.selection.selectedCount !== 0 && grid.options.enableFooterTotalSelected">({{ "search.selectedItems" | t }} {{ grid.selection.selectedCount }})</span>
                </div>

                <div class="flex-col-auto" ng-if="grid.api.pagination.getTotalPages() > 1 && style == 'old'">
                    <span>{{'label.CurrentPage' | translate}}: {{grid.api.pagination.getPage() }} of {{ grid.api.pagination.getTotalPages() }}</span>
                    <button class="btn btn-link" ng-click="grid.api.pagination.previousPage()"><i class="fa fa-angle-left"></i> {{'label.PreviousPage' | translate}}</button>
                    <button class="btn btn-link" ng-click="grid.api.pagination.nextPage()">{{'label.NextPage' | translate}} <i class="fa fa-angle-right"></i></button>
                </div>

                <div class="btn-toolbar flex-col-auto" ng-if="pagination.getTotalPages() > 1 && style == 'new'">
                    <button type="button" class="btn btn-link ui-grid-pager-first" title="{{'label.FirstPage' | translate}}" ng-click="pagination.seek(1)">
                        <span class="fa fa-fast-backward"></span>
                    </button>
                    <button type="button" class="btn btn-link ui-grid-pager-previous" title="{{'label.PreviousPage' | translate}}" ng-click="pagination.previousPage()">
                        <span class="fa fa-step-backward"></span>
                    </button>
                    <div class="pages-info">
                        {{'label.CurrentPage' | translate}}: <input type="number" class="form-control" max="{{ pagination.getTotalPages() }}" min="1" ng-model="grid.options.paginationCurrentPage" /> of {{ pagination.getTotalPages() }}
                    </div>
                    <button type="button" class="btn btn-link ui-grid-pager-next" title="{{'label.NextPage' | translate}}" ng-click="pagination.nextPage()">
                        <span class="fa fa-step-forward"></span>
                    </button>
                    <button type="button" class="btn btn-link ui-grid-pager-last" title="{{'label.LastPage' | translate}}" ng-click="pagination.seek(pagination.getTotalPages())">
                        <span class="fa fa-fast-forward"></span>
                    </button>
                </div>
            </div>`,
            controller: function($scope) {
                $scope.style = $scope.grid.options.gridFooterStyle || 'new';
                $scope.pagination = $scope.grid.api.pagination;
            }
        }
    });

    angular.module('irisApp').directive('irisUiGridRow', function () {
        return {
            restrict: 'AE',
            replace: true,
            template: `
            <div ng-dblclick="grid.appScope.onDblClick(row)"
                 ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"
                 class="ui-grid-cell"
                 ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader }"
                 ui-grid-cell></div>`
        }
    });

    angular.module('irisApp').directive('irisUiGridRowGrouping', function () {
        return {
            restrict: 'AE',
            replace: true,
            template: `
            <div ng-click="row.grid.api.treeBase.toggleRowTreeState(col.field !== 'treeBaseRowHeaderCol' ? row : {})"
                 ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"
                 class="ui-grid-cell"
                 ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader }"
                 ui-grid-cell ></div>`
        }
    });

    angular.module('irisApp').directive('irisUiGridRowDraggable', function () {
        return {
            restrict: 'AE',
            replace: true,
            template: `
                <div grid="grid" class="ui-grid-draggable-row" draggable="true">
                    <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"
                         class="ui-grid-cell"
                         ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader, 'custom': true }"
                         ui-grid-cell></div>
                </div>`
        }
    });

    angular.module('irisApp').run(function($templateCache){
        $templateCache.put('ui-grid/ui-grid-filter',
            `<div class="ui-grid-filter-container" 
                  ng-repeat="colFilter in col.filters" 
                  ng-class="{'ui-grid-filter-cancel-button-hidden' : colFilter.disableCancelFilterButton === true }">
                 <div ng-if="colFilter.type !== 'select'">
                     <input type="text" 
                            class="ui-grid-filter-input ui-grid-filter-input-{{$index}}" 
                            ng-model="colFilter.term" 
                            ng-model-options="{ updateOn: 'default blur', debounce: { 'default': 500, 'blur': 0 } }"
                            ng-attr-placeholder="{{colFilter.placeholder || ''}}" 
                            aria-label="{{colFilter.ariaLabel || aria.defaultFilterLabel}}">
                     <div role="button" 
                          class="ui-grid-filter-button" 
                          ng-click="removeFilter(colFilter, $index)" 
                          ng-if="!colFilter.disableCancelFilterButton" 
                          ng-disabled="colFilter.term === undefined || colFilter.term === null || colFilter.term === ''" 
                          ng-show="colFilter.term !== undefined && colFilter.term !== null && colFilter.term !== ''">
                         <i class="ui-grid-icon-cancel" 
                            ui-grid-one-bind-aria-label="aria.removeFilter">&nbsp;</i>
                     </div>
                 </div>
                 <div ng-if="colFilter.type === 'select'">
                     <select class="ui-grid-filter-select ui-grid-filter-input-{{$index}}" 
                             ng-model="colFilter.term" 
                             ng-attr-placeholder="{{colFilter.placeholder || aria.defaultFilterLabel}}" 
                             aria-label="{{colFilter.ariaLabel || ''}}" 
                             ng-options="option.value as option.label for option in colFilter.selectOptions">
                         <option value=""></option>
                     </select>
                     <div role="button" 
                          class="ui-grid-filter-button-select" 
                          ng-click="removeFilter(colFilter, $index)"
                          ng-if="!colFilter.disableCancelFilterButton" 
                          ng-disabled="colFilter.term === undefined || colFilter.term === null || colFilter.term === ''"
                          ng-show="colFilter.term !== undefined && colFilter.term != null">
                         <i class="ui-grid-icon-cancel" 
                            ui-grid-one-bind-aria-label="aria.removeFilter">&nbsp;</i>
                     </div>
                </div>
            </div>`
        );
    });
    
})();