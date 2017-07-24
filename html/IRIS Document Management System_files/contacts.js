(function () {
    angular.module('iris_contacts', ['iris_user_settings']);

    angular.module('iris_contacts').factory('Contacts', function ($resource) {
        return $resource(iris.config.apiUrl + "/contacts/:id", {
            id: '@id'
        });
    });

    angular.module('iris_contacts').factory('ContactsService', function ($q, Contacts, UserService) {
        var contacts = [];
        var users = [];

        var fixUsers = function (data) {
            for (var user of data) {
                user.userId = user.id;
                user.lastName = user.profile.lastname;
                user.firstName = user.profile.firstname;
                user.fullName = (user.firstName ? user.firstName + ' ' : '') + (user.lastName ? user.lastName : '')
                    + (!user.firstName && !user.lastName ? user.email : '');
                user.phone = user.profile.phone;
                user.company = user.profile.company ? user.profile.company.name : '';
            }
        };

        var mergeUsersToContacts = function () {
            for (var user of users) {
                contacts.push(user);
            }
        };

        var fillFullName = function (data) {
            for(var contact of data) {
                contact.fullName = (contact.firstName ? contact.firstName + ' ' : '') + (contact.lastName ? contact.lastName : '')
                    + (!contact.firstName && !contact.lastName ? contact.email : '');
            }
        };

        return {
            requestContacts: function () {
                var defer = new $q.defer();
                var promises = [];
                promises.push(UserService.getUsers().$promise);
                promises.push(Contacts.query().$promise);

                $q.all(promises).then(res => {
                    contacts = res[1];
                    users = res[0];
                    fixUsers(users);
                    fillFullName(contacts);
                    mergeUsersToContacts();
                    defer.resolve(contacts);
                })

                return defer.promise;
            },

            getContact: function (id) {
                return Contacts.get({id: id}).$promise;
            },

            saveContact: function (contact) {
                var _this = this;
                return Contacts.save(contact, function (contact) {
                    _this.requestContacts();
                    return contact;
                }).$promise;
            },

            removeContact: function (contact) {
                var _this = this;
                return Contacts.remove({id: contact.id}, function (contact) {
                    _this.requestContacts();
                    return contact;
                }).$promise;
            }
        }
    });
})();