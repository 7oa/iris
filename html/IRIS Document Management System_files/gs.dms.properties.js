(function () {
    angular.module('iris_gs_dms').factory('DmsPropertiesService',
        function ($q, $translate, GlobalSettingsService, CountriesService) {
            function getProperties() {
                return [{name: 'Country', isActive: false, isMultiple: false},
                    {name: 'Company', isActive: false, isMultiple: false},
                    {name: 'Department', isActive: false, isMultiple: false},
                    {name: 'SubDepartment', isActive: false, isMultiple: false}];
            }

            return {
                getProperties,

                getDmsConfig: () => {
                    var _this = this;
                    var deferred = $q.defer();

                    var promises = [];
                    promises.push(CountriesService.query());
                    promises.push(GlobalSettingsService.getGlobalSettingsById("dms"));

                    $q.all(promises).then(results => {
                        var res = results[1];
                        var countries = results[0];
                        res.value = res.value || {};
                        res.value.properties = res.value.properties || getProperties();

                        res.value.properties = res.value.properties.filter(p => p.isActive);
                        res.value.properties.forEach(p => {
                            p.title = $translate.instant('label.' + p.name);
                            p.directory = [];
                            if (p.name === 'Country') {
                                p.directory = countries || [];
                                p.model = 'countryId';
                            }
                            if (p.name === 'Company') {
                                p.directory = iris.data.companies || [];
                                p.model = 'companyId';
                            }
                            if (p.name === 'Department') {
                                p.directory = iris.data.departments ? iris.data.departments.filter(d => !d.parentId) : [];
                                p.model = 'departmentId';
                            }
                            if (p.name === 'SubDepartment') {
                                p.directory = iris.data.departments ? iris.data.departments.filter(d => d.parentId) : [];
                                p.model = 'subDepartmentId';
                            }
                        });
                        deferred.resolve(res.value);
                    });
                    return deferred.promise;
                }
            }
        });
})();
