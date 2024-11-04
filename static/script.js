async function fetchFlag() {
    const response = await fetch('/get_flag');
    const data = await response.json();

    document.getElementById('flag').src = `/static/${data.flag_image}`;
    document.getElementById('feedback').textContent = "";  // Clear feedback
    document.getElementById('next-button').style.display = "none"; // Hide Next button

    const buttons = document.querySelectorAll('.option-button');
    buttons.forEach((button, index) => {
        button.textContent = data.options[index];
        button.disabled = false;
        button.classList.remove('correct', 'incorrect');  // Reset button colors
        button.onclick = () => checkAnswer(data.options[index], data.correct_answer, button, data.options);
    });
}

async function checkAnswer(userAnswer, correctAnswer, clickedButton, options) {
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
        feedback.innerHTML = `Correct!<br>This flag is of the country ${correctAnswer}.`;
        clickedButton.classList.add('correct');
    } else {
        feedback.innerHTML = `Incorrect!<br>This flag is of the country ${correctAnswer}.`;
        clickedButton.classList.add('incorrect');

        // Highlight the correct button
        buttons.forEach(button => {
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            }
        });
    }

    // Disable buttons after guess
    buttons.forEach(button => {
        button.disabled = true;
    });

    document.getElementById('next-button').style.display = "block"; // Show Next button
}

function nextFlag() {
    fetchFlag();  // Fetch a new flag
}

// Load the first flag on page load
window.onload = fetchFlag;
