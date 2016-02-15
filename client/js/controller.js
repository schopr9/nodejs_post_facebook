mainApp.controller('myCtrl',['$scope','$location','$http', function($scope,$location,$http){
  $scope.imageSrc = 'images/login-button.png';
  $scope.urlToggle = '#/login'
  $location.path("/login")
  $scope.showTemplate = function() {
            $location.path('auth/google');
            if ($scope.imageSrc === 'images/login-button.png') {
                $scope.imageSrc = 'images/logout.png';
                $location.path("/login");
                
            } else {
                $scope.imageSrc = 'images/login-button.png';
                $location.path("/");
                
            }

  

  
  }
  
  
}]);

mainApp.controller('switchViews',['$scope','$location', function($scope,$location){
//    console.log($scope.multipleSelect);
//  $location.path($scope.multipleSelect);
    $scope.someFunction = function() {
        console.log($scope.multipleSelect);
        console.log($scope.multipleSelect.value);
        $location.path($scope.multipleSelect);
        
    }
}]);


