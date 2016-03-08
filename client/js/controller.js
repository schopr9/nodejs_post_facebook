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


//mainApp.controller('Listcontroller',['$scope','$http', function ($scope , $http ) {
        
//        var text = $scope.postdata;
//        console.log($scope.postdata);
//        $scope.isSearhing = false;
//        $scope.result = [];
//        $scope.search = function(){
//            
            
//            $http({
//                method: 'POST',
//                url: '/postdata',
//                data: { postdata: $scope.postdata, email: document.getElementById('email').innerHTML }
//               
//            }).then(function successCallback(response){
//                $scope.result = response.data;
//                console.log($scope.postdata);
//                $scope.isSearhing = false;
//                
//            }, function errorCallback(response){
//                console.log(response);
//                });
//        
//        };
//    }]);


// create a new post
mainApp.controller('Listcontroller', function($rootScope,$scope,$http,$timeout,$location){
        
        $scope.search = function() {
//            $scope.formData.email = $scope.email;
            $http.post('/api/post/',  { postdata: $scope.postdata, email: document.getElementById('email').innerHTML })
                .then(function (response) {
                    if(response.data.error)
                        alert("an error happen on server");
                    else
                    {
                        console.log(response.data);
                        $location.path('/allPosts/');
                    }
                });
            
            
        };
});

// update a post
mainApp.controller('trackedpost', function($rootScope,$scope,$http,$timeout,$location, $routeParams){
    var postID = $routeParams.id;
    var email = $routeParams.email;
    currentEmail = email;
    if(postID === undefined || email === undefined)
        $scope.message = "PostID & email is not defined!";
    $http({
            method: 'GET',
            url: "api/post/" + email + "/" + postID
        }).then(function (response) {
            console.log(response.data);
            $scope.postBody = response.data.postBody;
            $scope.email = email;
            $scope.postID = postID;
        });
        
    $scope.updatePost = function() {
            console.log("updatePost");

            $http.put("/api/post/"+$scope.email+"/" + $scope.postID, {"postBody": $scope.postBody})
                .then(function (response) {
                    if(response.data.error)
                        $scope.message = "An error happened on server.";
                    else
                    {
                        
                        $scope.message = "Post is updated successfully.";
                        console.log(response.data);
                        $location.path('allPosts').search({message: 'Post is updated successfully' });
                    }
                });
        };
});

// track all post
mainApp.controller('allPosts', function($rootScope,$scope,$http,$timeout,$location, $routeParams){
//    console.log("get all post from "+ currentEmail);
    var currentEmail = document.getElementById('email').innerHTML;
    $scope.message = $routeParams.message;
    if(currentEmail === undefined)
        if(currentEmail2 === undefined)
            $location.path("/login");
        else
            currentEmail = currentEmail2;
    if(currentEmail.length <= 0)
        $location.path('/login/');
    else    
        $http({
                method: 'GET',
                url: "api/allposts/" + currentEmail
            }).then(function (response) {
                console.log(response.data);
                $scope.posts = response.data;
            });
    $scope.add = function() {
        $location.path('/login');
    };
    $scope.edit = function(_id) {
        console.log(_id);
        $location.path('/track/').search({id:_id, email:currentEmail});
    };
    $scope.delete = function(_id) {
        console.log(_id);
        $http({
            method: 'Delete',
            url: "api/post/"+ currentEmail +"/" + _id
        }).then(function (response) {
            console.log(response.data);
            if(!response.data.error)
            {
                $scope.message = "Post is deleted successfully.";
                for(i in $scope.posts) {
                    if($scope.posts[i]._id == _id) {
                        $scope.posts.splice(i,1);
                    }
                } 
            }
        });
    };
    $scope.manageComment = function(_id) {
        console.log(_id);
        $location.path('/comments/').search({id:_id, email:currentEmail});
    };
});

mainApp.controller('specificpost', function($rootScope,$scope,$http,$timeout,$location, $routeParams){
    $scope.postID= $routeParams.id;
    $scope.email = $routeParams.email;
    currentEmail = $scope.email ;
    if($scope.postID === undefined || $scope.email === undefined)
        $scope.message = "PostID & email is not defined!";
    // get the post along its comments
    $http({
            method: 'GET',
            url: "api/post/" + $scope.email + "/" + $scope.postID
        }).then(function (response) {
            console.log(response.data);
            $scope.postBody = response.data.postBody;
            $scope.comments = response.data.comment;
        });
        
    $scope.add = function() {
        $scope.formData.email = $scope.email;
        $scope.formData.postID = $scope.postID;
        $http.post('/api/comment/', $scope.formData)
            .then(function (response) {
                if(response.data.error)
                    $scope.message =  "an error happen on the server while adding the comment";
                else
                {
                    $scope.message = "The comment is added successfully";
                    // get the post's comments
                    $http({
                            method: 'GET',
                            url: "api/allComments/" + $scope.postID
                        }).then(function (response) {
                            console.log(response);
                            $scope.comments = response.data;
                            $scope.formData.commentBody = "";
                        });
                }
            });
    };
          
    $scope.edit = function(comment) {
        console.log(comment);
        console.log("is editing");
    };
    $scope.save = function(comment) {
        console.log(comment);
        //$scope.editing = $scope.comments.indexOf(comment);
        $http.put("/api/comment/"+$scope.postID+"/" + comment._id, {"commentBody": comment.commentBody})
        .then(function (response) {
            if(response.data.error)
                $scope.message = "An error happened on server during updating the comment.";
            else
            {
                $scope.message = "comment is updated successfully.";
                console.log(response.data);
            }
        });
    };
    

    $scope.delete = function(_id) {
        console.log(_id);
        $http({
            method: 'Delete',
            url: "api/comment/" + $scope.postID + "/" +_id
        }).then(function (response) {
            console.log(response.data);
            if(!response.data.error)
            {
                $scope.message = "Comment is deleted successfully.";
                for(i in $scope.comments) {
                    if($scope.comments[i]._id == _id) {
                        $scope.comments.splice(i,1);
                    }
                } 
            }
        });
    };
});