(function () {
    angular.module('iris_gs_sensor_management_view').controller('DataSeriesMapModalCtrl',
        function ($scope, $timeout, $state, $uibModalInstance, $translate, dataseries, dsId) {
            var nodes = [];
            var edges = [];
            // RAW, CONDENSED, VIRTUAL, MANUAL,
            var colors = {
                'default' : {
                    bgColor: '#93be3d',
                    color: '#ffffff'
                },
                RAW: {
                    bgColor: '#cccccc',
                    color: '#000000'
                },
                CONDENSED: {
                    bgColor: '#BA9015',
                    color: '#000000'
                },
                VIRTUAL: {
                    bgColor: '#3391BE',
                    color: '#000000'
                },
                MANUAL: {
                    bgColor: '#BE4B4C',
                    color: '#000000'
                }
            };
            function getColor(type, field){
                type = type || 'default';
                var color = colors[type] || colors['default'];
                return color[field]
            }

            dataseries.forEach(ds => {
                nodes.push({data:{
                    id: ds.id,
                    text: `${ds.dataSeries.id} - ${ds.dataSeries.systemIndexName}`,
                    bgColor: getColor(ds.dataSeries.type, 'bgColor'),
                    color: getColor(ds.dataSeries.typ, 'color')
                }});
                ds.depends = ds.depends || [];
                ds.depends.forEach(toId => {
                    edges.push({data:{
                        source: ds.id,
                        bgColor: getColor(ds.dataSeries.type, 'bgColor'),
                        target: toId
                    }})
                })
            });


            $timeout(() => {
                var cy = window.cy = cytoscape({
                    container: document.getElementById('mycanvas'),
                    boxSelectionEnabled: false,
                    autounselectify: true,
                    layout: dsId ? {name: 'dagre', directed: true}: {
                        name: 'spread',
                        minDist: 100,
                        padding: 50,
                        directed: true,
                        fit: false,
                        boundingBox: {x1: -200, y1: -200, w:2510, h:2550}
                    },
                    style: [
                        {
                            selector: 'node',
                            style: {
                                'width': 'label',
                                'shape': 'rectangle',
                                'content': 'data(text)',
                                'text-valign': 'center',
                                'color': '#ffffff',
                                'padding-left': '15',
                                'padding-right': '15',
                                'padding-top': '5',
                                'padding-bottom': '5',
                                'border-top-right-radius': '5',
                                'background-color': 'data(bgColor)'
                            }
                        },
                        {
                            selector: 'edge',
                            style: {
                                'width': 4,
                                'curve-style': 'bezier',
                                'target-arrow-shape': 'triangle',
                                'line-color': 'data(bgColor)',
                                'source-arrow-color': 'data(bgColor)',
                                'target-arrow-color': 'data(bgColor)'
                            }
                        }
                    ],
                    elements: {
                        nodes,
                        edges
                    }
                });

                dataseries.forEach(ds => {
                    if(ds.expression) {
                        cy.$('#' + ds.id).qtip({
                            content: ds.expression,
                            position: {
                                my: 'top center',
                                at: 'bottom center'
                            },
                            style: {
                                classes: 'qtip-bootstrap',
                                tip: {
                                    width: 16,
                                    height: 8
                                }
                            }
                        });
                    }
                })
            })
        })
})();
