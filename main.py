from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import random

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Задайте секретный ключ
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db'
db = SQLAlchemy(app)


# Модель пользователя
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    best_score = db.Column(db.Integer, default=0)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# Данные флагов
flags = {
    "france.png": "France",
    "germany.png": "Germany",
    "italy.png": "Italy",
    "spain.png": "Spain",
    "albania.png": "Albania",
    "andorra.png": "Andorra",
    "angola.png": "Angola",
    "argentina.png": "Argentina",
    "armenia.png": "Armenia",
    "australia.png": "Australia",
    "bahamas.png": "Bahamas",
    "bahrain.png": "Bahrain",
    "barbados.png": "Barbados",
    "belgium.png": "Belgium",
    "bhutan.png": "Bhutan",
    "botswana.png": "Botswana",
    "brazil.png": "Brazil",
    "bulgaria.png": "Bulgaria",
    "cambodia.png": "Cambodia",
    "cameroon.png": "Cameroon",
    "chile.png": "Chile",
    "china.png": "China",
    "colombia.png": "Colombia",
    "costarica.png": "Costa Rica",
    "croatia.png": "Croatia",
    "cuba.png": "Cuba",
    "cyprus.png": "Cyprus",
    "czechrep.png": "Czech Republic",
    "denmark.png": "Denmark",
    "dominica.png": "Dominica",
    "dominicanrep.png": "Dominican Republic",
    "ecuador.png": "Ecuador",
    "egypt.png": "Egypt",
    "estonia.png": "Estonia",
    "finland.png": "Finland",
}


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if User.query.filter_by(username=username).first():
            return "User already exists."
        user = User(username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        session['username'] = username
        return redirect(url_for('index'))
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            session['username'] = username
            return redirect(url_for('index'))
        return "Invalid credentials."
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))


# Главная страница
@app.route('/')
def index():
    username = session.get('username')
    return render_template('index.html', username=username)


# Эндпоинт для получения флага
@app.route('/get_flag', methods=['GET'])
def get_flag():
    correct_flag, correct_country = random.choice(list(flags.items()))
    all_countries = list(flags.values())
    all_countries.remove(correct_country)
    options = [correct_country] + random.sample(all_countries, 3)
    random.shuffle(options)
    return jsonify({
        "flag_image": correct_flag,
        "options": options,
        "correct_answer": correct_country
    })


# Проверка ответа
@app.route('/check_answer', methods=['POST'])
def check_answer():
    data = request.json
    if data['user_answer'] == data['correct_answer']:
        # Если пользователь авторизован, обновляем лучший результат
        username = session.get('username')
        if username:
            user = User.query.filter_by(username=username).first()
            if user:
                current_score = data.get('current_streak', 0)
                if current_score > user.best_score:
                    user.best_score = current_score
                    db.session.commit()
        return jsonify({"result": "Correct!"})
    else:
        return jsonify({"result": "Try again!"})


# Лидерборд: вывод топ-10 пользователей по лучшему результату
@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    users = User.query.order_by(User.best_score.desc()).limit(10).all()
    leaderboard_data = [{"username": u.username, "best_score": u.best_score} for u in users]
    return render_template('leaderboard.html', leaderboard=leaderboard_data)


@app.route('/game_over', methods=['GET', 'POST'])
def game_over():
    if request.method == 'POST':
        # Получаем текущий стрик из запроса
        current_streak = request.json.get('current_streak', 0)
        return jsonify({"status": "success"})

    # GET-запрос: отображаем страницу с переданным score
    score = request.args.get('score', 0)
    return render_template('game_over.html', current_score=score)


@app.route('/save_score', methods=['POST'])
def save_score():
    username = session.get('username')
    if not username:
        return jsonify({"error": "Not authorized"}), 401

    user = User.query.filter_by(username=username).first()
    data = request.json
    current_score = data.get('current_streak', 0)

    if current_score > user.best_score:
        user.best_score = current_score
        db.session.commit()

    return jsonify({"status": "success"})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
