(function(globals) {

    'use strict';

    globals.angular.module('iris_gs_workshift_management_internal_comment_security').controller('InternalCommentSecurityEditCtrl',
        function($scope, $translate, SecurityService, ProjectsService, UserGroupsService) {

            $scope.projects = ProjectsService.getProjects();
            console.log('Projects: ', $scope.projects);
            $scope.userGroups = UserGroupsService.getUserGroups();
            console.log('UserGroups: ', $scope.userGroups);


            $scope.openInternalCommentRightsModal = function(projectId) {
                const subject = 'Project';
                const action = ['readInternalComments'];
                const restriction = [true];

                SecurityService.openSubjectPermissionsModal(subject, projectId, action, restriction);
            }

            $scope.gridOptions = {
                data: 'projects',
                enableFullRowSelection: false,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'number',
                        width: '200',
                        displayName: $translate.instant('label.Number')
                    },
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name')
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: '100',
                        enableSorting: false,
                        cellTemplate: `<div class="ui-grid-cell-contents actions">
                                        <button class="btn btn-default"
                                                uib-tooltip="{{'label.SetPermissions' | translate}}"
                                                ng-click="grid.appScope.openInternalCommentRightsModal(row.entity.id)">
                                            <i class="fa fa-shield"></i>
                                        </button>`
                    }
                ]
            };

    });

})(
    {
        angular: angular,
        alertify: alertify
    }
);
