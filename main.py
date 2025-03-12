from flask import Flask, jsonify, request, render_template
import random

app = Flask(__name__)

# Sample data for flags and countries
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
    "dominica,png": "Dominica",
    "dominicanrep.png": "Dominican Republic",
    "ecuador.png": "Ecuador",
    "egypt.png": "Egypt",
    "estonia.png": "Estonia",
    "finland.png": "Finland",
}

# Route to serve the main HTML file
@app.route('/')
def index():
    return render_template('index.html')  # Make sure 'index.html' is in the 'templates' folder

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

@app.route('/check_answer', methods=['POST'])
def check_answer():
    data = request.json
    if data['user_answer'] == data['correct_answer']:
        return jsonify({"result": "Correct!"})
    else:
        return jsonify({"result": "Try again!"})

if __name__ == '__main__':
    app.run(debug=True)
