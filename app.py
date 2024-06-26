from flask import Flask, request, jsonify ,render_template
from flask_cors import CORS
import nltk
from nltk.stem import WordNetLemmatizer
import pickle
import numpy as np
from keras.models import load_model
import json
import random

app = Flask(__name__)

nltk.download('wordnet')
lemmatizer = WordNetLemmatizer()
model = load_model('chatassistant_model.h5')
intents = json.loads(open('intents.json').read())
words = pickle.load(open('words.pkl', 'rb'))
classes = pickle.load(open('classes.pkl', 'rb'))


def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words


def bow(sentence, words, show_details=True):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
                if show_details:
                    print("found in bag: %s" % w)
    return (np.array(bag))


def predict_class(sentence, model):
    p = bow(sentence, words, show_details=False)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    return return_list


def getResponse(ints, intents_json):
    tag = ints[0]['intent']
    list_of_intents = intents_json['intents']
    for i in list_of_intents:
        if (i['tag'] == tag):
            result = random.choice(i['responses'])
            break
    return result


def chatbot_response(msg):
    ints = predict_class(msg, model)
    res = getResponse(ints, intents)
    return res


@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        if user_message:
            response = chatbot_response(user_message)
            return jsonify({"response": response})
        else:
            return jsonify({"error": "No message provided"}), 400
    except Exception as e:
        app.logger.error(f"Error handling the /api/chat route: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/")
def start():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True)
