from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from app.models import User, PasswordHistory
from app import db, bcrypt
import re
import random
from datetime import datetime, timedelta
import requests
from flask_mail import Message
from app import mail


import os


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
            day = request.form.get("dob_day")
            month = request.form.get("dob_month")
            year = request.form.get("dob_year")
            
            
            
            # empty fields
            if not first_name or not last_name or not day or not month or not year:
                flash("Please fill in all required fields", "error")
                return redirect(url_for("auth.signup"))
            
            
            # Name Validation
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
            
            
            # store in session
            session["signup"] = {
                "first_name": first_name,
                "last_name": last_name,
                "dob": f"{year}-{month}-{day}"
                }
            
            session["signup_step"] = 2
            
            return redirect(url_for("auth.signup_step2")) # redirects to step2 page
        
        # STEP 2 
        elif step == "2":
            email = request.form.get("email")
            password = request.form.get("password")
            confirm = request.form.get("confirm_password")
            marketing = request.form.get("marketing_opt_in")
            
            if not email or not password or not confirm:
                flash("Please complete all fields", "error")
                return redirect(url_for("auth.signup_step2"))
            
            
            if User.query.filter_by(email=email).first():
                flash("Email already exists", "error")
                return redirect(url_for("auth.signup_step2"))
            
            
            if not re.match(r"[^@]+@[^@]+\.[^@]", email):
                flash("Invalid email format", "error")
                return redirect(url_for("auth.signup_step2"))
            
            # PASSWORD VALIDATION
            if password != confirm:
                flash("Passwords do not match.", "error")
                return redirect(url_for("auth.signup_step2"))
            
            if len(password) < 8:
                flash("Password must be 8 characters long.", "error")
                return redirect(url_for("auth.signup_step2"))
            
            if not re.search(r"[A-Za-z]", password):
                flash("Password must include a letter.", "error")
                return redirect(url_for("auth.signup_step2"))
            
            if not re.search(r"[0-9]", password):
                flash("Password must contain a number.", "error")
                return redirect(url_for("auth.signup_step2"))
            
            if not re.search(r"[!@#$%^&*()_\-+=\[\]{};:'\",.<>/?\\|`~]", password):
                flash("Password must include a special character.", "error")
                return redirect(url_for("auth.signup_step2"))
            
            # HASH PASSWORD
            hashed = bcrypt.generate_password_hash(password).decode("utf-8")
            
            # STORE IN TEMPORARILY
            session["signup"]["email"] = email
            session["signup"]["password"] = hashed
            session["signup"]["marketing"] = marketing
            
            
            session["signup_step"] = 3
            
            
            recaptcha_response = request.form.get("g-recaptcha-response")
            
            if not recaptcha_response:
                flash("Please complete the captcha", "error")
                return redirect(url_for("auth.signup_step2"))
            
            secret_key = "6LcWEagsAAAAAPSetgK16dwxRhw2ZYL049_d_8WR"
            
            verify = requests.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={
                    "secret": secret_key,
                    "response": recaptcha_response
                }
            )
            
            result = verify.json()
            
            if not result.get("success"):
                flash("Captcha verification failed. Try again", "error")
                return redirect(url_for("auth.signup_step2"))
                
                
            
            # REDIRECT TO STEP 3
            return redirect(url_for("auth.signup_verify"))
        
        # DEFAULT LOAD TO STEP 1
        # CHECKS IF USER IS INTENTIONALLY GOING BACK 
    going_back = request.args.get("back")
    if "signup" in session and not going_back:
        step = session.get("signup_step", 1)
        
        if step == 2:
            return redirect(url_for("auth.signup_step2"))
        
        elif step == 3:
            return redirect(url_for("auth.signup_verify"))
        
    return render_template("auth/signup_step1.html")
    
# ENFORCEMENT BLOCKS TO PREVENT SKIPPING TO NEXT STEP BEFORE COMPLETION
@auth.route("/signup/step-2")
def signup_step2():
    if "signup" not in session:
        return redirect(url_for("auth.signup"))
    
    
    return render_template("auth/signup_step2.html")

# ENFORCEMENT BLOCKS TO PREVENT SKIPPING TO NEXT STEP BEFORE COMPLETION
@auth.route("/signup/verify")
def signup_verify():
    if "signup" not in session:
        return redirect(url_for("auth.signup"))
    
    if session.get("signup_step", 1) < 3:
        return redirect(url_for("auth.signup"))
    
    if not session.get("otp"):
        session["otp_sent"] = False
    
    return render_template("auth/signup_step3.html", otp_sent=session.get("otp_sent", False))

