import json  # Add this line
from flask import Flask, request, jsonify
from transformers import pipeline
import firebase_admin
from firebase_admin import credentials, firestore, exceptions
from datetime import datetime
import re

app = Flask(__name__)
try:
    classifier = pipeline("zero-shot-classification", model="distilbert-base-uncased")  # Lighter model
except Exception as e:
    print(f"Error loading model: {e}")
    classifier = None  # Fallback to basic logic if model fails

candidate_labels = ["class_schedule", "cafeteria_menu", "bus_schedule", "events", "faq", "general_chat"]

# Initialize Firebase
try:
    cred = credentials.Certificate('C:\\Users\\mbdba\\Desktop\\nex\\Nexora\\nexora1.0\\serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    db = None  # Fallback to mock responses if Firebase fails

def get_collection_documents(collection_name):
    if not db:
        return {}
    try:
        docs = db.collection(collection_name).get()
        return {doc.id: doc.to_dict() for doc in docs}
    except exceptions.FirebaseError as e:
        print(f"Firebase error fetching {collection_name}: {e}")
        return {}

def extract_degree_batch(message):
    degree_match = re.search(r'(cs|ee|comp|elec)', message)  # Customize degrees as per your DB
    batch_match = re.search(r'batch (\w+)', message)
    return (degree_match.group(0) if degree_match else None, batch_match.group(1) if batch_match else None)

@app.route('/ai', methods=['POST'])
def process_message():
    if not classifier or not db:
        return jsonify({"reply": "Service unavailable due to internal error. Try again later."})

    data = request.get_json()
    message = data.get('message', '').lower()
    degree = data.get('degree', None)
    batch = data.get('batch', None)

    # Extract degree and batch from message if not provided
    if not degree or not batch:
        degree, batch = extract_degree_batch(message)

    result = classifier(message, candidate_labels)
    intent = result['labels'][0]
    score = result['scores'][0]

    response = f"Processing {intent} with confidence {score:.2f}. "
    if intent == "class_schedule":
        schedules = get_collection_documents('schedules')
        if degree and batch:
            doc = schedules.get(degree, {})
            if doc and doc.get('batchNumber') == batch:
                response += f"Schedule for {degree.upper()} {batch}: " + json.dumps(doc)
            else:
                response += f"No schedule found for {degree.upper()} {batch}."
        else:
            response += "Please specify a degree (e.g., cs, ee) and batch (e.g., CS2023) in your message."
    elif intent == "cafeteria_menu":
        menus = get_collection_documents('cafeteria_menu')
        today = datetime.now().strftime('%A')
        doc = menus.get(today, {})
        if doc:
            response += f"Menu for {today}: " + json.dumps(doc)
        else:
            response += f"No menu available for {today}."
    elif intent == "bus_schedule":
        bus_times = get_collection_documents('bus_times')
        today = datetime.now().strftime('%A')
        doc = bus_times.get(today, {})
        if doc:
            response += f"Bus schedule for {today}: " + json.dumps(doc)
        else:
            response += f"No bus schedule available for {today}."
    elif intent == "events":
        events = get_collection_documents('events')
        if events:
            response += "Upcoming events: " + json.dumps(list(events.values()))
        else:
            response += "No upcoming events."
    elif intent == "faq":
        response += "For FAQs, visit the university website."
    elif intent == "general_chat":
        general_responses = {
            "hi": "Hello! How can I assist you today?",
            "hello": "Hi there! What would you like to know?",
            "how are you": "I'm doing great, thanks! How about you?",
            "bye": "Goodbye! Feel free to return anytime.",
            "thanks": "You're welcome! Any other questions?"
        }
        response = general_responses.get(message.split()[0], "I'm here to help! Try asking about schedules, menus, or events.") + " "

    return jsonify({"reply": response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)