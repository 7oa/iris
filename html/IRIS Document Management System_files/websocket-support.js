/**
 *
 * Created by alexander.zakshevskii on 05.04.16.
 */

(function(globals) {
    'use strict';

    //TODO: support multiendpoints
    globals.angular.module('irisApp').controller('WebSocketMixin', function($scope, $stomp) {

        // $stomp.setDebug((args) => { console.log(`${args}\n`); });

        let websocketEndpoint = null;
        let connected = false;
        let onConnected = [];
        let listSubscriptions = {};

        $scope.webSocket = {

            connect(endpoint) {
                if (websocketEndpoint == endpoint && connected) {
                    return this;
                }
                websocketEndpoint = endpoint;
                websocketEndpoint += '?token=' + iris.config.accessToken;

                let apiUrl = globals.config.apiUrl;

                console.log(`${apiUrl}${websocketEndpoint}`, iris.config.accessToken);

                $stomp.connect(`${apiUrl}${websocketEndpoint}`, { }).then(() => {
                    connected = true;
                    onConnected.forEach((it) => listSubscriptions[it[0]] = ($scope.webSocket.subscribeSingle(it[0], it[1])));
                });
                return this;
            },

            subscribe(topic, callback) {
                if (!connected) {
                    onConnected.push([topic, callback]);
                } else {
                    $stomp.subscribe(topic, callback, { 'x-iris-access-token': iris.config.accessToken });
                }
                return this;
            },

            subscribeSingle(topic, callback) {
                if (connected) {
                    return $stomp.subscribe(topic, callback, { });
                }
                return null;
            },

            unsubscribe(topic) {
                if(listSubscriptions[topic]) {
                    $stomp.unsubscribe(listSubscriptions[topic]);
                }
            },

            disconnect() {
                connected = false;
                $stomp.disconnect();
            },

            update() { },

            send(data) {
                if (!connected) {
                    throw new Error('websocket is not connected!');
                }

                if (!websocketEndpoint) {
                    throw new Error('target websocket endpoint url is not defined');
                }

                $stomp.send(websocketEndpoint, data, { })
            }
        };
    });
})({ angular, config: iris.config});
