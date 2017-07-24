/**
 * Created by m.behrens on 21.12.16.
 */
(function () {
    angular.module('iris_sensorboards').directive('sensorboardDetailsView',
        function ($q, $filter, $compile) {
            return {
                restrict: 'AE',
                template: `<div class="sensorboards-details">
                                <h3>{{sensorboard.name}}</h3>
                                <p>{{sensorboard.description}}</p>
                                <dl class="dl-horizontal">
                                    <dt>
                                        {{'label.CreatedBy' | translate}}
                                    </dt>
                                    <dd>
                                        {{sensorboard.createdBy | irisUser}}
                                    </dd>
                                    <dt>
                                        {{'label.CreatedOn' | translate}}
                                    </dt>
                                    <dd>
                                        {{sensorboard.createdOn | irisTime:this:'@{date}'}}
                                    </dd>
                                    <dt>
                                        {{'label.UpdatedBy' | translate}}
                                    </dt>
                                    <dd>
                                        {{sensorboard.updatedBy | irisUser}}
                                    </dd>
                                    <dt>
                                        {{'label.UpdatedOn' | translate}}
                                    </dt>
                                    <dd>
                                        {{sensorboard.updatedOn | irisTime:this:'@{date}'}}
                                    </dd>
                                    <dt>
                                        {{'label.RefreshInterval' | translate}}
                                    </dt>
                                    <dd>
                                        {{sensorboard.refreshInterval}}
                                    </dd>
                                </dl>
                            </div>`,
                replace: true,
                scope: {
                    sensorboard: "="
                },
                link: function ($scope, $element, $attrs) {

                    console.log($scope);
                }
            };
        });
})();