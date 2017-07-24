(function() {
    angular.module('iris_efv').factory('EfvFiles', function ($resource) {
        return $resource(iris.config.apiUrl + "/external-files-viewer/projects/:projectId/files", {
            projectId: '@projectId'
        });
    });

    angular.module('iris_efv')
        .factory('EfvFileService', function (EfvFiles) {
            return {
                query: (projectId, params) => {
                    params = params || {};
                    angular.extend(params, {
                        projectId: projectId
                    });
                    return EfvFiles.query(params).$promise;
                },

                getFileContentUrl: function (projectId, fileName) {
                    return `${iris.config.apiUrl}/external-files-viewer/projects/${projectId}/files/${fileName}`;
                },

                getFileDownloadUrl: function (projectId, fileName) {
                    return this.getFileContentUrl(projectId, fileName) + '?download=true';
                },

                getFilePreviewUrl: function (projectId, fileName) {
                    return this.getFileContentUrl(projectId, fileName) + '?download=false';
                }
            }
        });
})();
