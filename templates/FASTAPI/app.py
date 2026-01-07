from flask import Flask, request, jsonify, make_response
from dotenv import load_dotenv
from database import get_db_connection
from flask import current_app

load_dotenv()

app = Flask(__name__)


@app.route('/api/users')
def get_users():
    return

@app.route('/api/users')
def get_user_by_id():
    return

@app.route('/api/users')
def create_user():
    return

@app.route('/api/users')
def update_user():
    return

@app.route('/api/users')
def delete_user():
    return


@app.route('/api/users')
def get_note():
    return

@app.route('/api/users')
def get_note_by_id():
    return

@app.route('/api/notes')
def create_note():
    return

@app.route('/api/notes')
def update_note():
    return

@app.route('/api/notes')
def delete_note():
    return





