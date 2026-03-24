from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import os

db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "devkey")
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///glh.db'
    
    db.init_app(app)
    bcrypt.init_app(app)
    
    from app.routes.main import main
    app.register_blueprint(main)
    
    return app