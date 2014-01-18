// initialize some Parse Object classes so we can use them throughout
var Photo = Parse.Object.extend("photo");
var Snapshot = Parse.Object.extend("Snapshot");
// Shows the form to create a new meme
// get '/'
exports.index = function(req, res) {
  // If the user is not logged in, redirect them to the login page
  if (!Parse.User.current()) {
    res.redirect('/login');
  }
  // Query the Photo objects to populate the dropdown
  var query = new Parse.Query(Photo);
  query.descending('name');
  query.find().then(function(photoObjs) {
    // pass the photos objects to index.ejs
    res.render('index', {
      photos: photoObjs
    });
  });
};

// Shows the login screen
// get '/login'
exports.showLogin = function(req, res) {
  res.render('login', {
  });
};

// Processes a login or signup request
// post '/login'
exports.loginOrSignup = function(req, res) {
  if (req.body.action == "signup") {
    var user = new Parse.User();
    // Use email address as username
    user.set("username", req.body.email);
    user.set("email", req.body.email);
    user.set("password", req.body.password);

    // Sign up the user and redirect them to the main page, at exports.index above
    user.signUp().then(function(userObj) {
      res.redirect('/');
    }, function(error) {
      res.send("Error: " + error.code + " " + error.message);
    });
  } else if (req.body.action == "login") {
    // Login the user and redirect them to the main page if successful
    Parse.User.logIn(req.body.email, req.body.password).then(function(userObj) {
      res.redirect('/');
    }, function(error) {
      res.send("Error: " + error.code + " " + error.message);
    });
  } else {
    res.send("Error, login or signup not specified");
  }
};

// Logs the user out, then redirects to the login screen
// get '/logout'
exports.logout = function(req, res) {
  Parse.User.logOut();
  res.redirect("/login");
};

// Shows the profile for :userId
// get '/profile/:userId'
exports.profile = function(req, res) {
  // get the user objectID from the url parameter :userId
  var userId = req.params.userId;
  var query = new Parse.Query(Parse.User);
  var user;
  // get the user object for :userId
  query.get(userId).then(function(userObj) {
    var query = new Parse.Query(Snapshot);
    query.equalTo("user", userObj);
    // include the photo field in the query so that it fetches all the content from the Photo object as well
    query.include("photo");
    user = userObj;
    return query.find();
  }).then(function(snapshotObjs) {
    // pass the meme objects to profile.ejs
    res.render('profile', {
      user: user,
      snapshots: snapshotObjs
    });
  });
};

// Shows the profile page for the current user
// get '/me'
exports.me = function(req, res) {
  var user = Parse.User.current();
  if (!user) {
    // if the user is not logged in, redirect to the login page
    res.redirect('/login');
  } else {
    // if the user is logged in, redirect to their profile page
    res.redirect('/profile/' + user.id);
  }
};

// Creates a new Meme Parse Object
// post '/meme'
exports.create = function(req, res) {
  // create a new Meme Parse Object
  var snapshot = new Snapshot();

  snapshot.set('otc', req.body.otc.toUpperCase());

  // set the 'photo' field to be a pointer to a Photo object by passing a Photo object to set()
  var photo = new Photo();
  photo.id = req.body.snapshotImg;
  snapshot.set('photo', photo);

  // set the 'user' field to be a pointer to the current user
  var user = Parse.User.current();
  snapshot.set('user', user);

  snapshot.save().then(function(snapshotObj) {
    // redirect to the meme's page at exports.show below
    res.redirect("/snapshot/" + snapshotObj.id);
  }, function(error) {
    res.send(error.message);
  });
};

// Show a single meme
// get '/meme/objectId'
exports.show = function(req, res) {
  // get the meme's objectId from the url param :objectId
  var objectId = req.params.objectId;
  var query = new Parse.Query(Snapshot);
  // include the "photo" and "user" fields in the query so it fetches all the data in the Photo and User objects
  query.include("photo");
  query.include("user");

  query.get(objectId).then(function(snapshotObj) {
    // run a cloud code function to increment the views count for this meme
    // pass the meme object to show.ejs
    res.render('show', {
      snapshot: snapshotObj
    });
  });
}
