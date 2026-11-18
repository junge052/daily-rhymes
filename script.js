const words = ['light','time','blue','dream','heart','day','sound','rain','moon','fire','play','stone','air','sea','gold','fall','night','home','bright','star'];
let gameWords = []; let round = 0; let score = 0; let seconds = 25; let timer; let rhymes = []; let results = []; let playing = false; let used = []; let roundScore = 0;
const paperWords = document.getElementById('paper-words'); const timerHand = document.getElementById('timer-hand');
const promptText = document.getElementById('prompt'); const input = document.getElementById('answer'); const submit = document.getElementById('submit'); const next = document.getElementById('next'); const feedback = document.getElementById('feedback'); const timeText = document.getElementById('time'); const roundText = document.getElementById('round'); const scoreText = document.getElementById('score'); const recap = document.getElementById('recap');
next.addEventListener('click', function () {
  document.body.classList.remove('opening');
  if (round === 0 || round === 7) { gameWords = words.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 7); round = 0; score = 0; results = []; scoreText.textContent = '0'; recap.innerHTML = ''; }
  startRound();
});
async function startRound() {
  round++; seconds = 25; playing = false; rhymes = []; used = []; roundScore = 0; paperWords.innerHTML = ''; timerHand.style.transition = 'none'; timerHand.style.transform = 'rotate(180deg)';
  roundText.textContent = 'Round ' + round + ' of 7'; promptText.textContent = gameWords[round - 1]; document.getElementById('instruction').textContent = '';
  timeText.textContent = seconds; input.value = ''; input.disabled = true; submit.disabled = true; next.classList.add('hidden'); feedback.textContent = 'Finding rhymes…';
  try {
    const response = await fetch('https://api.datamuse.com/words?rel_rhy=' + encodeURIComponent(gameWords[round - 1]) + '&md=f&max=1000');
    if (!response.ok) throw new Error('Request failed');
    rhymes = await response.json(); if (!rhymes.length) throw new Error('No results');
    playing = true; input.disabled = false; submit.disabled = false; input.focus(); feedback.textContent = 'Type as many rhymes as you can!';
    timer = setInterval(function () { seconds--; timeText.textContent = seconds; timerHand.style.transition = 'transform 1s linear'; timerHand.style.transform = 'rotate(' + (180 + (25 - seconds) * 360 / 25) + 'deg)'; if (seconds <= 0) finishRound(); }, 1000);
  } catch (error) {
    feedback.textContent = 'Could not load rhymes. Check your connection and try again.';
    results.push(gameWords[round - 1] + ' — unavailable'); showNext();
  }
}
document.getElementById('answer-form').addEventListener('submit', function (event) {
  event.preventDefault(); if (!playing) return;
  let answer = input.value.trim().toLowerCase(); if (!answer) return; input.value = ''; input.focus();
  if (used.includes(answer)) { feedback.textContent = 'You already tried “' + answer + '”. Try another!'; return; }
  used.push(answer);
  let match = rhymes.find(function (item) { return item.word.toLowerCase() === answer; });
  if (!match) { feedback.textContent = 'We couldn’t find “' + answer + '”. Try another!'; return; }
  let wordOnPaper = document.createElement('li'); wordOnPaper.textContent = answer; paperWords.appendChild(wordOnPaper);
  let tag = (match.tags || []).find(function (item) { return item.startsWith('f:'); });
  if (!tag || !Number.isFinite(Number(tag.slice(2)))) { feedback.textContent = 'Rhyme found! No frequency data for “' + answer + '”, so it isn’t scored.'; return; }
  let frequency = Number(tag.slice(2)); let points;
  if (frequency >= 100) points = 20; else if (frequency >= 10) points = 40; else if (frequency >= 1) points = 60; else if (frequency >= 0.1) points = 80; else points = 100;
  score += points; roundScore += points; scoreText.textContent = score; feedback.textContent = '“' + answer + '” + ' + points + ' points! Keep going.';
});
function finishRound() {
  if (!playing) return; playing = false; clearInterval(timer); input.disabled = true; submit.disabled = true;
  results.push(gameWords[round - 1] + ' — ' + roundScore + ' points'); feedback.textContent = 'Time’s up! You earned ' + roundScore + ' points this round.'; showNext();
}
function showNext() {
  next.textContent = round === 7 ? 'play again' : 'next round'; next.classList.remove('hidden');
  if (round === 7) { promptText.textContent = 'nice one!'; document.getElementById('instruction').textContent = 'Your seven-round recap'; results.forEach(function (result) { let li = document.createElement('li'); li.textContent = result; recap.appendChild(li); }); }
}
