((globals) => {

    const module = globals.angular.module('iris_gs_workshift_management_operating_state');
    const DEFAULT_OP_STATE_COLOR = '#757575';

    module.factory('ManualOperatingState', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/manual-operating-states/:id`, {
            id: '@id'
        }, {
            query: {method: 'GET', isArray: true},
            get: {method: 'GET', isArray: false}
        })
    });

    module.factory('ProjectManualOperatingState', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/manual-operating-states/project/:projectId`, {}, {
            query: {method: 'GET', isArray: true}
        })
    });

    module.factory('AutoOperatingState', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/auto-operating-states/:id`, {
            id: '@id',
            deviceId: '@deviceId',
            scannerId: '@scannerId'
        }, {
            get: {method: 'GET', isArray: false}
        })
    });

    module.factory('AutoStateType', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/auto-operating-states/types`, {}, {
            get: {method: 'GET', isArray: false}
        })
    });

    module.factory('DeviceAutomaticOperatingState', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/auto-operating-states/device/:deviceId`)
    });

    module.factory('OperatingStateService', function(ManualOperatingState, DeviceAutomaticOperatingState,
        AutoOperatingState, AutoStateType, ProjectManualOperatingState, $translate) {

        return {
            findAllManualStatesByProjectId: (projectId) =>
                ProjectManualOperatingState.query({projectId}).$promise,

            findAllAutoStatesByDeviceId: (deviceId) =>
                DeviceAutomaticOperatingState.query({deviceId}).$promise,

            listAutoStateTypes: () =>
                AutoStateType.query().$promise.then((types) => {
                    return types.map((type) => {
                        return {
                            id: type,
                            name: $translate.instant(`label.AutomaticStateType${type}`)
                        }
                    })
                }),

            getById: (id) =>
                ManualOperatingState.get({id}).$promise,

            getAutoStateById: (id) =>
                AutoOperatingState.get({id}).$promise,

            saveAutoState: (model) => {
                const saveModel = angular.copy(model);
                delete saveModel.childStates;
                return saveModel.$save()
            },

            saveManualState: (model) => {
                const saveModel = angular.copy(model);
                delete saveModel.childStates;
                return saveModel.$save()
            },

            removeManualState: (id) =>
                ManualOperatingState.delete({id}).$promise,

            removeAutoState: (id) =>
                AutoOperatingState.delete({id}).$promise,

            createManualState() {
                const manualState = new ManualOperatingState();
                manualState.defaultDisplayColor = DEFAULT_OP_STATE_COLOR;
                return manualState;
            },

            createAutoState: (deviceId) => {
                const result = new AutoOperatingState();
                result.deviceId = deviceId;
                return result;
            }
        }
    })
})({
    angular: angular
});