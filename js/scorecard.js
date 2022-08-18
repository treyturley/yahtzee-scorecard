"use strict";

// add event handling
const upperScorecardFrom = document.querySelector('#upperScorecard');
upperScorecardFrom.addEventListener('change', onChangeUpper);

const lowerScorecardFrom = document.querySelector('#lowerScorecard');
lowerScorecardFrom.addEventListener('change', onChangeLower);

const scoreboxToggles = document.getElementsByClassName('scorebox-toggle');
for (let i = 0; i < scoreboxToggles.length; i++) {
  scoreboxToggles[i].addEventListener('click', clickScorebox);
}

// some rule name constants for the calculated score boxes
const UPPER_SCORE = 'upperScore';
const BONUS_SCORE = 'bonusScore';
const UPPER_TOTAL_SCORE = 'upperTotalScore';
const BONUS_YAHTZEE_COUNT = 'bonusYahtzeeCount';
const BONUS_YAHTZEE_SCORE = 'bonusYahtzeeScore'
const LOWER_SCORE = 'lowerScore';
// this is the upper section total at the bottom of the scorecard
const UPPER_TOTAL_SCORE2 = 'upperTotalScore2';
const GRAND_TOTAL = 'grandTotal';

// rule name constants for the clickable divs
const FULL_HOUSE = 'fullHouse';
const SMALL_STRAIGHT = 'smallStraight';
const LARGE_STRAIGHT = 'largeStraight';
const YAHTZEE = 'yahtzee';

const upperScorecard = []
const lowerScorecard = []

class ScoreBox {
  constructor(game, rule, score = 0) {
    this.game = game;
    this.rule = rule;
    this.score = score;
  }
}


function onChangeUpper(e) {
  const game = e.target.name.split('-')[0];
  const rule = e.target.name.split('-')[1];
  const score = e.target.value;

  // TODO: maybe check for a valid score before moving on?
  // 1. user sets score to zero or anything less than zero
  // 2. users sets too high of a score. ex: Aces score set to 6 is not possible
  const newScore = new ScoreBox(game, rule, score);

  let scoreBoxIndex = findUpperScoreBoxIndex(newScore);

  if (scoreIsValid(newScore)) {
    if (scoreBoxIndex >= 0) {
      upperScorecard[scoreBoxIndex].score = newScore.score; // update existing
    } else {
      upperScorecard.push(newScore); // add new
    }
  } else {
    if (scoreBoxIndex >= 0) {
      upperScorecard[scoreBoxIndex].score = 0; // update existing
      document.querySelector('[name=' + `${game}-${rule}` + ']').value = 0;
    } else {
      newScore.score = 0;
      upperScorecard.push(newScore); // add new
      document.querySelector('[name=' + `${game}-${rule}` + ']').value = 0;
    }
  }

  console.log('Upper Scorecard:'); // TODO: remove before going live
  console.log(upperScorecard);

  // after an input changes, update the calculated score boxes
  updateUpperScore(game);
  checkForUpperBonus(game);
  updateUpperTotalScore(game);
  updateGrandTotal(game);
}


// TODO: Some input validation to check for empty strings and aynthing < 0
function onChangeLower(e) {
  const game = e.target.name.split('-')[0];
  const rule = e.target.name.split('-')[1];
  const score = e.target.value;

  const newScore = new ScoreBox(game, rule, score);

  let scoreBoxIndex = findLowerScoreBoxIndex(newScore);

  if (scoreBoxIndex >= 0) {
    lowerScorecard[scoreBoxIndex].score = newScore.score; // update existing
  } else {
    lowerScorecard.push(newScore); // add new
  }

  console.log('Lower Scorecard:'); // TODO: remove before going live
  console.log(lowerScorecard);

  updateYahtzeeBonusScore(game);
  updateLowerScore(game);
  updateGrandTotal(game);
}


