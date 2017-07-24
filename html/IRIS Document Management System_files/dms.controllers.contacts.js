angular.module('irisApp').controller('DmsContactsCtrl',
    function ($scope, $translate, $uibModal, uiGridConstants, MailService, ContactsService, CompaniesService, contacts, companies) {
        $scope.companies = companies;
        $scope.contacts = contacts;

        $scope.gridOptions = {
            data: 'contacts',
            enableFiltering: true,
            enableGridMenu: true,
            minRowsToShow: 20,
            enableFullRowSelection: false,
            enableSelectAll: true,
            selectionRowHeaderWidth: 35,
            multiSelect: true,
            columnDefs: [
                {
                    name: '#',
                    width: 50,
                    enableSorting: false,
                    enableFiltering: false,
                    cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                {{rowRenderIndex + 1}} 
                            </div>`
                },
                {
                    field: 'userId',
                    width: 30,
                    displayName: '',
                    enableSorting: true,
                    enableFiltering: false,
                    cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <i class="fa fa-user" 
                                   ng-if="row.entity.userId"
                                   uib-tooltip="{{::'label.UserHasAccount' | translate}}"></i>
                            </div>`
                },
                {
                    field: 'lastName',
                    width: '*',
                    displayName: $translate.instant('label.LastName'),
                    enableSorting: true,
                    sort: {
                        direction: uiGridConstants.ASC,
                        priority: 1
                    }
                },
                {
                    field: 'firstName',
                    width: '*',
                    displayName: $translate.instant('label.FirstName'),
                    enableSorting: true,
                    sort: {
                        direction: uiGridConstants.ASC,
                        priority: 2
                    }
                },
                {
                    field: 'company',
                    width: '*',
                    displayName: $translate.instant('label.Company'),
                    enableSorting: true
                },
                {
                    field: 'email',
                    width: '*',
                    displayName: $translate.instant('label.Email'),
                    enableSorting: true
                },
                {
                    field: 'phone',
                    width: '*',
                    displayName: $translate.instant('label.Phone'),
                    enableSorting: true
                },
                {
                    name: 'actions',
                    enableFiltering: false,
                    displayName: $translate.instant('label.Actions'),
                    width: 100,
                    enableSorting: false,
                    cellTemplate: `
                            <div class="ui-grid-cell-contents actions">
                                <button ng-if="row.entity.userId" 
                                        ng-click="grid.appScope.openUserRightsModal(row.entity)" 
                                        class="btn btn-link btn-xs" 
                                        uib-tooltip="{{::'label.ShowUserRights' | translate}}">
                                    <i class="fa fa-fw fa-shield"></i>
                                </button>
                                <a ui-sref="contacts.edit({id:row.entity.id})" 
                                   ng-if="!row.entity.userId" 
                                   class="btn btn-link btn-xs" 
                                   uib-tooltip="{{::'label.Edit' | translate}}">
                                     <i class="fa fa-fw fa-pencil"></i>
                                </a>&nbsp;
                                <button ng-if="!row.entity.userId" 
                                        ng-click="grid.appScope.removeContact(row.entity)" 
                                        class="btn btn-link btn-xs" 
                                        uib-tooltip="{{::'label.dms.RemoveContact' | translate}}">
                                     <i class="fa fa-fw fa-trash-o"></i>
                                 </button>
                            </div>`
                }
            ],
            rowTemplate: "<div ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" \
                    ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader, 'row-selected':row.entity.id == grid.appScope.selected_file.id}\" ui-grid-cell ></div>",
            onRegisterApi: function (gridApi) {
                $scope.gridOptions.gridAPI = gridApi;
            }
        };

        $scope.removeContact = function (contact) {
            alertify.confirm($translate.instant('text.RemoveConfirm'), function (e) {
                if (e) {
                    ContactsService.removeContact(contact).then(function () {
                        alertify.success($translate.instant('text.ContactRemoved'));
                        requestContacts();
                    });
                }
            });
        };

        $scope.openUserRightsModal = function (user) {
            iris.loader.start('.app-body');

            $scope.modalInstance = $uibModal.open({
                templateUrl: iris.config.moduleUrl + '/templates/dms.contacts.rights.html',
                resolve: {
                    'user': function () {
                        return user;
                    },
                    'folders': function (FoldersService) {
                        return FoldersService.requestFolders().$promise.then(function (data) {
                            return FoldersService.getAllFoldersList();
                        });
                    },
                    'permissions': function (FoldersSecurityService) {
                        return FoldersSecurityService.getAllPermissions().then(function (data) {
                            return FoldersSecurityService.transformPermissions(data);
                        })
                    }
                },
                controller: 'DmsContactsRights',
                size: 'lg'
            });
        };

        $scope.openSendMessageModal = function () {
            iris.loader.start('.app-body');

            var selected_contacts = $scope.gridOptions.gridAPI.selection.getSelectedRows().map(u => u.email);

            MailService.openSendMailModal(selected_contacts, null);
        }

        $scope.$on('updateContacts', function () {
            requestContacts();
        });

        function requestContacts() {
            ContactsService.requestContacts().then(function (requestContacts) {
                $scope.contacts = requestContacts;
            });
        }
    });


angular.module('irisApp').controller('DmsContactsRights',
    function ($scope, user, folders, permissions, FoldersSecurityService) {
        iris.loader.stop();

        $scope.user = user;
        $scope.permissions = permissions;
        $scope.folders = folders;

        $scope.hasPermission = function (subject_id, action) {
            return FoldersSecurityService.hasUGPermission(permissions, subject_id, user, action);
        };

        $scope.getFolderPath = function (folder) {
            return folder.path.substring(0, folder.path.length - folder.name.length);
        }

    });

angular.module('irisApp').controller('DmsContactsEditCtrl',
    function ($scope, $uibModal, $translate, $state, $stateParams, ContactsService, contacts) {
        $scope.contact = {};

        if ($state.is('contacts.edit')) {
            var id = $stateParams.id;
            $scope.contact.id = id;
            ContactsService.getContact(id).then(function (contact) {
                $scope.contact = contact;
            })
        }

        $scope.modalInstance = $uibModal.open({
            templateUrl: iris.config.moduleUrl + '/templates/dms.contacts.edit.html',
            scope: $scope
        });

        $scope.modalInstance.result.then(function () {
            $state.go('^');
        }, function () {
            $state.go('^');
        });
        $scope.validateEmail = function () {
            var valid = true;
            angular.forEach(contacts, contact => {
                if (contact.email === $scope.contact.email && (typeof($scope.contact.id) === 'undefined' || contact.id !== $scope.contact.id)) {
                    valid = false;
                }
            });
            return valid;
        }
        $scope.save = function () {
            ContactsService.saveContact($scope.contact).then(function () {
                alertify.success($translate.instant('label.SaveSuccess'));
                $scope.modalInstance.close();
                $scope.$emit('updateContacts');
            })
        }
    });
