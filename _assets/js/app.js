var app = angular.module('evac', ['picardy.fontawesome']);

app.controller('evacController', ['$scope', 'dataFactory', '$interval', function($scope, dataFactory, $interval) {
    $scope.info = {
        status: 'OFFLINE',
        views: 0,
        followers: 0
    };
    $scope.faUserColor = '#ffffff';
    $scope.rightContent = 'twitch';
    $scope.isFullscreen = false;

    $scope.toggleFullscreen = function () {
        if ($scope.isFullscreen) {
            angular.element(document.querySelector('div#left')).css({'width': '70%'});
            $scope.isFullscreen = false;
        } else {
            angular.element(document.querySelector('div#left')).css({'width': '100%'});
            $scope.isFullscreen = true;
        }
    }

    $scope.setContent = function (content) {
        $scope.rightContent = content;
        angular.element(document.querySelector('div#left')).css({'width': '70%'});
        $scope.isFullscreen = false;
    }

    init();
    function init() {
        dataFactory.getChannelInfo()
        .then(function(response) {
            $scope.info.views = response.data.views;
            $scope.info.followers = response.data.followers;
            return dataFactory.getStreamInfo();
        })
        .then(function(response) {
            if (response.data.stream) {
                $scope.info.status = '~' + response.data.stream.viewers;
                $scope.faUserColor = '#ff0000';
            }           
        });
    }

    $interval(function () {
        dataFactory.getStreamInfo()
        .then(function(response) {
            if (response.data.stream) {
                $scope.info.status = '~' + response.data.stream.viewers;
                $scope.faUserColor = '#ff0000';
            } else {
                $scope.info.status = 'OFFLINE';
                $scope.faUserColor = '#ffffff';
            }
        });
    }, 60000); // how often we poll the twitch api for viewer count in milliseconds
}]);


app.factory('dataFactory', ['$http', function($http) {
    var dataFactory = {};
    dataFactory.getChannelInfo = function () {
        return $http.get('https://api.twitch.tv/kraken/channels/evac');
    }
    dataFactory.getStreamInfo = function () {
        return $http.get('https://api.twitch.tv/kraken/streams/evac');
    }
    return dataFactory;
}]);

app.directive('highlight', [function () {

    function changeIcon(type) {
        angular.element(document.querySelector('#icon45'))
        .css({'background-image': 'url(images/icon45_'+type+'.png'})
        .addClass('fade');
    }

    return {
        restrict: 'A',
        link: function (scope, element) {
            element.on('mouseenter', function() {
                element.addClass('hover');
                element.addClass('hover');
                element.addClass('fade');

                // if a custom colour is specified
                if ('highlightColor' in element[0].attributes) {
                    element.css({'color': element[0].attributes.highlightColor.value });                
                }               

                ['discord', 'donate', 'subscribe', 'twitch'].forEach(function (type) {
                    if (element.hasClass(type)) {
                        changeIcon(type);
                    };
                });
            });
            element.on('mouseleave', function () {
                element.removeClass('hover');

                // set to white if we specified a custom color
                if ('highlightColor' in element[0].attributes) {
                    element.css({'color': '#ffffff' });             
                }

                changeIcon('evac');
            });
        }
    };
}]);