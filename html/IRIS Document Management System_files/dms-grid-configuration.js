(function() {
    angular.module('iris_docs').factory('DmsGridConfigurationService',
        function ($translate) {

            const defaultActionsList = [
                { name: $translate.instant('label.Download'), alias: 'download', icon: 'fa-download' },
                { name: $translate.instant('label.Preview'), alias: 'preview', icon: 'fa-eye' },
                { name: $translate.instant('label.Edit'), alias: 'edit', icon: 'fa-pencil' },
                { name: $translate.instant('label.dms.LockFile') + '/' + $translate.instant('label.dms.UnLockFile'), alias: 'unlock', icon: 'fa-lock' },
                { name: $translate.instant('label.dms.ShareFile'), alias: 'share', icon: 'fa-link' },
                { name: $translate.instant('label.dms.CopyFileLink'), alias: 'copy-file-link', icon: 'fa-hashtag' },
                { name: $translate.instant('label.dms.UploadNewVersion'), alias: 'upload', icon: 'fa-upload' },
                { name: $translate.instant('label.dms.EditLocally'), alias: 'edit-locally', icon: 'fa-desktop' },
                { name: $translate.instant('label.dms.MoveToFolder'), alias: 'move-to-folder', icon: 'fa-reply' },
                { name: $translate.instant('label.Remove'), alias: 'remove', icon: 'fa-trash-o' },
                { name: $translate.instant('label.dms.Favorite'), alias: 'favorite', icon: 'fa-star' },
            ];

            const actionsHeaderTemplate = `<div class="ngHeaderSortColumn {{col.headerClass}}" ng-style="{'cursor': col.cursor}" ng-class="{ 'ngSorted': !noSortVisible }"
                                                style="top: 5px; left: 10px; position: relative">
                                                <div ng-class="'colt' + col.index" class="ngHeaderText" uib-dropdown dropdown-append-to-body>{{col.displayName}} 
                                                    <button class="btn btn-default" uib-dropdown-toggle style="padding: 0px 5px; margin-left: 5px">
                                                        <i class="fa fa-ellipsis-h"></i>
                                                    </button>
                                                    <ul uib-dropdown-menu role="menu">
                                                        <li ng-repeat="a in grid.appScope.defaultActionsList" style="cursor: pointer">
                                                            <a ng-click="grid.appScope.setActionsVisibility(a.alias); $event.stopPropagation();">
                                                                <i class="fa fa-fw {{grid.appScope.dmsGridConfig.settings.actions.visibility[a.alias] ? 'fa-check text-success' : 'fa-times text-danger'}}"></i> 
                                                                <i class="fa fa-fw {{a.icon}}"></i> {{a.name}}
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                             </div>
                                             <div ng-show="col.resizable" class="ngHeaderGrip" ng-click="col.gripClick($event)" ng-mousedown="col.gripOnMouseDown($event)"></div>`;

            const filesGridDefaultColDefs = [
                {
                    name: 'name',
                    field: 'name',
                    width: '**',
                    displayName: $translate.instant('label.Name'),
                    enableSorting: true,
                    cellTemplate: `
                        <div class="ui-grid-cell-contents" iris-drag-drop="drag" iris-drag-data="{fileId: row.entity.id}" iris-drag-data-getter="grid.appScope.getSelectedFilesIds()">
                            <a href="javascript:void(0)" uib-tooltip="{{row.entity.name}}"
                               ng-click="grid.appScope.setSelectedFile(row.entity)">
                                <i class="fa fa-fw {{::grid.appScope.getFileIcon(row.entity.mimeType)}}"></i> {{row.entity.name}}
                            </a>
                        </div>`
                },
                {
                    name: 'actions',
                    displayName: $translate.instant('label.Actions'),
                    width: 250,
                    enableSorting: false,
                    headerCellTemplate: actionsHeaderTemplate,
                    cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <a ng-href="{{grid.appScope.getFileDownloadUrl(row.entity.id)}}"
                               class="btn btn-link"
                               uib-tooltip="{{'label.Download' | translate}}"
                               ng-if="grid.appScope.dmsGridConfig.settings.actions.visibility['download']">
                                <i class="fa fa-download"></i></a>
                            <button ng-click="grid.appScope.openPreviewFile(row.entity)"
                                    class="btn btn-link"
                                    ng-disabled="!grid.appScope.previewAllowed(row.entity)"
                                    uib-tooltip="{{'label.Preview' | translate}}"
                                    ng-if="grid.appScope.dmsGridConfig.settings.actions.visibility['preview']">
                                <i class="fa fa-eye"></i>
                            </button>
                            <button class="btn btn-link" uib-tooltip="{{'label.Edit' | translate}}"
                                    ng-if="grid.appScope.dmsGridConfig.settings.actions.visibility['edit'] && 
                                    (grid.appScope.hasPermission(folder.id, 'update') || grid.appScope.hasPermission('DMS', 'config', 'Module'))"
                                    ng-disabled="folder.isLocked || row.entity.isLocked"
                                    ng-click="grid.appScope.openEditFile(row.entity)"><i class="fa fa-pencil"></i></button>
                            <button class="btn btn-link"
                                    ng-if="(grid.appScope.hasPermission(grid.appScope.folder.id, 'update') || grid.appScope.hasPermission('DMS', 'config', 'Module')) && grid.appScope.dmsGridConfig.settings.actions.visibility['unlock']"
                                    ng-disabled="grid.appScope.folder.isLocked || row.entity.inProgressBy"
                                    uib-tooltip="{{(row.entity.isLocked ? 'label.dms.UnLockFile' : 'label.dms.LockFile') | translate}}" ng-click="grid.appScope.toggleLockedFile(row.entity)">
                                <i ng-class="{'fa fa-fw fa-unlock': !row.entity.isLocked, 'fa fa-fw fa-lock': row.entity.isLocked}"></i>
                            </button>
                            <button class="btn btn-link"
                                    uib-tooltip="{{'label.dms.ShareFile' | translate}}"
                                    ng-click="grid.appScope.shareFile(row.entity)"
                                    ng-if="grid.appScope.dmsGridConfig.settings.actions.visibility['share']">
                                <i class="fa fa-link"></i>
                            </button>
                            <button iris-clipboard-copy
                                    type="icon"
                                    ng-model="grid.appScope.selected_file_dms_link"
                                    uib-tooltip="{{'label.dms.CopyFileLink' | translate}}"
                                    button-icon="hashtag"
                                    ng-if="grid.appScope.dmsGridConfig.settings.actions.visibility['copy-file-link']""></button>
                            <button class="btn btn-link"
                                    ng-if="(grid.appScope.hasPermission(grid.appScope.folder.id, 'update') || grid.appScope.hasPermission('DMS', 'config', 'Module')) && grid.appScope.dmsGridConfig.settings.actions.visibility['upload']"
                                    ng-disabled="grid.appScope.folder.isLocked || row.entity.isLocked && row.entity.inProgressBy != grid.appScope.me.id"
                                    uib-tooltip="{{'label.dms.UploadNewVersion' | translate}}" ng-click="grid.appScope.openUploadNewVersion(row.entity)">
                                <i class="fa fa-upload"></i>
                            </button>
                            <button class="btn btn-link"
                                    ng-if="(grid.appScope.hasPermission(grid.appScope.folder.id, 'update') || grid.appScope.hasPermission('DMS', 'config', 'Module')) && grid.appScope.dmsGridConfig.settings.actions.visibility['edit-locally']"
                                    ng-disabled="grid.appScope.folder.isLocked || row.entity.isLocked || !grid.appScope.appState.active"
                                    uib-tooltip="{{'label.dms.EditLocally' | translate}}"
                                    ng-click="grid.appScope.openEditFileLocal(row.entity)">
                                <i class="fa fa-desktop"></i>
                            </button>
                            <button class="btn btn-link" uib-tooltip="{{'label.dms.MoveToFolder' | translate}}"
                                    ng-if="(grid.appScope.hasPermission(folder.id, 'delete') || grid.appScope.hasPermission('DMS', 'config', 'Module')) && grid.appScope.dmsGridConfig.settings.actions.visibility['move-to-folder']"
                                    ng-disabled="folder.isLocked || row.entity.isLocked"
                                    ng-click="grid.appScope.openMoveFiles(row.entity)">
                                <i class="fa fa-reply"></i>
                            </button>
                            <button ng-click="grid.appScope.removeFile(row.entity)"
                                    ng-if="(grid.appScope.hasPermission(folder.id, 'delete') || grid.appScope.hasPermission('DMS', 'config', 'Module')) && grid.appScope.dmsGridConfig.settings.actions.visibility['remove']"
                                    ng-disabled="folder.isLocked || row.entity.isLocked"
                                    class="btn btn-link" uib-tooltip="{{'label.Remove' | translate}}"><i class="fa fa-trash-o"></i></button>
                            <button ng-click="grid.appScope.toggleAsFavorite(row.entity.id)"
                                ng-if="grid.appScope.dmsGridConfig.settings.actions.visibility['favorite']"
                                ng-disabled="folder.isLocked || row.entity.isLocked"
                                class="btn btn-link" uib-tooltip="{{'label.dms.Favorite' | translate}}">
                                <i class="{{row.entity.isFavorite ? 'fa fa-star' : 'fa fa-star-o'}}"></i>
                            </button>
                        </div>`
                },
                {
                    name: 'updatedOn',
                    field: 'updatedOn',
                    width: 150,
                    displayName: $translate.instant('label.UpdatedOn'),
                    enableSorting: true,
                    cellFilter: `date:'dd.MM.yyyy HH:mm:ss'`
                },
                {
                    name: 'ownerId',
                    field: 'ownerId',
                    width: '*',
                    displayName: $translate.instant('label.Owner'),
                    enableSorting: true,
                    cellFilter: `irisUser`
                },
                {
                    name: 'color',
                    field: 'color',
                    width: '*',
                    displayName: $translate.instant('label.Workflow'),
                    cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <i class="fa fa-circle fa-fw"
                                   uib-tooltip="{{row.entity.workflowId | IrisFilterField:[grid.appScope.workflows]}} - {{grid.appScope.getWorkflowStateName(row.entity.workflowId, row.entity.workflowStateId) || ('label.NotSet' | translate)}}"
                                   ng-if="row.entity.workflowId"
                                   ng-style="{color: grid.appScope.getFileWorkflowColor(row.entity)}"></i>
                               {{grid.appScope.getWorkflowStateName(row.entity.workflowId, row.entity.workflowStateId) || ('label.NotSet' | translate)}}
                            </div>`
                },
                {
                    name: 'contentLanguage',
                    field: 'contentLanguage',
                    width: 50,
                    displayName: $translate.instant('label.Lang'),
                    enableSorting: true
                },
                {
                    name: 'size',
                    field: 'size',
                    width: '*',
                    displayName: $translate.instant('label.Size'),
                    enableSorting: true,
                    cellFilter: 'filesize'
                }
            ];

            const filesGridIsTrashDefaultColDefs = [
                {
                    field: 'originalName',
                    width: '**',
                    displayName: $translate.instant('label.Name'),
                    enableSorting: true,
                    cellTemplate: `
                        <div class="ui-grid-cell-contents" iris-drag-drop="drag" iris-drag-data="{fileId: row.entity.id}" iris-drag-data-getter="grid.appScope.getSelectedFilesIds()">
                            <a href="javascript:void(0)" uib-tooltip="{{row.entity.name}}"
                               ng-click="grid.appScope.setSelectedFile(row.entity)">
                                <i class="fa fa-fw {{::grid.appScope.getFileIcon(row.entity.mimeType)}}"></i> {{row.entity.originalName}}
                            </a>
                        </div>`
                },
                {
                    name: 'actions',
                    displayName: $translate.instant('label.Actions'),
                    width: 250,
                    enableSorting: false,
                    cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <a ng-href="{{grid.appScope.getFileDownloadUrl(row.entity.id)}}"
                               class="btn btn-link"
                               uib-tooltip="{{'label.Download' | translate}}">
                                <i class="fa fa-download"></i></a>
                            <button ng-click="grid.appScope.openPreviewFile(row.entity)"
                                    class="btn btn-link"
                                    ng-disabled="!grid.appScope.previewAllowed(row.entity)"
                                    uib-tooltip="{{'label.Preview' | translate}}">
                                <i class="fa fa-eye"></i>
                            </button>
                            <button ng-click="grid.appScope.restore(row.entity.id)"
                                    class="btn btn-link"
                                    uib-tooltip="{{'label.Restore' | translate}}">
                                <i class="fa fa-reply"></i>
                            </button>
                            <button ng-click="grid.appScope.removeFile(row.entity)"
                                    class="btn btn-link"
                                    uib-tooltip="{{'label.Delete' | translate}}">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>`
                },
                {
                    field: 'originalPath',
                    width: '*',
                    displayName: $translate.instant('label.OriginalPath'),
                    enableSorting: true
                },
                {
                    field: 'updatedOn',
                    width: 150,
                    displayName: $translate.instant('label.UpdatedOn'),
                    enableSorting: true,
                    cellFilter: `date:'dd.MM.yyyy HH:mm:ss'`
                },
                {
                    field: 'size',
                    width: '*',
                    displayName: $translate.instant('label.Size'),
                    enableSorting: true,
                    cellFilter: 'filesize'
                }
            ];

            const gridConfig = {
                actions: {
                    visibility: {
                        download: true,
                        preview: true,
                        edit: false,
                        unlock: false,
                        share: true,
                        'copy-file-link': false,
                        upload: true,
                        'edit-locally': true,
                        'move-to-folder': false,
                        remove: false,
                        favorite: true
                    }
                },
                columns: {
                    visibility: {
                        name: true,
                        actions: true,
                        updatedOn: true,
                        ownerId: true,
                        color: true,
                        contentLanguage: true,
                        size: true
                    },
                    order: [
                        'name',
                        'actions',
                        'updatedOn',
                        'ownerId',
                        'color',
                        'contentLanguage',
                        'size'
                    ]
                }
            };


            return {
                getGridConfigSettings: () => gridConfig,
                getDefaultActionsList: () => defaultActionsList,
                getFilesGridDefaultColDefs: () => filesGridDefaultColDefs,
                getFilesGridIsTrashDefaultColDefs: () => filesGridIsTrashDefaultColDefs
            }
        });
})();