function clickScorebox(e) {
  // identify which scorebox was selected and update the score
  let lowerScoreElmtName = '';
  const game = e.target.getAttribute('name').split('-')[0];
  const rule = e.target.getAttribute('name').split('-')[1];
  let score = 0;

  const newScorebox = new ScoreBox(game, rule);

  // could be good use case for a switch
  switch (rule) {
    case FULL_HOUSE:
      score = 25;
      lowerScoreElmtName = `#${game}-${FULL_HOUSE}`;
      break;
    case SMALL_STRAIGHT:
      score = 30;
      lowerScoreElmtName = `#${game}-${SMALL_STRAIGHT}`;
      break;
    case LARGE_STRAIGHT:
      score = 40;
      lowerScoreElmtName = `#${game}-${LARGE_STRAIGHT}`;
      break;
    case YAHTZEE:
      score = 50;
      lowerScoreElmtName = `#${game}-${YAHTZEE}`;
      break;
  }

  newScorebox.score = score;
  let lowerScoreBoxElmt = document.querySelector(lowerScoreElmtName);

  let scoreBoxIndex = findLowerScoreBoxIndex(newScorebox);

  if (scoreBoxIndex >= 0) {
    // a click on an existing means we need to toggle it from 0 to the score or vice-versa
    if (lowerScorecard[scoreBoxIndex].score === 0) {
      lowerScorecard[scoreBoxIndex].score = newScorebox.score;
      lowerScoreBoxElmt.innerHTML = newScorebox.score;
    } else {
      lowerScorecard[scoreBoxIndex].score = 0;
      lowerScoreBoxElmt.innerHTML = 0;
    }
  } else {
    // a score doesnt exist yet so add new one
    lowerScorecard.push(newScorebox);
    lowerScoreBoxElmt.innerHTML = newScorebox.score;
  }

  console.log('Lower Scorecard:'); // TODO: remove before going live
  console.log(lowerScorecard);

  updateLowerScore(game);
  updateGrandTotal(game);
}


// updates the score in the TOTAL SCORE box of the upper section
function updateUpperScore(game) {
  const upperScoreBox = new ScoreBox(game, UPPER_SCORE, 0);
  const upperScoreElmt = document.querySelector(`#${game}-${UPPER_SCORE}`);

  upperScoreBox.score = calculateUpperGameScore(game);

  let upperScoreIndex = findUpperScoreBoxIndex(upperScoreBox);

  if (upperScoreIndex >= 0) {
    upperScorecard[upperScoreIndex].score = upperScoreBox.score;  // update existing
  } else {
    upperScorecard.push(upperScoreBox); // push new scorebox for this game
  }

  upperScoreElmt.innerText = upperScoreBox.score;
}


function checkForUpperBonus(game) {

  let upperScore = calculateUpperGameScore(game);

  const bonusScoreBox = new ScoreBox(game, BONUS_SCORE, 0);

  let bonusScoreIndex = findUpperScoreBoxIndex(bonusScoreBox);

  if (upperScore >= 63) {
    // add bonus
    document.getElementById(`${game}-${BONUS_SCORE}`).innerText = 35;
    bonusScoreBox.score = 35;
  } else {
    // set to zero
    document.getElementById(`${game}-${BONUS_SCORE}`).innerText = 0;
  }

  if (bonusScoreIndex >= 0) {
    upperScorecard[bonusScoreIndex].score = bonusScoreBox.score;
  } else {
    upperScorecard.push(bonusScoreBox);
  }
}


// updates the score in the TOTAL of the upper section
function updateUpperTotalScore(game) {
  const indexUpperScore = findUpperScoreBoxIndex(new ScoreBox(game, UPPER_SCORE));
  const indexBonusScore = findUpperScoreBoxIndex(new ScoreBox(game, BONUS_SCORE));
  const indexUpperTotalScore = findUpperScoreBoxIndex(new ScoreBox(game, UPPER_TOTAL_SCORE));

  let total = 0;

  if (indexUpperScore >= 0) {
    total += upperScorecard[indexUpperScore].score;
  }

  if (indexBonusScore >= 0) {
    total += upperScorecard[indexBonusScore].score;
  }

  document.getElementById(`${game}-${UPPER_TOTAL_SCORE}`).innerText = total;
  document.getElementById(`${game}-${UPPER_TOTAL_SCORE2}`).innerText = total;

  if (indexUpperTotalScore >= 0) {
    upperScorecard[indexUpperTotalScore].score = total;
  } else {
    upperScorecard.push(new ScoreBox(game, UPPER_TOTAL_SCORE, total));
  }

  // TODO: also update the Total of upper section box thats at the bottom of the lower section
}


function findUpperScoreBoxIndex(newScoreBox) {
  let foundIndex = upperScorecard.findIndex((scoreBox) => {
    if (scoreBox.game === newScoreBox.game && scoreBox.rule === newScoreBox.rule) {
      return true;
    }
    return false;
  });

  return foundIndex;
}


