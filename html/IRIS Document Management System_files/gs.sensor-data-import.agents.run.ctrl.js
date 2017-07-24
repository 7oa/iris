(function () {
    angular.module('iris_gs_sensor_data_import').controller('ModuleAgentsRunCtrl',
        function ($scope, $translate, $state, $uibModal, $http, projects, agent, ProgramAgentsService, FileUploader) {
            $scope.agent = agent;

            $scope.gridOptions = {
                columnDefs: [
                    { name: 'key', cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <div iris-field type="text" inline iris-field-label="" iris-field-offset="0" placeholder="{{row.entity.key}}" ng-model="row.entity.key"></div>
                        </div>
                    `},
                    { name: 'value', cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <div iris-field type="text" inline iris-field-label="" iris-field-offset="0" placeholder="{{row.entity.value}}" ng-model="row.entity.value"></div>
                        </div>
                    `}
                ],
                data: []
            };
            $scope.post = {};

            if ($scope.agent.urlSuffix) {
                const result = $scope.agent.urlSuffix.match(/(\{[\w,\d]+\})/gi)
                if (result) {
                    result.forEach((param) => {
                        $scope.gridOptions.data.push({key: param.replace('{', '').replace('}', ''), value: ''})
                    });
                }
            }

            $scope.addNewRow = function() {
                $scope.gridOptions.data.push({ key: '', value: '' })
            };

            $scope.apiRunUrl = iris.config.apiUrl + '/integration/agents-debug/run/' + agent.id;

            let modalInstance;

            $scope.uploader = new FileUploader({
                url: getApiUrl(),
                headers : {
                    'x-iris-access-token': iris.config.accessToken
                },
                onAfterAddingFile: function (item) {
                    item.ownerId = iris.config.me.id;
                    $scope.file = item;
                    modalInstance.close();
                },
                onBeforeUploadItem: function(item) {
                    item.url = getApiUrl();
                },
                onCompleteItem: function(item, response) {
                    $scope.file = null;
                    showResults(response);
                }
            });

            $scope.openUploaderForm = function() {
                modalInstance = $uibModal.open({
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/sensor-data-import/program-agents.uploader.html`,
                    scope: $scope
                });
            };

            $scope.removeFile = function() {
                $scope.file = null;
                $scope.uploader.cancelAll();
            };

            $scope.run = function() {
                if ($scope.file) {
                    $scope.uploader._transformResponse = function(response) {
                        return response.toString();
                    };
                    $scope.uploader.uploadItem(0);
                } else {
                    ProgramAgentsService.run($scope.agent, angular.toJson($scope.post.body), getParams()).then((response) => {
                        showResults(response.result)
                    }).catch((response) => {
                        showResults(response.data.result)
                    })
                }
            };

            function showResults(response) {

                $uibModal.open({
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/sensor-data-import/program-agents.run.result.html`,
                    controller: function($scope, result) {
                        $scope.result = result;
                    },
                    size: 'lg',
                    resolve: {
                        result: () => response
                    }
                });
            }

            function getParams() {
                const result = { };
                if ($scope.gridOptions.data.length) {
                    $scope.gridOptions.data.forEach((item) => result[item.key] = item.value)
                }
                return result;
            }

            function getApiUrl() {
                let params = [];
                if ($scope.gridOptions.data.length) {
                    $scope.gridOptions.data.forEach((item) => params.push(item.key + '=' + item.value));
                }

                return iris.config.apiUrl + '/integration/agents-debug/run/file/' + agent.id + '?' + params.join('&') + '&token=' + iris.config.accessToken;
            }

        })
})();
