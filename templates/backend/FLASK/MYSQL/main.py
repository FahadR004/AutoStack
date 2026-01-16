from config import app, db
from routes import *  

if __name__ == "__main__":
    # with app.app_context(): // Uncomment this after your database is ready to connect 
    #     db.create_all()
    app.run(debug=True, port=5000)