# VERIFY OTP ROUTE - EAMIL VERIFICATION
@auth.route("/verify", methods=["POST"])
def verify():
    if "signup" not in session:
        flash("Session expired. Please sign up again.", "error")
        return redirect(url_for("auth.signup"))
    
    user_otp = request.form.get("otp", "").strip()
    
    if not user_otp or len(user_otp) != 6:
        flash("Please enter the 6-digit code.", "error")
        return redirect(url_for("auth.signup_verify"))
    
    if not session.get("otp_sent"):
        flash("Please request a verification code first.", "error")
        return redirect(url_for("auth.signup_verify"))
    
    otp = session.get("otp")
    
    session["otp_attempts"] = session.get("otp_attempts", 0) + 1
    
    if session["otp_attempts"] > 5:
        session.clear()
        flash("Too many attempts. Try again.", "error")
        return redirect(url_for("auth.signup"))
    
    expiry = session.get("otp_expiry")
    if expiry and datetime.now() > datetime.fromisoformat(expiry):
        session.pop("otp", None)
        session["otp_sent"] = False
        flash("OTP expired. Request a new one.", "error")
        return redirect(url_for("auth.signup_verify"))
    
    if user_otp != otp:
        flash("Invalid verification code. Please try again.", "error")
        return redirect(url_for("auth.signup_verify"))
    
    # SUCCESS
    data = session["signup"]
    
    try:
        user = User(
            full_name=data["first_name"] + " " + data["last_name"],
            email=data["email"],
            password_hash=data["password"],
            date_of_birth=datetime.strptime(data["dob"], "%Y-%m-%d").date(),
            marketing_opt_in=data.get("marketing") == "yes"
        )
        db.session.add(user)
        db.session.commit()
        session.clear()

        flash("Account created successfully! Please log in.", "success")
        return redirect(url_for("auth.login"))
    
    except Exception as e:
        db.session.rollback()
        print("USER CREATION ERROR:", e)
        flash(f"Account creation failed: {str(e)}", "error")
        return redirect(url_for("auth.signup_verify"))
        

# LOGIN ROUTE
@auth.route("/login", methods=["GET", "POST"])
def login():        
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()
        remember = request.form.get("remember") # checkbox
        
        user = User.query.filter_by(email=email).first()
        
        # LOGIN ATTEMPTS
        if "login_attempts" not in session:
            session["login_attempts"] = 0
            
        session["login_attempts"] += 1
        
        # LOCKOUT 
        if session["login_attempts"] >= 5:
            flash("Too many attempts. Try again later", "error")
            return redirect(url_for("auth.login"))
        
        
        # INVALID LOGIN
        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            if session["login_attempts"] >= 3:
                flash("Details incorrect. Forgot password?", "error")
            else:
                flash("Details incorrect", "error")
                
            return redirect(url_for("auth.login"))
        
        # SUCCESS LOGIN 
         
        # CHECK FOR NEXT REDIRECT
        next_page = request.args.get("next") or request.form.get("next")
        
       
        session.clear()
        
    
        
        session["user_id"] = user.user_id
        session["user_name"] = user.full_name
        session["email"] = user.email
        session["role"] = user.role
    
        
        # RESET ATTEMPTS
        if remember:
            session.permanent = True
        else:
            session.permanent = False
            
        flash("Welcome Back!", "success")
        
        if next_page and next_page.startswith("/"):
            return redirect(next_page)
        
        return redirect(url_for("main.dashboard")) # change later to dashboard
        
    
    next_page = request.args.get("next", "")
    return render_template("auth/login.html", next=next_page)

#  FORGOT PASSWORD ROUTE
@auth.route("/forgot", methods=["GET", "POST"])
def forgot():
    if request.method == "POST":
        email = request.form.get("email").strip().lower()
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            flash("This email is not registered with GLH", "error")
            return redirect(url_for("auth.forgot"))
        
        last_sent = session.get("otp_last_sent")
        
        if last_sent:
            if datetime.utcnow() < datetime.fromisoformat(last_sent) + timedelta(seconds=30):
                flash("Please wait before requesting another code", "error")
                return redirect(url_for("auth.forgot"))
            
        session["otp_last_sent"] = datetime.utcnow().isoformat()
        
        otp = str(random.randint(100000, 999999))
        
        session["reset_otp"] = otp
        session["reset_email"] = email
        session["otp_expiry"] = (datetime.now() + timedelta(minutes=5)).isoformat()
        session["otp_attempts"] = 0
        
        print("RESET OTP:", otp) # change later to email
        send_email(
            to=email,
            subject="GLH Password Reset Code",
            template="email/reset_otp.html",
            otp=otp
        )
        return redirect(url_for("auth.reset_verify"))
    
    return render_template("auth/forgot-password.html")

