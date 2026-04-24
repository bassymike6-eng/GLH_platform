from flask import Blueprint, render_template, session, redirect, url_for, flash, request
from app.models import User, ContactMessage, Shop, Product, VendorOrder
from app import db, mail
from flask_mail import Message
import os

admin = Blueprint("admin", __name__, url_prefix="/admin")

def admin_required():
    if "user_id" not in session:
        return redirect(url_for("auth.login") + "?next=/admin")
    user = User.query.get(session["user_id"])
    if not user:
        session.clear()
        return redirect(url_for("auth.login"))
    if user.role != "admin":
        flash("Admin access only.", "error")
        return redirect(url_for("main.home"))
    return None

@admin.route("/")
def dashboard():
    check = admin_required()
    if check: return check
    total_users = User.query.count()
    total_vendors = User.query.filter_by(is_vendor_approved=True).count()
    total_products = Product.query.count()
    pending_apps = ContactMessage.query.filter_by(
        form_type="vendor", status="pending"
    ).count()
    unread = ContactMessage.query.filter_by(is_read=False).count()
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
    return render_template("admin/dashboard.html",
                           total_users=total_users,
                           total_vendors=total_vendors,
                           total_products=total_products,
                           pending_apps=pending_apps,
                           unread=unread,
                           recent_users=recent_users)

@admin.route("/users")
def users():
    check = admin_required()
    if check: return check
    all_users = User.query.order_by(User.created_at.desc()).all()
    return render_template("admin/users.html", users=all_users)

@admin.route("/users/delete/<int:user_id>", methods=["POST"])
def delete_user(user_id):
    check = admin_required()
    if check: return check
    user = User.query.get_or_404(user_id)
    if user.user_id == session["user_id"]:
        flash("Cannot delete your own account.", "error")
        return redirect(url_for("admin.users"))
    db.session.delete(user)
    db.session.commit()
    flash(f"User {user.email} deleted.", "success")
    return redirect(url_for("admin.users"))

@admin.route("/users/toggle-vendor/<int:user_id>", methods=["POST"])
def toggle_vendor(user_id):
    check = admin_required()
    if check: return check
    user = User.query.get_or_404(user_id)
    user.is_vendor_approved = not user.is_vendor_approved
    if user.is_vendor_approved:
        user.role = "vendor"
    else:
        user.role = "customer"
    db.session.commit()
    status = "approved as vendor" if user.is_vendor_approved else "revoked vendor access"
    flash(f"{user.email} {status}.", "success")
    return redirect(url_for("admin.users"))

@admin.route("/messages")
def messages():
    check = admin_required()
    if check: return check
    general = ContactMessage.query.filter_by(
        form_type="general"
    ).order_by(ContactMessage.created_at.desc()).all()
    vendor_apps = ContactMessage.query.filter_by(
        form_type="vendor"
    ).order_by(ContactMessage.created_at.desc()).all()
    # Mark all as read
    ContactMessage.query.filter_by(is_read=False).update({"is_read": True})
    db.session.commit()
    return render_template("admin/messages.html",
                           general=general,
                           vendor_apps=vendor_apps)

@admin.route("/messages/accept/<int:msg_id>", methods=["POST"])
def accept_application(msg_id):
    check = admin_required()
    if check: return check
    msg = ContactMessage.query.get_or_404(msg_id)
    msg.status = "accepted"
    # Upgrade user account
    if msg.user_id:
        user = User.query.get(msg.user_id)
        if user:
            user.is_vendor_approved = True
            user.role = "vendor"
    db.session.commit()
    # Send acceptance email
    try:
        email_msg = Message(
            subject="Your GLH Vendor Application has been Approved!",
            sender=os.getenv("EMAIL_USER"),
            recipients=[msg.email]
        )
        email_msg.html = render_template("email/vendor_accepted.html", msg=msg)
        mail.send(email_msg)
    except Exception as e:
        print("EMAIL ERROR:", e)
    flash(f"Application from {msg.email} accepted. Account upgraded to vendor.", "success")
    return redirect(url_for("admin.messages"))

@admin.route("/messages/decline/<int:msg_id>", methods=["POST"])
def decline_application(msg_id):
    check = admin_required()
    if check: return check
    msg = ContactMessage.query.get_or_404(msg_id)
    msg.status = "declined"
    db.session.commit()
    try:
        email_msg = Message(
            subject="Update on your GLH Vendor Application",
            sender=os.getenv("EMAIL_USER"),
            recipients=[msg.email]
        )
        email_msg.html = render_template("email/vendor_declined.html", msg=msg)
        mail.send(email_msg)
    except Exception as e:
        print("EMAIL ERROR:", e)
    flash(f"Application from {msg.email} declined.", "info")
    return redirect(url_for("admin.messages"))
