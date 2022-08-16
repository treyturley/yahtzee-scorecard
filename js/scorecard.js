const scorecardForm = document.querySelector('#scorecard'); //select on id scorecard
scorecardForm.addEventListener('change', onChange);

// some rule name constants for the calculated boxes
const UPPER_SCORE = 'upperScore';
const BONUS_SCORE = 'bonusScore';
const UPPER_TOTAL_SCORE = 'upperTotalScore';

const scorecard = []

class scoreBox {
  constructor(game, rule, score = 0) {
    this.game = game;
    this.rule = rule;
    this.score = score;
  }
}


function onChange(e) {
  const game = e.target.name.split('-')[0];
  const rule = e.target.name.split('-')[1];
  const score = e.target.value;

  // TODO: maybe check for a valid score before moving on?
  // 1. user sets score to zero or anything less than zero
  // 2. users sets too high of a score. ex: Aces score set to 6 is not possible
  const newScore = new scoreBox(game, rule, score);

  let scoreBoxIndex = findScoreBoxIndex(newScore);

  if (scoreBoxIndex >= 0) {
    scorecard[scoreBoxIndex].score = newScore.score; // update existing
  } else {
    scorecard.push(newScore); // add new
  }

  console.log(scorecard); // TODO: remove before going live

  // after an input changes, update the calculated score boxes
  updateUpperScore(game);
  checkForUpperBonus(game);
  updateUpperTotalScore(game);
}


function updateUpperScore(game) {
  upperScoreBox = new scoreBox(game, UPPER_SCORE, 0);
  upperScoreElmt = document.querySelector(`#${game}-${UPPER_SCORE}`);

  upperScoreBox.score = calculateUpperGameScore(game);

  let upperScoreIndex = findScoreBoxIndex(upperScoreBox);

  if (upperScoreIndex >= 0) {
    scorecard[upperScoreIndex].score = upperScoreBox.score;  // update existing
  } else {
    scorecard.push(upperScoreBox); // push new scorebox for this game
  }

  upperScoreElmt.innerText = upperScoreBox.score;
}


function checkForUpperBonus(game) {

  let upperScore = calculateUpperGameScore(game);

  const bonusScoreBox = new scoreBox(game, BONUS_SCORE, 0);

  let bonusScoreIndex = findScoreBoxIndex(bonusScoreBox);

  if (upperScore >= 63) {
    // add bonus
    document.getElementById(`${game}-${BONUS_SCORE}`).innerText = 35;
    bonusScoreBox.score = 35;
  } else {
    // set to zero
    document.getElementById(`${game}-${BONUS_SCORE}`).innerText = 0;
  }

  if (bonusScoreIndex >= 0) {
    scorecard[bonusScoreIndex].score = bonusScoreBox.score;
  } else {
    scorecard.push(bonusScoreBox);
  }
}


function updateUpperTotalScore(game) {
  let indexUpperScore = findScoreBoxIndex(new scoreBox(game, UPPER_SCORE));
  let indexBonusScore = findScoreBoxIndex(new scoreBox(game, BONUS_SCORE));
  console.log(`Upper Score Index:${indexUpperScore}, Bonus index: ${indexBonusScore}`);

  let total = 0;

  if (indexUpperScore >= 0) {
    total += scorecard[indexUpperScore].score;
  }

  if (indexBonusScore >= 0) {
    total += scorecard[indexBonusScore].score;
  }

  document.getElementById(`${game}-${UPPER_TOTAL_SCORE}`).innerText = total;
}


function findScoreBoxIndex(newScoreBox) {
  let foundIndex = scorecard.findIndex((scoreBox) => {
    if (scoreBox.game === newScoreBox.game && scoreBox.rule === newScoreBox.rule) {
      return true;
    }
    return false;
  });

  return foundIndex;
}


function calculateUpperGameScore(game) {
  let score = 0;

  // ignores the calculated scores
  scorecard.forEach(scoreBox => {
    if (scoreBox.game === upperScoreBox.game
      && scoreBox.rule != UPPER_SCORE
      && scoreBox.rule != BONUS_SCORE
      && scoreBox.rule != UPPER_TOTAL_SCORE) {
      score += parseInt(scoreBox.score);
    }
  });

  return score;
}