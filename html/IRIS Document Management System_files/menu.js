(function() {
    irisAppDependencies.add('iris_menu');

    angular.module('iris_menu', []);

    angular.module('iris_menu').factory('PagesService',
        function ($filter, $translate) {
            var user_pages = [];
            iris.data.menuItems = iris.data.menuItems || [];

            var getItems = function (items) {
                for(var item of items) {
                    if(!item.isHeader && !item.isDivider && !item.children && item.url) {
                        item.title = $translate.instant(item.title);
                        user_pages.push(item);
                    }
                    if(item.children && item.children.length) getItems(item.children);
                }
            };
            getItems(iris.data.menuItems);

            return {
                getUserPages: function(){
                    return user_pages;
                }
            }
        });



})();

