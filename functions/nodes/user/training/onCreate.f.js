'use strict';

// SIMULATE FUNCTIONS IN EMULATOR:
// userTrainingOnCreate({before: null, after: '{training: {training1: {timestamp: 12345, series: {serie1: {averagePulse: 80, finalPulse: 100, duration: 30, repeats: 30, interval: 30}}}}}'}, {params: {userId: 'V5XI3MudRXZvb5hbx1ZJWEuMgp92', traningId: '1234'}})

const admin = require('firebase-admin');
try {  admin.initializeApp(); } catch(error) { /* empty */ }
const functions = require('firebase-functions');


exports = module.exports = functions.database.ref('/user/{userId}/training/{trainingId}/series/{serieId}').onCreate((snap, context) => {
	const userId = context.params.userId;
    let serieData = snap.val();
    if(!serieData){
        return Promise.reject(Error('Empty serie?!'));
    }
    // prepare training proposal here
    let nextSerie = calculateNextSerie(serieData);
    if(nextSerie){
        return admin.database().ref('user').child(userId).update({ nextSerie: nextSerie });    
    }
    return Promise.resolve(false)    
});

function calculateNextSerie(serieData) {

    let finalPulse = serieData.finalPulse;    
    let repeatsGoal = serieData.repeatsGoal; // no value
    let repeats = serieData.repeats;    
    let duration = serieData.duration;
    let interval = serieData.interval; // no value

    if(!finalPulse || !repeats || !duration ) {
        return null
    }

    if(!repeatsGoal){
        repeatsGoal = repeats
    }

    if(!interval) {
        interval = duration
    }
  
    // calculate pulseScore
    var pulseScore = 0; // 0 - stop training, 5 - excellent    
    if(finalPulse < 80) {
        pulseScore = 5        
    } else if(finalPulse < 90){
        pulseScore = 4        
    } else if(finalPulse < 100){
        pulseScore = 3        
    } else if(finalPulse < 110){
        pulseScore = 2        
    } else if(finalPulse < 120){
        pulseScore = 1        
    } else {
        pulseScore = 0        
    }
    // calculate pulseScore
    
    // calculate repeats
    var nextRepeats = repeats  
    if(repeats >= repeatsGoal) {        
      if(pulseScore === 5 || pulseScore === 4) {
        nextRepeats = repeats + Math.round(0.1 * repeats)
      } else if(pulseScore === 3 || pulseScore === 2){
        nextRepeats = repeats + 2
      } else if(pulseScore === 1){        
        nextRepeats = repeats + 1
      } else {
        nextRepeats = repeats
      }
    } else {
      if(pulseScore === 5 || pulseScore === 4) {
        nextRepeats = repeats
      } else if(pulseScore === 3 || pulseScore === 2){
        nextRepeats = repeats - 1
      } else if(pulseScore === 1){        
        nextRepeats = repeats - 2
      } else {
        nextRepeats = repeats - 3
      }
    }  
    // calculate repeats  
  
    // calculate nextDuration  
    var nextDurationModifier = 1
    if(pulseScore === 5 || pulseScore === 4) {
      nextDurationModifier = 1
    } else if(pulseScore === 3 || pulseScore === 2){
      nextDurationModifier = 1.05
    } else if(pulseScore === 1){        
      nextDurationModifier = 1.1
    } else {
      nextDurationModifier = 1.2
    }
    var nextDuration = Math.round((nextRepeats / repeats) * duration * nextDurationModifier);
    // calculate next duration
  
    return {        
        newInterval: Math.round( Math.max(nextRepeats / repeats * interval, interval)),
        newRepeats: nextRepeats,
        newDuration: nextDuration     
    }
  }