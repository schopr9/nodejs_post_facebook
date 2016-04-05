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



mainApp.controller('Listcontroller', function($rootScope,$scope,$http,$location){// create a new post
        
        


        $scope.search = function() {
            
//            $scope.formData.email = $scope.email;
            $http.post('/api/post/',  { postdata: $scope.postdata,facebookID: window.facebookID,facebookToken : window.facebookToken
                                        , email: document.getElementById('email').innerHTML , facebookCheck : $scope.connectFacebook
                                        , twitterCheck: $scope.connectTwitter , linkedinCheck: $scope.connectLinkedin
                                                            })
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




mainApp.controller('allPosts', function($rootScope,$scope,$http,$location, $routeParams){// track post
    var currentEmail = document.getElementById('email').innerHTML;
    $scope.message = $routeParams.message;
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
    $scope.edit = function(_id,postID) {
        console.log(_id);
        $location.path('/track/').search({id:_id, email:currentEmail,postid: postID});
    };
    $scope.delete = function(_id,postID,twitterPostID) {
        console.log(postID);
        $http({
            method: 'Delete',
            url: "api/post/"+ currentEmail +"/" + _id,
            params: {email: currentEmail, postid: postID, token: window.facebookToken, twitterPId : twitterPostID}
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
    $scope.manageComment = function(_id,postID,twitterPostID) {
        console.log(_id);
        $location.path('/comments/').search({id:_id, email:currentEmail,fPostId: postID, tPostId: twitterPostID});
    };
});

mainApp.controller('trackedpost', function($rootScope,$scope,$http,$location, $routeParams){// update a post
    var postID = $routeParams.id;
    var email = $routeParams.email;
    var postid = $routeParams.postid;
    $http({
            method: 'GET',
            url: "api/post/" + email + "/" + postID
        }).then(function (response) {
            console.log(response.data);
            $scope.postBody = response.data.postBody;
            $scope.email = email;
            $scope.postID = postid;
            $scope.id = response.data._id
        });
        
    $scope.updatePost = function() {

            $http({
            method: 'put',
            url: "/api/post/"+$scope.email+"/" + $scope.id,
            data: {"postBody": $scope.postBody, postid : $scope.postID, token: window.facebookToken}
   
                })
                .then(function (response) {
                    if(response.data.error)
                        $scope.message = "error happened on server.";
                    else
                    {
                        
                        $scope.message = "Post is updated successfully.";
                        $location.path('allPosts').search({message: 'Post is updated successfully' });
                    }
                });
        };
});

mainApp.controller('postcomments', function($rootScope,$scope,$http,$location, $routeParams){
    $scope.postID= $routeParams.id;
    $scope.email = $routeParams.email;
    $scope.facebookPostId =  $routeParams.fPostId;
    $http({
            method: 'GET',
            url: "api/post/" + $scope.email + "/" + $scope.postID
        }).then(function (response) {
            console.log(response.data);
            $scope.postBody = response.data.postBody;
            $scope.comments = response.data.comment;
        });
    $http({
            method: 'GET',
            url: "api/facecomments/" + $scope.email + "/" + $scope.facebookPostId
        }).then(function (response) {
            console.log(response.data);
        });
        
    $scope.add = function() {
        $http.post('/api/comment/',  { commentdata: $scope.commentdata, email: $scope.email, postID : $scope.postID })
            .then(function (response) {
                if(response.data.error)
                    $scope.message =  "error adding the comment";
                else
                {
                    $scope.message = "comment is added successfully";
                    // get the post's comments
                    $http({
                            method: 'GET',
                            url: "api/allComments/" + $scope.postID
                        }).then(function (response) {
                            console.log(response);
                            $scope.comments = response.data;
                            $scope.commentdata = "";
                        });
                }
            });
    };
          


    $scope.delete = function(_id) {
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


//inject the twitterService into the controller
mainApp.controller('TwitterController', function($scope) {

    var facebook_Checked = $scope.connectFacebook;
    
    if (facebook_Checked) {
        window.location.href = "https://schopr9-ece9065-project-schopr9.c9users.io/auth/facebook";
    }
});