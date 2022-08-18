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

/**
 * Represents an individual box on the scorecard where a score can be entered.
 */
class ScoreBox {
  constructor(game, rule, score = 0) {
    this.game = game;
    this.rule = rule;
    this.score = score;
  }
}

/**
 * Handles input changes on the upper scorecard.
 * @param {Event} e - The event fired when an input changes
 */
function onChangeUpper(e) {
  const game = e.target.name.split('-')[0];
  const rule = e.target.name.split('-')[1];
  const score = e.target.value;

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

  updateUpperScore(game);
  checkForUpperBonus(game);
  updateUpperTotalScore(game);
  updateGrandTotal(game);
}

/**
 * Handles input changes on the lower scorecard.
 * @param {Event} e - The event fired when an input changes 
 */
function onChangeLower(e) {
  const game = e.target.name.split('-')[0];
  const rule = e.target.name.split('-')[1];
  const score = e.target.value;

  const newScore = new ScoreBox(game, rule, score);

  let scoreBoxIndex = findLowerScoreBoxIndex(newScore);

  if (scoreIsValid(newScore)) {
    if (scoreBoxIndex >= 0) {
      lowerScorecard[scoreBoxIndex].score = newScore.score; // update existing
    } else {
      lowerScorecard.push(newScore); // add new
    }
  } else {
    if (scoreBoxIndex >= 0) {
      lowerScorecard[scoreBoxIndex].score = 0; // update existing
      document.querySelector('[name=' + `${game}-${rule}` + ']').value = 0;
    } else {
      newScore.score = 0;
      lowerScorecard.push(newScore); // add new
      document.querySelector('[name=' + `${game}-${rule}` + ']').value = 0;
    }
  }

  updateYahtzeeBonusScore(game);
  updateLowerScore(game);
  updateGrandTotal(game);
}

/**
 * Handles clicks made on the scoreboxes that have pre-set scores like Full House.
 * @param {Event} e - The event that fires when clicking on a scorebox.
 */
function clickScorebox(e) {
  // identify which scorebox was selected and update the score
  let lowerScoreElmtName = '';
  const game = e.target.getAttribute('name').split('-')[0];
  const rule = e.target.getAttribute('name').split('-')[1];
  let score = 0;

  const newScorebox = new ScoreBox(game, rule);
  
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
    // a click on an existing score means we need to toggle it from 0 to the score or vice-versa
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

  updateLowerScore(game);
  updateGrandTotal(game);
}

/**
 * Updates the TOTAL SCORE scorebox with the sum of the upper score section.
 * @param {string} game - A string representing which game needs to update.
 */
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

/**
 * Checks to see if the criteria for the upper section bonus has been met.
 * If it has, the bonus is added to the scorecard.
 * @param {string} game - A string representing which game needs to update.
 */
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


/**
 * Updates the TOTAL of upper section scorebox with the TOTAL SCORE + Bonus.
 * @param {string} game - A string representing which game needs to update.
 */
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
}

/**
 * Searches the upper scorecard array to see if a scorebox obj already exists.
 * @param {ScoreBox} newScoreBox - The scorebox to look for in the upper scorecard array.
 * @returns The index of the scorebox in the upper scorecard array if found otherwise -1.
 */
function findUpperScoreBoxIndex(newScoreBox) {
  let foundIndex = upperScorecard.findIndex((scoreBox) => {
    if (scoreBox.game === newScoreBox.game && scoreBox.rule === newScoreBox.rule) {
      return true;
    }
    return false;
  });

  return foundIndex;
}

/**
 * Searches the lower scorecard array to see if a scorebox obj already exists.
 * @param {ScoreBox} newScoreBox - The scorebox to look for in the lower scorecard array.
 * @returns The index of the scorebox in the lower scorecard array if found otherwise -1.
 */
function findLowerScoreBoxIndex(newScoreBox) {
  let foundIndex = lowerScorecard.findIndex((scoreBox) => {
    if (scoreBox.game === newScoreBox.game && scoreBox.rule === newScoreBox.rule) {
      return true;
    }
    return false;
  });

  return foundIndex;

}

/**
 * Calculates the total score of the upper section not including the bonus.
 * @param {string} game - A string representing which game needs to update.
 * @returns A number representing the total score.
 */
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

/**
 * Updates the Total of lower section score.
 * @param {string} game - A string representing which game needs to update.
 */
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

/**
 * Calculates the total score of the lower section.
 * @param {string} game - A string representing which game needs to update.
 * @returns The total for the lower section of the scorecard.
 */
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

/**
 * Checks to see if a yahtzee bonus score needs to be calculated and added to the scorecard.
 * @param {*} game - A string representing which game needs to update.
 */
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

/**
 * Updates the grand total score box with the total score for the game.
 * Total of upper + Total of lower = Grand Total
 * @param {string} game - A string representing which game needs to update.
 */
function updateGrandTotal(game) {
  let total = 0;
  const upperScoreBoxIndex = findUpperScoreBoxIndex(new ScoreBox(game, UPPER_TOTAL_SCORE));
  const lowerScoreBoxIndex = findLowerScoreBoxIndex(new ScoreBox(game, LOWER_SCORE));
  const grandTotalBoxIndex = findLowerScoreBoxIndex(new ScoreBox(game, GRAND_TOTAL));

  if (upperScoreBoxIndex != -1) {
    total += upperScorecard[upperScoreBoxIndex].score;
  }

  if (lowerScoreBoxIndex != -1) {
    total += lowerScorecard[lowerScoreBoxIndex].score;
  }

  if (grandTotalBoxIndex != -1) {
    lowerScorecard[grandTotalBoxIndex].score = total;
  } else {
    lowerScorecard.push(new ScoreBox(game, GRAND_TOTAL, total));
  }
  document.getElementById(`${game}-${GRAND_TOTAL}`).innerText = total;
}


/**
 * checks to see if the score is valid for the associated rule
 */
function scoreIsValid(scoreBox) {
  const rule = scoreBox.rule;
  const score = scoreBox.score;

  let isValid = false;

  let maxScore = 0;

  // short circuit when score is zero or less than zero
  if (score === 0) {
    isValid = true;
  } else if (score < 0) {
    isValid = false;
  } else {
    switch (rule) {
      case 'aces':
        maxScore = 1 * 4;
        break;
      case 'twos':
        maxScore = 2 * 4;
        break;
      case 'threes':
        maxScore = 3 * 4;
        break;
      case 'fours':
        maxScore = 4 * 4;
        break;
      case 'fives':
        maxScore = 5 * 4;
        break;
      case 'sixes':
        maxScore = 6 * 4;
        break;
      case '3kind':
        maxScore = 6 * 3 + 6 + 5;
        break;
      case '4kind':
        maxScore = 6 * 4 + 5;
        break;
      case 'chance':
        maxScore = 6 * 4 + 5;
        break;
      case 'bonusYahtzeeCount':
        maxScore = 13;
        break;
      default:
        console.error('Default case triggered in scoreIsValid');  //should never happen
    }
    if (score <= maxScore) {
      isValid = true;
    }
  }
  return isValid;
}