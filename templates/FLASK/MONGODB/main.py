from config import app, db
from routes import *

if __name__ == "__main__":
    # MongoDB doesn't require create_all; just run the app
    app.run(debug=True, port=5000)