function findLowerScoreBoxIndex(newScoreBox) {
  let foundIndex = lowerScorecard.findIndex((scoreBox) => {
    if (scoreBox.game === newScoreBox.game && scoreBox.rule === newScoreBox.rule) {
      return true;
    }
    return false;
  });

  return foundIndex;

}


function calculateUpperGameScore(game) {
  let score = 0;
  // ignore the calculated scores boxes and lower section
  upperScorecard.forEach(scoreBox => {
    if (scoreBox.game === game
      && scoreBox.rule != UPPER_SCORE
      && scoreBox.rule != BONUS_SCORE
      && scoreBox.rule != UPPER_TOTAL_SCORE) {
      score += parseInt(scoreBox.score);
    }
  });
  return score;
}


function updateLowerScore(game) {
  const lowerScoreBox = new ScoreBox(game, LOWER_SCORE);
  const lowerScoreElmt = document.querySelector(`#${game}-${LOWER_SCORE}`);

  lowerScoreBox.score = calculateLowerGameScore(game);

  const lowerScoreIndex = findLowerScoreBoxIndex(lowerScoreBox);

  if (lowerScoreIndex >= 0) {
    lowerScorecard[lowerScoreIndex].score = lowerScoreBox.score;  // update existing
  } else {
    lowerScorecard.push(lowerScoreBox); // push new scorebox for this game
  }

  lowerScoreElmt.innerText = lowerScoreBox.score;

}


function calculateLowerGameScore(game) {
  let score = 0;
  // ignore the calculated scores boxes and lower section
  lowerScorecard.forEach(scoreBox => {
    if (scoreBox.game === game
      && scoreBox.rule != BONUS_YAHTZEE_COUNT
      && scoreBox.rule != LOWER_SCORE
      && scoreBox.rule != UPPER_TOTAL_SCORE2
      && scoreBox.rule != GRAND_TOTAL) {
      score += parseInt(scoreBox.score);
    }
  });
  return score;
}


function updateYahtzeeBonusScore(game) {
  const bonusYahtzeeCountScoreBox = new ScoreBox(game, BONUS_YAHTZEE_COUNT);
  const bonusYahtzeeScoreBox = new ScoreBox(game, BONUS_YAHTZEE_SCORE);
  const bonusYahtzeeScoreBoxElmt = document.querySelector(`#${game}-${BONUS_YAHTZEE_SCORE}`);

  let bonusCount, bonusScore = 0;

  // check to see if there is a yahtzee bonus score box
  const bonusYahtzeeCountIndex = findLowerScoreBoxIndex(bonusYahtzeeCountScoreBox);
  const bonusYahtzeeScoreIndex = findLowerScoreBoxIndex(bonusYahtzeeScoreBox);

  // multiple by the count of bonuses to get total
  if (bonusYahtzeeCountIndex != -1) {
    bonusCount = lowerScorecard[bonusYahtzeeCountIndex].score;
    if (bonusYahtzeeScoreIndex != -1) {
      // existing score
      lowerScorecard[bonusYahtzeeScoreIndex].score = bonusCount * 100;
    } else {
      // new score
      bonusYahtzeeScoreBox.score = bonusCount * 100;
      lowerScorecard.push(bonusYahtzeeScoreBox);
    }
    // update html element
    bonusYahtzeeScoreBoxElmt.innerText = bonusCount * 100;
  }
}


function updateGrandTotal(game){
  let total = 0;
  const upperScoreBoxIndex = findUpperScoreBoxIndex(new ScoreBox(game, UPPER_TOTAL_SCORE));
  const lowerScoreBoxIndex = findLowerScoreBoxIndex(new ScoreBox(game, LOWER_SCORE));
  const grandTotalBoxIndex = findLowerScoreBoxIndex(new ScoreBox(game, GRAND_TOTAL));

  if(upperScoreBoxIndex != -1){
    total += upperScorecard[upperScoreBoxIndex].score;
  }

  if(lowerScoreBoxIndex != -1){
    total += lowerScorecard[lowerScoreBoxIndex].score;
  }

  if(grandTotalBoxIndex != -1){
    lowerScorecard[grandTotalBoxIndex].score = total;
  } else {
    lowerScorecard.push(new ScoreBox(game, GRAND_TOTAL, total));
  }
  document.getElementById(`${game}-${GRAND_TOTAL}`).innerText = total;
}

/**
 * checks to see if the score is valid for the rule
 */
function scoreIsValid(scoreBox){

}