# VERIFY OTP
@auth.route("/reset-verify", methods=["GET", "POST"])
def reset_verify():
    
    if not session.get("reset_email"):
        return redirect(url_for("auth.forgot"))
    
    if request.method == "POST":
        entered_otp = request.form.get("otp").strip()
        
        # EXPIRY CHECK
        expiry = session.get("otp_expiry")
        if expiry and datetime.now() > datetime.fromisoformat(expiry):
            session.clear()
            flash("OTP expired. Please try again.", "error")
            return redirect(url_for("auth.forgot"))
        
        # ATTEMPT LIMIT
        session["otp_attempts"] += 1
        if session["otp_attempts"] >= 5:
            session.clear()
            flash("Too many attempts. Try again.", "error")
            return redirect(url_for("auth.forgot"))
        
        # CORRECT OTP
        if entered_otp == session.get("reset_otp"):
            session["otp_verified"] = True
            flash("OTP verified successfully. You may now reset your password.", "success")
            return redirect(url_for("auth.reset_password"))
        
        flash("Invalid OTP", "error")
        
    return render_template("auth/verify_reset.html")

# RESET PASSWORD ROUTE
@auth.route("/reset-password", methods=["GET", "POST"])

def reset_password():

    if not session.get("otp_verified"):

        flash("Please verify the OTP first", "error")

        return redirect(url_for('auth.forgot'))

    if request.method == "POST":

        password = request.form.get("password")

        confirm = request.form.get("confirm_password")

        # MATCH CHECK

        if password != confirm:

            flash("Passwords do not match.", "error")

            return redirect(url_for("auth.reset_password"))
        
        if len(password) < 8:
            flash("Passwords must be at least 8 characters long.", "error")
            return redirect(url_for("auth.reset_password"))
        
        if not re.search(r"[A-Za-z]", password):
            flash("Passwords must include a letter.", "error")
            return redirect(url_for("auth.reset_password"))
        
        if not re.search(r"[0-9]", password):
            flash("Password must contain a number.","error")
            return redirect(url_for("auth.reset_password"))
        
        if not re.search(r"[!@#$%^&*()_\-+=\[\]{};:'\",.<>/?\\|`~]", password):
            flash("Password must include a special character.", "error")
            return redirect(url_for("auth.reset_password"))

        email = session.get('reset_email')

        user = User.query.filter_by(email=email).first()

        if not user:

            flash("Account not found, please try again", "error")

            return redirect(url_for("auth.forgot"))

        # PREVENT CURRENT PASSWORD REUSE

        if bcrypt.check_password_hash(user.password_hash, password):

            flash("You cannot reuse your current password.", "error")

            return redirect(url_for("auth.reset_password"))

        # CHECK LAST 3 PASSWORDS

        recent_passwords = PasswordHistory.query.filter_by(user_id=user.user_id)\
            .order_by(PasswordHistory.created_at.desc())\
                .limit(3)

        for record in recent_passwords:

            if bcrypt.check_password_hash(record.password_hash, password):

                flash("You cannot reuse recent passwords", "error")

                return redirect(url_for("auth.reset_password"))

        # STORE OLD PASSWORD

        history = PasswordHistory(

            user_id=user.user_id,

            password_hash=user.password_hash

        )

        db.session.add(history)

        # UPDATE PASSWORD

        user.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

        db.session.commit()

        # CLEAN SESSION

        session.pop("reset_otp", None)

        session.pop("otp_verified", None)

        session.pop("reset_email", None)

        session.pop("otp_attempts", None)

        session.pop("otp_expiry", None)

        flash("Password updated successfully. Please login.", "success")

        return redirect(url_for("auth.login"))

    return render_template("auth/reset_password.html")
 

# VERIFY OTP SENDER
@auth.route("/send-otp", methods=["POST"])
def send_otp():
    if "signup" not in session:
        return {"success": False}, 401
    
    otp = str(random.randint(100000, 999999))
    session["otp"] = otp
    session["otp_attempts"] = 0
    session["otp_expiry"] = (datetime.now() + timedelta(minutes=5)).isoformat()
    session["otp_sent"] = True
    session["otp_generator"] = True
    
    email = session["signup"].get("email")
    send_email(
        to=email,
        subject="GLH Verification Code",
        template="email/reset_otp.html",
        otp=otp
    )
    print("SEND OTP ROUTE HIT")
    print("OTP SET", otp)
    return {"success": True}

# SNED FUNCTION 
def send_email(to, subject, template, **kwargs):
    msg = Message(
        subject=subject,
        sender=os.getenv("EMAIL_USER"),
        recipients=[to]
    )
    
    msg.html = render_template(template, **kwargs)
    
    try:
        mail.send(msg)
        print("Email sent successfully")
    except Exception as e:
        print("Email failed:", e) # fix commit
        
@auth.route("/subscribe", methods=['POST'])
def subscribe():
    email = request.form.get('email')
    
    if not email:
        flash("Please enter a valid email.", "error")
        return redirect(request.referrer)
    
    try:
        send_email(
            to=email,
            subject="Welcome to GLH  🎉",
            template="email/newsletter.html"
        )
        
        flash("Your're subscribed! Check your email.", "success")
    except Exception as e:
        print(e)
        flash("Something went wrong. Try again.", "error")
        
    return redirect(request.referrer)    