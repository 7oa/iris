angular.module('irisApp').config(
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('', '/folders').when('#', '/folders').when('/', '/folders');
        $stateProvider
            .state('dms', {
                url: "",
                abastract: true,
                templateUrl: iris.config.moduleUrl + '/templates/dms.main.html',
                controller: 'DmsCtrl',
                resolve: {
                    'folders': function (FoldersService) {
                        return FoldersService.requestFolders().$promise.then(function (data) {
                            return data;
                        });
                    },
                    'trashFolder': function (folders) {
                        let dmsFolder = folders.find(f => f.name == 'DMS');
                        if(!dmsFolder || !dmsFolder.children) return null;

                        return dmsFolder.children.find(f => f.isTrashBin);
                    },
                    'filterProjects': function (ProjectsService) {
                        return ProjectsService.getPreloadedProjects();
                    },
                    'filterWorkflows': function (WorkflowService) {
                        return WorkflowService.getAllWorkflowsByType('DOCUMENT');
                    },
                    'countries': CountriesService => CountriesService.query(),
                    'dmsConfig': (DmsPropertiesService) => DmsPropertiesService.getDmsConfig(),
                    'projects': function (ProjectsService) {
                        return ProjectsService.getPreloadedProjects();
                    },
                    'dmsGridConfig': (UserSettingsService, DmsGridConfigurationService) => UserSettingsService.getUserSettingsById('dms-files-grid-config-v2', iris.config.me.id)
                        .then((res) => {
                            let defaultSettings = angular.copy(DmsGridConfigurationService.getGridConfigSettings());
                            if (!res.settings || $.isEmptyObject(res.settings)){
                                res.settings = {};
                            }
                            res.settings = angular.merge(defaultSettings, res.settings);
                            return res;
                        }),
                    'defaultActionsList': (DmsGridConfigurationService) => DmsGridConfigurationService.getDefaultActionsList(),
                    'filesGridIsTrashDefaultColDefs': (DmsGridConfigurationService) => DmsGridConfigurationService.getFilesGridIsTrashDefaultColDefs(),
                    'filesGridDefaultColDefs': ($filter, DmsGridConfigurationService, dmsGridConfig) => {
                        let defaultCols = angular.copy(DmsGridConfigurationService.getFilesGridDefaultColDefs());
                        defaultCols.forEach(col => {
                            col.order = dmsGridConfig.settings.columns.order.indexOf(col.name);
                            col.visible = dmsGridConfig.settings.columns.visibility[col.name];
                        });
                        return $filter('orderBy')(defaultCols, 'order');
                    }
                }
            })
            .state('dms.folders', { //List of folders
                url: "/folders",
                templateUrl: iris.config.moduleUrl + '/templates/dms.folders.html',
                controller: 'DmsFoldersCtrl',
                resolve: {
                    'projects': function (ProjectsService) {
                        return ProjectsService.getPreloadedProjects();
                    },
                    'hiddenSystemFolders':function (FilesService) {
                        return FilesService.getHiddenSystemFolders();
                    },
                    'smartFoldersSettings': function (UserSettingsService) {
                        return UserSettingsService.getUserSettingsById('dms-smart-folders', iris.config.me.id).then(res => {
                            if (!res.settings || !res.settings.smartFolders) res.settings.smartFolders = [];
                            return res;
                        });
                    }
                }
            })
            .state('dms.folders.files', { //List of files
                url: "/:folder_id/files?file",
                templateUrl: iris.config.moduleUrl + '/templates/dms.files.html',
                controller: 'DmsFilesCtrl',
                resolve: {
                    'files': function (FilesService, $stateParams) {
                        return FilesService.getFolderFiles($stateParams.folder_id).then(function (value) {
                            return value;
                        }).catch(function () {
                            return '';
                        });
                    },
                    'folder': function(FoldersService, $stateParams){
                        return FoldersService.getById($stateParams.folder_id).$promise.then(function (data) {
                            return data;
                        }).catch(function () {
                            return '';
                        });
                    },
                    'projects': function (ProjectsService) {
                        return ProjectsService.getPreloadedProjects();
                    },
                    'workflows': function (WorkflowService, folder) {
                        return folder.projectId ? WorkflowService.getWorkflowsByType(folder.projectId, 'DOCUMENT') : []
                    },
                    'localIp': function (DmsAppService) {
                        return DmsAppService.getIP();
                    }
                }
            })
            .state('dms.folders.trash', { //List of files
                url: "/:folder_id/trash/files?file",
                templateUrl: iris.config.moduleUrl + '/templates/dms.trash.html',
                controller: 'DmsFilesCtrl',
                resolve: {
                    'files': function (FilesService, $stateParams) {
                        return FilesService.getFolderFiles($stateParams.folder_id).then(function (value) {return value;});
                    },
                    'folder': function(FoldersService, $stateParams){
                        return FoldersService.getById($stateParams.folder_id).$promise.then(function (data) {
                            return data;
                        });
                    },
                    'projects': function (ProjectsService) {
                        return ProjectsService.getPreloadedProjects();
                    },
                    'workflows': function (WorkflowService, folder) {
                        return folder.projectId ? WorkflowService.getWorkflowsByType(folder.projectId, 'DOCUMENT') : []
                    },
                    'localIp': function (DmsAppService) {
                        return DmsAppService.getIP();
                    }
                }
            })
            .state('dms.search', { //Search results = list of resulted files
                url: "/search?filter",
                templateUrl: iris.config.moduleUrl + '/templates/dms.search.html',
                controller: 'DmsSearchCtrl',
                resolve: {
                    'files': function (FilesService, $stateParams) {
                        var url_filter = angular.fromJson($stateParams.filter);
                        console.log(url_filter);
                        var filter = [];
                        if(url_filter.is_text_name && url_filter.text) filter.push({f:'name',v:['%' + url_filter.text + '%'],s:false});
                        if(url_filter.is_text_created_by && url_filter.text) filter.push({f:'createdBy',v:['%' + url_filter.text + '%'],s:false});
                        if(url_filter.is_text_content && url_filter.text) filter.push({f:'content',v:[url_filter.text],s:false});
                        if(url_filter.date_from || url_filter.date_to) filter.push({f:'createdOn',v:[url_filter.date_from,url_filter.date_to]});
                        if(url_filter.inProgress) filter.push({f:'inProgress',v:[url_filter.inProgress]});
                        if(url_filter.projectId) filter.push({f:'project',v:[url_filter.projectId]});
                        if(url_filter.workflowId) {
                            filter.push({f:'workflow',v:[url_filter.workflowId]});
                            if(url_filter.workflowStateId) filter.push({f:'workflowState',v:[url_filter.workflowStateId]});
                        }
                        if(filter.length == 0) return [];
                        return FilesService.searchFiles(filter);
                    }
                }
            })
            .state('contacts', {
                url: "/contacts",
                templateUrl: iris.config.moduleUrl + '/templates/dms.contacts.html',
                controller: 'DmsContactsCtrl',
                resolve: {
                    contacts: ContactsService => ContactsService.requestContacts(),
                    companies:  CompaniesService =>  CompaniesService.getCompanies().$promise
                }
            })
            .state('contacts.add', {
                url: "/add",
                controller: 'DmsContactsEditCtrl',
                resolve: {
                    contacts: ContactsService => ContactsService.requestContacts()
                }
            })
            .state('contacts.edit', {
                url: "/:id/edit",
                controller: 'DmsContactsEditCtrl',
                resolve: {
                    contacts: ContactsService => ContactsService.requestContacts()
                }
            })


    }
);


