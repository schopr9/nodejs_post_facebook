//Define an angular module for our app
var mainApp  = angular.module('mainApp', [
  'ngRoute'
]);

 
//Define Routing for app
//Uri /AddNewOrder -> template add_order.html and Controller AddOrderController
//Uri /ShowOrders -> template show_orders.html and Controller AddOrderController
mainApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: '/views/Posting.ejs'
    
      
       
    }).
      when('/track', {
        templateUrl: '/views/Post_tracking.html',
        controller: 'trackedpost'
        
       
    }).
      when('/comments', {
        templateUrl: '/views/Post_comments.html'
        
       
    }).
      when('/allPosts', {
      templateUrl: "views/posted.html",
      controller: 'allPosts'
    }).
    otherwise({
        redirectTo: '/'
      });
}]);

//mainApp.config(function($locationProvider){
  // $locationProvider.html5Mode(true);
  
//});
 
