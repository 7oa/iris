/**
 * Created by kulmann on 06.05.16.
 */

(function(globals) {
    'use strict';

    globals.angular.module('irisApp').controller('FavoriteProjectMixin', function($scope, ProjectsService) {
        $scope.projects = ProjectsService.getPreloadedProjects();
        $scope.selProjectId = iris.config.favProjectId;
    });

})({ angular, config: iris.config });