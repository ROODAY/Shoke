var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    swig = require('swig'),
    util = require('util'),
    SpotifyStrategy = require('passport-spotify').Strategy;

var consolidate = require('consolidate');

var appKey = "80e6fc97443c47d1b4a7d16c3c646af8";
var appSecret = "87b441e927b241289a6de7c1101b0467";

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId : '80e6fc97443c47d1b4a7d16c3c646af8',
  clientSecret : '87b441e927b241289a6de7c1101b0467',
  redirectUri : 'http://localhost:3000/callback'
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var userTokens = {};

passport.use(new SpotifyStrategy({
  clientID: appKey,
  clientSecret: appSecret,
  callbackURL: 'http://localhost:3000/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      userTokens[profile.id] = accessToken;
      return done(null, profile);
    });
  }));

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

app.engine('html', consolidate.swig);

app.get('/', function(req, res){
  if (req.user) {
    spotifyApi.setAccessToken(userTokens[req.user.id]);
    spotifyApi.getUserPlaylists(req.user.id)
    .then(function(data) {
      res.render('index.html', { user: req.user, playlists: JSON.stringify(data) });
    },function(err) {
      console.log('Something went wrong!', err);
    });
  } else {
    res.render('index.html', { user: req.user });
  }
});

app.get('/login', function(req, res){
  res.render('login.html', { user: req.user });
});

app.get('/about', function(req, res){
  res.render('about.html', { user: req.user });
});

app.get('/auth/spotify',
  passport.authenticate('spotify', {scope: 'playlist-read-private'}),
  function(req, res){
});

app.get('/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen((process.env.PORT || 3000), function(){
  console.log('listening on *:3000');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
