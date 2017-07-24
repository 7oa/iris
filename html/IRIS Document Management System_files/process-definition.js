(function (undefined) {
    angular.module('iris_process_mgmt').factory('ProcessDefinition', function (FabricLib, ProcessElementTypes, ProcessDefinitionElementActivator) {
        function addItem(collection, item) {
            collection.push(item);
        }

        function updateItem(collection, item) {
            var target = collection.find(t => t.id == item.id);
            target && angular.extend(target, item);
        }

        function removeItem(collection, item) {
            var target = collection.find(t => t.id == item.id);
            target && collection.splice(collection.indexOf(target), 1);
        }

        function initCollection(that, source, cName, eName) {
            that[cName] = [];
            source[cName] && source[cName].forEach(t => that.addElement(ProcessDefinitionElementActivator.create(that, eName, t)))
        }

        function toObjectCollection(that, res, cName) {
            res[cName] = [];
            that[cName].forEach(t => res[cName].push(t.toObject()));
        }

        return FabricLib.util.createClass({
            initialize: function (source) {
                source || (source = {});

                for (var name in ProcessElementTypes.meta) {
                    if (ProcessElementTypes.meta.hasOwnProperty(name)) {
                        initCollection(this, source, ProcessElementTypes.meta[name].collectionName, ProcessElementTypes[name]);
                    }
                }
            },

            addElement: function(element) {
                if (element.elementType == ProcessElementTypes.sequenceFlow) {
                    if (!element.source || !element.target) return;
                    element.source.outgoing.push(element);
                    element.target.incoming.push(element);
                }

                addItem(this[ProcessElementTypes.meta[element.elementType].collectionName], element);
                return element;
            },

            updateElement: function(element) {
                updateItem(this[ProcessElementTypes.meta[element.elementType].collectionName], element);
                return element;
            },

            removeElement: function(element) {
                if (element.elementType == ProcessElementTypes.sequenceFlow) {
                    removeItem(this.findElementForSequenceFlow(element.source.id).outgoing, element);
                    removeItem(this.findElementForSequenceFlow(element.target.id).incoming, element);
                }

                removeItem(this[ProcessElementTypes.meta[element.elementType].collectionName], element);
            },

            findElementForSequenceFlow: function(elementId) {
                var res = this[ProcessElementTypes.meta.task.collectionName].find(t => t.id == elementId);
                !res && (res = this[ProcessElementTypes.meta.parallelGateway.collectionName].find(t => t.id == elementId));
                !res && (res = this[ProcessElementTypes.meta.exclusiveGateway.collectionName].find(t => t.id == elementId));
                return res;
            },

            toObject: function () {
                var res = {};

                for (var name in ProcessElementTypes.meta) {
                    if (ProcessElementTypes.meta.hasOwnProperty(name)) {
                        toObjectCollection(this, res, ProcessElementTypes.meta[name].collectionName);
                    }
                }

                return res;
            }
        })
    });
})();