from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pymongo import MongoClient

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB settings (supports full MONGO_URI or components)
MONGO_URI = os.getenv("MONGO_URI")
MDB_USER = os.getenv("DB_USER", "mongodbuser")
MDB_PASSWORD = os.getenv("DB_PASSWORD", "")
MDB_HOST = os.getenv("DB_HOST", "localhost")
MDB_PORT = os.getenv("DB_PORT", "27017")
MDB_NAME = os.getenv("DB_NAME", os.getenv("DB_NAME", "example_db"))

if not MONGO_URI:
    if MDB_USER:
        MONGO_URI = f"mongodb://{MDB_USER}:{MDB_PASSWORD}@{MDB_HOST}:{MDB_PORT}"
    else:
        MONGO_URI = f"mongodb://{MDB_HOST}:{MDB_PORT}"

client = MongoClient(MONGO_URI)
db = client[MDB_NAME]
