(function () {
    angular.module('iris_gs_workflows').controller('ModuleWorkflowStatesDiagramCtrl',
        function ($scope, $timeout, $state, $uibModalInstance, $translate, $filter, states) {
            var colorsMapping = {
                'START': {
                    bgColor: '#93be3d'
                },
                'STEP': {
                    bgColor: '#424242'
                },
                'END': {
                    bgColor: '#a94442'
                }
            };

            var nodes = [];
            var edges = [];
            states.forEach(state => {
                nodes.push({data:{
                    id: state.id,
                    text: $filter("irisTranslate")(state.name, state.nameTranslations),
                    color: state.color && !$filter('colorIsDark')(state.color) ? '#424242' : '#fff',
                    bgColor: state.color || colorsMapping[state.type].bgColor,
                    borderWidth: state.isActiveOnDiagram ? '5' : '0'
                }});
                state.toIds.forEach(toId => {
                    edges.push({data:{
                        source: state.id,
                        target: toId
                    }})
                })
            });


            $timeout(() => {
                var cy = window.cy = cytoscape({
                    container: document.getElementById('mycanvas'),
                    boxSelectionEnabled: false,
                    autounselectify: true,
                    wheelSensitivity: 0.1,

                    layout: {
                        name: 'dagre',
                        padding: 10,
                        directed: true,
                        fit: true,
                        //boundingBox: {x1: 50, y1: 50, w:810, h:450}
                        //name: 'spread',
                        //minDist: 100,
                        //padding: 50,
                        //directed: true,
                        //fit: false,
                        //boundingBox: {x1: -200, y1: -200, w:2510, h:2550}
                    },
                    style: [
                        {
                            selector: 'node',
                            style: {
                                'width': 'label',
                                'shape': 'rectangle',
                                'content': 'data(text)',
                                'text-valign': 'center',
                                'color': 'data(color)',
                                'padding-left': '15',
                                'padding-right': '15',
                                'padding-top': '5',
                                'padding-bottom': '5',
                                'border-top-right-radius': '5',
                                'background-color': 'data(bgColor)',
                                'border-width': 'data(borderWidth)',
                                'border-color': 'yellow'
                            }
                        },
                        {
                            selector: 'edge',
                            style: {
                                'width': 4,
                                'curve-style': 'bezier',
                                'target-arrow-shape': 'triangle',
                                'line-color': '#9dbaea',
                                'source-arrow-color': '#9dbaea',
                                'target-arrow-color': '#9dbaea'
                            }
                        }
                    ],
                    elements: {
                        nodes,
                        edges
                    }
                });
            })
        })
})();
