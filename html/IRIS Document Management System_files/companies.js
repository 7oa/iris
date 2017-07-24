(function () {
    angular.module('iris_companies', []);

    angular.module('iris_companies').factory('Companies', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/companies/:id", {
            id: '@id'
        });
    }]);

    angular.module('iris_companies').factory('CompaniesService', ['Companies', '$filter',
        function (Companies, $filter) {
            var companies = Companies.query({}, function (value) {
                return value;
            });

            return {
                getCompanies: function () {
                    return companies;
                },

                getCompany: function (id) {
                    return Companies.get({id: id});
                },

                removeCompany: function (company) {
                    return company.$remove({}, function (value) {
                        for (var i = 0, c = companies.length; i < c; i++) {
                            if (companies[i].id == value.id) {
                                companies.splice(i, 1);
                                break;
                            }
                        }
                        return value;
                    });
                },

                createCompany: function () {
                    return new Companies();
                },

                filter: function (filter, strict) {
                    strict = strict || true;
                    return $filter('filter')(companies, filter, strict);
                },

                saveCompany: function (company) {
                    var is_new = !company.id;
                    var _this = this;
                    return company.$save(function (company) {
                        if (is_new) {
                            companies.push(company);
                        }
                        else {
                            for (var i = 0; i < companies.length; i++) {
                                var el = companies[i];
                                if (el.id == company.id) {
                                    angular.extend(el, company);
                                    break;
                                }
                            }
                        }
                        return company;
                    })
                }
            };
        }
    ]);

})();
