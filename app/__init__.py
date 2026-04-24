from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from flask_mail import Mail
import os
from datetime import timedelta


load_dotenv(override=True)


db = SQLAlchemy()
bcrypt = Bcrypt()
mail = Mail()

def create_app():
    
    app = Flask(__name__)
    
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "devkey")  # dev key is used to tell flask if no secret key exists, use this as a fallback
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///glh.db'
    
    
    # MAIL CONFIG
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv("EMAIL_USER")
    app.config['MAIL_PASSWORD'] = os.getenv("EMAIL_PASS")
    
    print("MAIL USER:", app.config["MAIL_USERNAME"])
    print("MAIL PASS:", app.config['MAIL_PASSWORD'])
    
    db.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)
    
    from app.routes.main import main
    app.register_blueprint(main)
    
    
    from app.routes.auth import auth 
    app.register_blueprint(auth, url_prefix="/auth")
    
    from app.routes.vendor import vendor as vendor_bp
    app.register_blueprint(vendor_bp)
    
    from app.routes.admin import admin as admin_bp
    app.register_blueprint(admin_bp)

    
    return app