from flask import Blueprint, render_template
from app.models import User
from app import db

main = Blueprint('main', __name__)

@main.route("/")
def home():
    return "<h1>GLH platform Running </h1>"

@main.route("/test-db")
def test_db():
    user = User(full_name="Test User", email="testing@test.com", password_hash="123", date_of_birth="12/03/2026")
    db.session.add(user)
    db.session.commit()
    return "User added!"