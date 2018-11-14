var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var admin = require("firebase-admin");

var serviceAccount = require('./credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mrfitness-5d95a.firebaseio.com"
});

function createTraining(userId, trainingId) {  
  let trainingData = {        
    series: {          
      serie1: {  
        finalPulse: 75,            
        repeats: 16,
        repeatsGoal: 12,  
        duration: 20,
        interval: 30
      }        
    }
  }
  return admin.database().ref(`user/${userId}/training/${trainingId}`).set(trainingData).then( () => {
    return Promise.resolve(trainingId);
  });    
}

function addSerie(userId, trainingId, serieId, serie) {  
  return admin.database().ref(`user/${userId}/training/${trainingId}/series/${serieId}`).update(serie).then( () => {
    return Promise.resolve();
  });    
}

let userId = 'HP7RdU33Zhhnzar5wopcXfgqMgB3';
let trainingId = "RXZvb5hbx1ZJWEuMgp92";

// createTraining(userId, trainingId).then( () => {
//   console.log('training created ' + trainingId);  
// });

// add first serie
addSerie( userId, trainingId, 'serie1', {  
  finalPulse: 85,            
  repeats: 15,  
  duration: 40,  
});

// add next serie
addSerie( userId, trainingId, 'serie2', {  
  finalPulse: 95,            
  repeats: 16,
  repeatsGoal: 15,  
  duration: 40,
  interval: 55
});
