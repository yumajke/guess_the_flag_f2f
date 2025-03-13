let currentStreak = 0;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;

async function fetchFlag() {
  const response = await fetch('/get_flag');
  const data = await response.json();

  document.getElementById('flag').src = `/static/${data.flag_image}`;
  document.getElementById('feedback').textContent = "";
  document.getElementById('next-button').style.display = "none";

  const buttons = document.querySelectorAll('.option-button');
  buttons.forEach((button, index) => {
    button.textContent = data.options[index];
    button.disabled = false;
    button.classList.remove('correct', 'incorrect');
    button.onclick = () => checkAnswer(data.options[index], data.correct_answer, button);
  });

  updateScoreCounter();
}

async function checkAnswer(userAnswer, correctAnswer, clickedButton) {
  const response = await fetch('/check_answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_answer: userAnswer, correct_answer: correctAnswer, current_streak: currentStreak }),
  });
  const data = await response.json();

  const feedback = document.getElementById('feedback');
  const buttons = document.querySelectorAll('.option-button');

  if (userAnswer === correctAnswer) {
    feedback.innerHTML = `Correct!<br>This flag belongs to ${correctAnswer}.`;
    clickedButton.classList.add('correct');
    currentStreak++;
  } else {
    feedback.innerHTML = `Incorrect!<br>This flag belongs to ${correctAnswer}.`;
    clickedButton.classList.add('incorrect');
    buttons.forEach(button => {
      if (button.textContent === correctAnswer) {
        button.classList.add('correct');
      }
    });
    currentStreak = 0;
  }

  if (currentStreak > bestScore) {
    bestScore = currentStreak;
    localStorage.setItem('bestScore', bestScore);
  }

  buttons.forEach(button => { button.disabled = true; });
  document.getElementById('next-button').style.display = "block";
  updateScoreCounter();
}

function updateScoreCounter() {
  document.getElementById('score-counter').textContent = `Current streak: ${currentStreak}`;
}

function startGame() {
  if (typeof isLoggedIn === 'undefined' || (isLoggedIn !== true && isLoggedIn !== "true")) {
    alert("Please log in or register before starting the game!");
    return;
  }
  currentStreak = 0;
  updateScoreCounter();
  hideAllPages();
  document.getElementById('game').style.display = 'block';
  document.getElementById('navbar').style.display = 'none'; // Скрываем navbar в игровом режиме
  fetchFlag();
}

function nextFlag() {
  fetchFlag();
}

function showSettings() {
  if (typeof isLoggedIn === 'undefined' || (isLoggedIn !== true && isLoggedIn !== "true")) {
    alert("Please log in or register before accessing Settings!");
    return;
  }
  hideAllPages();
  document.getElementById('settings').style.display = 'block';
  document.getElementById('navbar').style.display = 'none'; // Скрываем navbar на странице настроек
}

function backToLobby() {
  hideAllPages();
  document.getElementById('lobby').style.display = 'block';
  document.getElementById('navbar').style.display = 'block';
}

function hideAllPages() {
  document.getElementById('lobby').style.display = 'none';
  document.getElementById('game').style.display = 'none';
  document.getElementById('settings').style.display = 'none';
}
