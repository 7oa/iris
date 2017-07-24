(function () {
    angular.module('iris_projects', ['iris_projects_devices', 'iris_projects_buildings']);

    angular.module('iris_projects').factory('Projects', function ($resource) {
        return $resource(iris.config.apiUrl + "/projects/:id", {
            id: '@id'
        }, {
            getByUserId: {
                url: iris.config.apiUrl + "/security/users/:userId/projects",
                params: {
                    id: '@userId'
                },
                method:     "GET",
                isArray:    true
            }
        ,
            setStateByAlias: {
                url: iris.config.apiUrl + "/projects/:id/set-state/:alias",
                params: {
                    id: '@id',
                    alias: '@alias'
                },
                method: "POST"
            }
        });
    });

    angular.module('iris_projects').factory('ProjectDevices', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/project-devices/:id", {
            id: '@id'
        }, {
            getByProjectId: {
                url:        iris.config.apiUrl + "/system/projects/:projectId/project-devices",
                params: {
                    projectId: '@projectId'
                },
                method:     "GET",
                isArray:    true
            }
        });
    });

    angular.module('iris_projects').factory('ProjectBuildings', function ($resource) {
        return $resource(iris.config.apiUrl + "/construction/buildings-management/projects/:projectId/buildings/:buildingId", {
            projectId: '@projectId',
            buildingId: '@id'
        }, {
            getByProjectId: {
                url:        iris.config.apiUrl + "/construction/buildings-management/projects/:projectId/buildings",
                params: {
                    projectId: '@projectId'
                },
                method:     "GET",
                isArray:    true
            }
        });
    });

    angular.module('iris_projects').factory('ProjectsService',
        function ($filter, Projects, ProjectDevices, ProjectBuildings) {

            var projects = Projects.query();

            var projectDevicesStore = {};
            var projectBuildingsStore = {};

            return {
                //todo refactor getProjects to use this function where needed and remove $promises
                getPreloadedProjects: () => iris.data.projects,
                getProjectById: (id) => iris.data.projects.find(project => project.id === +id),
                updatePreloadedProjects: () => iris.data.projects = angular.copy(projects),

                getProjectDevice: (projectId, deviceId) => 
                    iris.data.projectDevices.find(pd => pd.projectId==projectId && pd.deviceId == deviceId),

                getProjects: function(){
                    return projects;
                },

                getProjectsByUserId: userId => Projects.getByUserId({userId}).$promise,

                createProject: function (params) {
                    params = params || {};
                    return new Projects(params);
                },

                setState: function(project, stateAlias) {
                    return Projects.setStateByAlias({id:project.id, alias: stateAlias}).$promise;
                },

                requestProjects: function() {
                    var _this = this;
                    return Projects.query(result => {
                        projects = result;
                        _this.updatePreloadedProjects();
                        return result;
                    }).$promise;
                },

                saveProject: function (project) {
                    var self    = this;
                    var is_new  = !project.id;
                    var _this   = this;

                    var uTreeLevel = project.$$treeLevel;

                    return project.$save(function (result) {

                        if (is_new) {

                            angular.extend(project, result);

                            projects.push(project);
                        }
                        else {

                            var projectInStore = projects.filter(function(o){return o.id == result.id;})[0]

                            if(projectInStore) {

                                angular.extend(projectInStore, result);

                                projectInStore.$$treeLevel = uTreeLevel;
                            }
                        }

                        _this.updatePreloadedProjects();

                        return result;
                    });
                },

                removeProject: project => Projects.remove(project).$promise,

                filter: function(filter,strict) {
                    filter = filter || {};
                    strict = strict || true;
                    return $filter('filter')(projects,filter,strict);
                },

                getById: function(id) {
                    return this.filter({id:+id})[0];
                },

                loadById: function(id) {
                    return Projects.get({id:id}).$promise;
                },

                //used in maps to find project in a tree
                getByIdInTree: function (id) {
                    for(var i = 0, c = projects.length; i < c; i++) {
                        //if current project in the first level has projectId - it's duplicated child
                        if(projects[i].projectId) continue;

                        var project = projects[i];
                        if(project.id == id) return project;

                        //operate children
                        for(var k = 0, cc = project.projects.length; k < cc; k++){
                            if(project.projects[k].id == id) return project.projects[k];
                        }
                    }
                    return null;
                },

                createProjectDevice: function(params) {
                    var projectDevice = new ProjectDevices();
                    angular.extend(projectDevice,params);
                    return projectDevice;
                },

                getProjectDevicesByProjectId: function(projectId) {

                    var projectIdString = String(projectId);

                    if(!projectDevicesStore[projectIdString])
                        projectDevicesStore[projectIdString] = ProjectDevices.getByProjectId({"projectId": projectId});

                    return projectDevicesStore[projectIdString];
                },

                cleanProjectDeviceStore: function () {
                    projectDevicesStore = {};
                },

                saveProjectDevice: function(projectDevice) {
                    var _this = this;
                    var createRequest = !projectDevice.id;

                    return projectDevice.$save(function(result) {

                        if(createRequest) {
                            var projectIdString = String(result.projectId);
                            if(!projectDevicesStore[projectIdString])
                                projectDevicesStore[projectIdString] = [];
                            projectDevicesStore[projectIdString].push(result);
                        }

                        angular.extend(projectDevice, result);

                        _this.requestProjects();

                        return result;
                    });
                },

                removeProjectDevice: function(projectDevice) {
                    var _this = this;
                    var projectIdString = String(projectDevice.projectId);

                    return projectDevice.$remove({},function (value) {

                        if(projectDevice.projectId && projectDevicesStore[projectIdString]) {

                            var temp = projectDevicesStore[projectIdString].filter(function(o){return o.id == projectDevice.id;})[0];

                            if (temp) {
                                var index = projectDevicesStore[projectIdString].indexOf(temp);
                                projectDevicesStore[projectIdString].splice(index,1);
                            }
                        }

                        _this.requestProjects();
                        return value;
                    });
                },

                createProjectBuilding: function(params) {
                    var item = new ProjectBuildings();
                    angular.extend(item, params);
                    return item;
                },

                getProjectBuildingsByProjectId: function(params) {
                    return ProjectBuildings.getByProjectId(angular.isObject(params) ? params : { "projectId": params });
                },

                getProjectBuildingsByTypes: function(projectId, types, queryParams) {
                    queryParams || (queryParams = {});

                    queryParams.projectId = projectId;

                    var filter = queryParams.filter || [];
                    filter.push({f: "type", v: Array.isArray(types) ? types : [types]});
                    queryParams.filter = angular.toJson(filter);

                    return ProjectBuildings.getByProjectId(queryParams);
                },

                saveProjectBuilding: function(item) {
                    return item.$save(function(result) {
                        angular.extend(item, result);
                        return result;
                    });
                },

                removeProjectBuilding: function(item, projectId) {
                    console.log(item);
                    return item.$remove({projectId: projectId, id: item.id}, function (res) {
                        return res;
                    });
                }
            };
        });

    angular.module('iris_projects').factory('ProjectDeviceService',
        function ($filter, Projects, ProjectDevices) {
            var project_devices = ProjectDevices.query();

            return {
                getAllProjectDevices: function () {
                    return project_devices.$promise;
                },

                getProjectDeviceById: function (id) {
                    return ProjectDevices.get({id:id}).$promise;
                }
            }
        });

    angular.module('iris_projects').factory('ProjectBuildingService',
        function ($filter, Projects, ProjectBuildings) {
            var project_buildings = ProjectBuildings.query();

            return {
                getAllProjectBuildings: function () {
                    return project_buildings.$promise;
                },

                getProjectBuildingById: function (id) {
                    return ProjectBuildings.get({id:id}).$promise;
                }
            }
        });

    angular.module('iris_projects').factory('ProjectSettings', function ($resource) {
        return $resource(iris.config.apiUrl + "/project-settings/:alias/:id", {
            id: '@id',
            alias: '@alias'
        });
    });

    angular.module('iris_projects').factory('ProjectSettingsService',
        function (ProjectSettings, $rootScope) {
            return {
                getProjectSettingsList: function (alias) {
                    return ProjectSettings.query({alias:alias}).$promise;
                },

                getProjectSettingsById: function (alias, project_id) {
                    project_id = project_id || 'default';
                    var project_settings = ProjectSettings.get({alias: alias, id: project_id});
                    return project_settings.$promise.then(function (result) {
                        if (result.projectId != project_id && project_id != 'default')
                            result.id = null;
                        if (!result.module) result.module = alias;
                        return result;
                    });
                },

                saveProjectSettings: function (alias, settings, project_id) {
                    var is_new = !settings.projectId > 0 && project_id != 'default';
                    if(project_id != 'default' && project_id!= null)
                        settings.projectId = project_id;

                    return ProjectSettings.save({alias: alias, id: is_new ? null : project_id}, settings, function (value) {
                        $rootScope.$broadcast('project-settings.' + alias + '.updated', value);
                        return value;
                    }).$promise;
                },

                removeProjectSettings: function (alias, settings) {
                    return ProjectSettings.remove({alias: alias, id: settings.projectId > 0 ? settings.projectId : "default"}, function (value) {
                        return value;
                    }).$promise;
                }
            };
        });

})();
