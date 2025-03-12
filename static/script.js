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

  // Обновляем отображение streak при загрузке нового флага
  updateScoreCounter();
}

async function checkAnswer(userAnswer, correctAnswer, clickedButton) {
  const response = await fetch('/check_answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_answer: userAnswer, correct_answer: correctAnswer }),
  });
  const data = await response.json();

  const feedback = document.getElementById('feedback');
  const buttons = document.querySelectorAll('.option-button');

  if (userAnswer === correctAnswer) {
    feedback.innerHTML = `Correct!<br>This flag belongs to ${correctAnswer}.`;
    clickedButton.classList.add('correct');
    currentStreak++; // увеличиваем streak
  } else {
    feedback.innerHTML = `Incorrect!<br>This flag belongs to ${correctAnswer}.`;
    clickedButton.classList.add('incorrect');
    buttons.forEach(button => {
      if (button.textContent === correctAnswer) {
        button.classList.add('correct');
      }
    });
    currentStreak = 0; // сбрасываем streak
  }

  // Если текущая серия превышает лучший результат, обновляем его
  if (currentStreak > bestScore) {
    bestScore = currentStreak;
    localStorage.setItem('bestScore', bestScore);
  }

  buttons.forEach(button => {
    button.disabled = true;
  });

  document.getElementById('next-button').style.display = "block";
  updateScoreCounter();
}

function updateScoreCounter() {
  document.getElementById('score-counter').textContent = `Streak: ${currentStreak}`;
}

function startGame() {
  // Сбрасываем счетчик при начале новой игры
  currentStreak = 0;
  updateScoreCounter();
  document.getElementById('lobby').style.display = 'none';
  hideAllPages();
  document.getElementById('game').style.display = 'block';
  fetchFlag();
}

function nextFlag() {
  fetchFlag(); // Загружаем новый флаг
}

function endGame() {
  document.getElementById('game').style.display = 'none';
  hideAllPages();
  document.getElementById('lobby').style.display = 'block';
}

function showSettings() {
  hideAllPages();
  document.getElementById('settings').style.display = 'block';
}

function showLeaderboard() {
  hideAllPages();
  document.getElementById('leaderboard').style.display = 'block';
  // Обновляем информацию в лидерборде
  document.getElementById('leaderboard-content').textContent = `Your Best Score: ${bestScore}`;
}

function backToLobby() {
  hideAllPages();
  document.getElementById('lobby').style.display = 'block';
}

function hideAllPages() {
  document.getElementById('lobby').style.display = 'none';
  document.getElementById('game').style.display = 'none';
  document.getElementById('settings').style.display = 'none';
  document.getElementById('leaderboard').style.display = 'none';
}
