from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from app.models import User
from app import db, bcrypt
import re
import random
from datetime import datetime, timedelta

auth = Blueprint("auth", __name__)

# Signup Route
@auth.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        step = request.form.get("step")
        
        
        # Step 1 Data
        if step == "1":
            first_name = request.form.get("first_name")
            last_name = request.form.get("last_name")
            day = request.form.get("day")
            month = request.form.get("month")
            year = request.form.get("year")
        
       
        
        
        # empty fields
        if not first_name or not last_name or not password or not confirm or not email:
            flash("Please fill in all required fields and try again", "error")
            return redirect(url_for("auth.signup"))
        
        # Validation
        #Name Validation
        if not re.match(r"^[A-Za-z]+$", first_name) or not re.match(r"^[A-Za-z]+$", last_name):
            flash("Names must only contain letters", "error")
            return redirect(url_for("auth.signup"))
        
        # Age Validation
        try:
            dob = datetime(int(year), int(month), int(day))
            age = (datetime.today() - dob).days // 365
            if age < 12:
                flash("You must be at least 12 years old", "error")
                return redirect(url_for("auth.signup"))
        except:
            flash("Invalid date of birth", "error")
            return redirect(url_for("auth.signup"))
        
        if not day or not month or not year:
            flash("Please select a valid date of birth", "error")
            return redirect(url_for("auth.signup"))
        
        # store in session
        session["signup"] = {
            "first_name": first_name,
            "last_name": last_name,
            "dob": f"{year}-{month}-{day}"
        }
        
        return render_template("auth/signup_step2.html")
    
    
    
    # STEP 2 -
    elif step == "2":
        email = request.form.get("email")
        password = request.form.get("password")
        confirm = request.form.get("confirm")
        
        if User.query.filter_by(email=email).first():
            flash("Email already exists", "error")
            return redirect(url_for("auth.signup"))
        
        if not re.match(r"[^@]+@[^@]+\.[^@]", email):
            flash("Invalid email format", "error")
            return redirect(url_for("auth.signup"))
        
        # Password Validation
        if password != confirm:
            flash("Passwords do not match.", "error")
            return redirect(url_for("auth.signup"))
        
        if len(password) < 8:
            flash("Password must be 8 characters long.", "error")
            return redirect(url_for("auth.signup"))
        
        if not re.search(r"[A-Za-z]", password):
            flash("Passwords must include at least one letter.", "error")
            return redirect(url_for("auth.signup"))
        
        if not re.search(r"[0-9]", password):
            flash("Password must contain at least one number.", "error")
            return redirect(url_for("auth.signup"))
        
        if not re.search(r"[!@#$%^&*()_\-+=\[\]{};:'\",.<>/?\\|`~]", password):
             flash("Password must include at least one special character.", "error")
             return redirect(url_for("auth.signup"))
         
         
        # hash password
        hashed = bcrypt.generate_password_hash(password).decode("utf-8")
        
        # store it temporarily
        session["signup"]["email"] = email
        session["signup"]["password"] = hashed
         
        
        # generate OTP
        otp = str(random.randint(100000, 999999))
        session["otp"] = otp
        session["otp_attempts"] = 0
        session["otp_expiry"] = (datetime.now() + timedelta(minutes=5)).isoformat()
        
        print("OTP (dev) :", otp) # dev only, later replace with email
        
        return render_template("auth/signup_verify.html", email=email)
    
    return render_template("auth/signup_step1.html")

# VERIFY OTP ROUTE - EAMIL VERIFICATION
@auth.route("/verify", methods=["POST"])
def verify():
    
    user_otp = request.form.get("otp")
    
    if "otp_attempts" not in session:
        return redirect(url_for("auth.signup"))
    
    
    # attempt limit
    session["otp_attempts"] += 1
        
    if session["otp_attempts"] > 5:
        session.clear()
        flash("Too many attempts. Try again.", "error")
        return redirect(url_for("auth.signup"))
    # expiry check
    if datetime.now() > datetime.fromisoformat(session["otp_expiry"]):
        flash("OTP expired", "error")
        return redirect(url_for("auth.signup"))
         
    if user_otp == session["otp"]:
        data = session["signup_data"]    
        
        user = User(
            full_name=data["first_name"] + "" + data["last_name"],
            email=data["email"],
            password_hash=data["password"],
            date_of_birth=data["dob"]                
            )
        
        db.session.add(user)
        db.session.commit()
        
        session.clear()
        flash("Account created successfully", "success")
        return redirect(url_for("auth.login"))
    
    flash("Invalid code", "error")
    return redirect(url_for("auth.signup"))

# LOGIN ROUTE
@auth.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email").strip()
        password = request.form.get("password").strip()
        
        user = User.query.filter_by(email=email).first()
        
        if "login_attempts" not in session:
            session["login_attempts"] = 0
            
        session["login_attempts"] += 1
        
        if session["login_attempts"] >= 5:
            flash("Too many attempts. Try again later", "error")
            return redirect(url_for("auth.login"))
        
        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            if session["login_attempts"] >= 3:
                flash("Details incorrect. Forgot password?", "error")
            else:
                flash("Details incorrect", "error")
                
            return redirect(url_for("auth.login"))
        
        session.clear()
        session["user_id"] = user.user_id
        
        return redirect(url_for("main.home"))
    
    return render_template("auth/login.html")

# FORGOT PASSWORD ROUTE
@auth.route("/forgot", methods=["GET", "POST"])
def forgot():
    if request.method == "POST":
        email = request.form.get("email").strip()
        
        otp = str(random.randint(100000, 999999))
        session["reset_otp"] = otp
        session["reset_email"] = email
        session["otp_expiry"] = (datetime.now() + timedelta(minutes=5)).isoformat()
        
        print("RESET OTP:", otp) # change later to email]
        return redirect(url_for("auth.reset_verify"))
    
    return render_template("auth/forgot.html")

# VERIFY OTP
@auth.route("/reset-verify", methods=["GET", "POST"])
def reset_verify():
    if request.method == "POST":
        otp = request.form.get("otp").strip()
        
        if otp == session.get("reset_otp"):
            flash("OTP verified. You may now reset your password.", "success")
            return redirect(url_for("auth.reset_password"))
        
        
        flash("Invalid OTP", "error")
        
    return render_template("auth/reset_verify.html")

# RESET PASSWORD ROUTE
@auth.route("/reset-password", methods=["GET", "POST"])
def reset_password():
    # requires verified OTP
    if not session.get("reset_otp"):
        flash("Please verify the OTP first", "error")
        return redirect(url_for('auth.forgot'))
    
    if request.method == "POST":
        password = request.form.get("password")
        confirm = request.form.get("confirm")
        
        if password != confirm:
            flash("Passwords do not match", "error")
            return redirect(url_for("auth.reset_passwords"))
        
        
        email = session.get('reset_email')
        user = User.query.filter_by(email=email).first()
        if not user:
            flash("Account not found, please try again", "error")
            return redirect(url_for("auth.reset_password"))
        
        user = User.query.filter_by(email=session["reset_email"]).first()
        
        user.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
        db.session.commit()
        
        session.clear()
        flash("Password updated successfully", "success")
        
        return redirect(url_for("auth.login"))
    
    return render_template("auth/reset_password.html")