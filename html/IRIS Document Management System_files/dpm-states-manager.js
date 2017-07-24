(function() {
    angular.module('iris_dpm')
        .factory('DpmStatesManager', function($translate) {
            var states = [],
                aliases = {
                    angefordert: "angefordert",
                    erstellt: "erstellt",
                    kontrolliert: "kontrolliert",
                    zugewiesenZurBearbeitungApp: "zugewiesen-zur-bearbeitung-app",
                    zugewiesenZurBearbeitungBackend: "zugewiesen-zur-bearbeitung-backend",
                    ausgefuellt: "ausgefuellt",
                    zugewiesenZurPruefungApp: "zugewiesen-zur-pruefung-app",
                    zugewiesenZurPruefungBackend: "zugewiesen-zur-pruefung-backend",
                    geprueft: "geprueft",
                    fertiggestellt: "fertiggestellt",
                    angenommen: "angenommen",
                    abgeschlossen: "abgeschlossen",
                    beanstandet: "beanstandet",
                    erstelltNachBeanstandung: "erstellt-nach-beanstandung",
                    verworfen: "verworfen"
                },
                aliasGroups = {
                    canAssign: [aliases.kontrolliert, aliases.ausgefuellt],
                    canUnAssign: [aliases.zugewiesenZurBearbeitungApp, aliases.zugewiesenZurBearbeitungBackend, aliases.zugewiesenZurPruefungApp, aliases.zugewiesenZurPruefungBackend],
                    canChange: [aliases.angefordert, aliases.erstellt, aliases.zugewiesenZurBearbeitungBackend, aliases.zugewiesenZurPruefungBackend, aliases.geprueft, aliases.fertiggestellt, aliases.angenommen, aliases.beanstandet, aliases.erstelltNachBeanstandung],
                    canNotBeanstanden: [aliases.beanstandet, aliases.zugewiesenZurBearbeitungApp, aliases.zugewiesenZurPruefungApp, aliases.abgeschlossen, aliases.verworfen, aliases.kontrolliert, aliases.ausgefuellt],
                    updateOnChangeState: [aliases.zugewiesenZurBearbeitungBackend, aliases.beanstandet, aliases.erstelltNachBeanstandung],
                    askForPin: [aliases.ausgefuellt, aliases.geprueft, aliases.fertiggestellt, aliases.angenommen, aliases.abgeschlossen],
                    forProtocolRequest: [aliases.angefordert, aliases.erstellt],
                    forProtocol: [aliases.kontrolliert, aliases.zugewiesenZurBearbeitungApp, aliases.zugewiesenZurBearbeitungBackend, aliases.ausgefuellt, aliases.zugewiesenZurPruefungApp, aliases.zugewiesenZurPruefungBackend, aliases.geprueft, aliases.fertiggestellt, aliases.angenommen, aliases.abgeschlossen, aliases.beanstandet, aliases.erstelltNachBeanstandung, aliases.verworfen]
                };

            function getState(stateAlias) {
                var filtered = states.filter(s => s.alias == stateAlias);
                if (filtered.length) {
                    return filtered[0];
                } else {
                    console.error(`${$translate.instant('message.dpm.StateNotFoundByAlias')}: ${stateAlias}`);
                    return null;
                }
            }

            function getStateById(stateId) {
                var filtered = states.filter(s => s.id == stateId);
                if (filtered.length) {
                    return filtered[0];
                } else {
                    console.error(`${$translate.instant('message.dpm.StateNotFoundById')}: ${stateId}`);
                    return null;
                }
            }

            function isUserInStateById(stateId, user) {
                if (user.isAdmin) return true;

                var state = getStateById(stateId);
                if (!state) return false;
                var filteredUsers = state.mergedUsers.filter(u => u.id == user.id);
                return filteredUsers.length ? true : false;
            }

            var getProtocolRequestInitialState = () => getState(aliases.angefordert);
            var getNextStateById = function(currentStateId) {
                var currentState = getStateById(currentStateId);
                switch (currentState.alias) {
                    case aliases.angefordert:
                        return getState(aliases.erstellt);
                    case aliases.erstellt:
                        return getState(aliases.kontrolliert);
                    case aliases.kontrolliert:
                        return getState(aliases.zugewiesenZurBearbeitungBackend);
                    case aliases.zugewiesenZurBearbeitungBackend:
                        return getState(aliases.ausgefuellt);
                    case aliases.ausgefuellt:
                        return getState(aliases.zugewiesenZurPruefungBackend);
                    case aliases.zugewiesenZurPruefungBackend:
                        return getState(aliases.geprueft);
                    case aliases.geprueft:
                        return getState(aliases.fertiggestellt);
                    case aliases.fertiggestellt:
                        return getState(aliases.angenommen);
                    case aliases.angenommen:
                        return getState(aliases.abgeschlossen);
                    case aliases.beanstandet:
                        return getState(aliases.erstelltNachBeanstandung);
                    case aliases.erstelltNachBeanstandung:
                        return getState(aliases.kontrolliert);
                    default:
                        return currentState;
                }
            };

            return {
                aliases: aliases,
                aliasGroups: aliasGroups,

                clearStates: () => states = [],
                setStates: (s) => states = s,
                getStates: () => states,
                hasStates: () => states && states.length,

                isUserInStateById,

                getState,
                getStateById,

                getProtocolRequestInitialState,
                getNextStateById
            }
        });
})();