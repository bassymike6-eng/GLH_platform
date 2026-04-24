from flask import Blueprint, render_template, session, redirect, url_for, flash, request
from app.models import User, Shop, Product, VendorOrder, ContactMessage
from app import db
import os
from werkzeug.utils import secure_filename
from flask_mail import Message
from app import mail


ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

vendor = Blueprint("vendor", __name__, url_prefix="/vendor")


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def vendor_required():
    if "user_id" not in session:
        return redirect(url_for("auth.login") + "?next=/vendor")

    user = User.query.get(session["user_id"])

    # USER NO LONGER EXISTS IN DB - CLEAR SESSION
    if not user:
        session.clear()
        flash("Your session expired. Please log in again", "error")
        return redirect(url_for("auth.login"))

    # USER EXISTS BUT IS NOT APPROVED AS VENDOR
    if not user.is_vendor_approved:
        flash("You need vendor approval to access this area.", "error")
        return redirect(url_for("main.contact"))
    return None


@vendor.route("/")
def dashboard():
    check = vendor_required()
    if check:
        return check
    user = User.query.get(session["user_id"])
    shop = Shop.query.filter_by(user_id=user.user_id).first()
    products = Product.query.filter_by(vendor_id=user.user_id).all() if shop else []
    pending = VendorOrder.query.filter_by(
        vendor_id=user.user_id, status="pending"
    ).all()
    accepted = VendorOrder.query.filter_by(
        vendor_id=user.user_id, status="accepted"
    ).all()
    earnings = sum(o.total for o in accepted)
    return render_template(
        "vendor/dashboard.html",
        shop=shop,
        products=products,
        pending_count=len(pending),
        accepted_count=len(accepted),
        earnings=earnings,
    )


@vendor.route("/setup", methods=["POST"])
def setup_shop():
    check = vendor_required()
    if check:
        return check
    name = request.form.get("shop_name", "").strip()
    desc = request.form.get("shop_description", "").strip()
    if not name:
        flash("Shop name is required.", "error")
        return redirect(url_for("vendor.dashboard"))
    existing = Shop.query.filter_by(user_id=session["user_id"]).first()
    if existing:
        existing.shop_name = name
        existing.shop_description = desc
    else:
        shop = Shop(user_id=session["user_id"], shop_name=name, shop_description=desc)
        db.session.add(shop)
    db.session.commit()
    flash("Shop saved successfully!", "success")
    return redirect(url_for("vendor.dashboard"))


@vendor.route("/products")
def products():
    check = vendor_required()
    if check:
        return check
    user = User.query.get(session["user_id"])
    shop = Shop.query.filter_by(user_id=user.user_id).first()
    if not shop:
        flash("Set up your shop first.", "error")
        return redirect(url_for("vendor.dashboard"))
    products = Product.query.filter_by(vendor_id=user.user_id).all()
    return render_template("vendor/products.html", shop=shop, products=products)


@vendor.route("/products/add", methods=["POST"])
def add_product():
    check = vendor_required()
    if check:
        return check
    user = User.query.get(session["user_id"])
    shop = Shop.query.filter_by(user_id=user.user_id).first()
    if not shop:
        return redirect(url_for("vendor.dashboard"))

    name = request.form.get("name", "").strip()
    description = request.form.get("description", "").strip()
    price = request.form.get("price", "0")
    unit = request.form.get("unit", "kg").strip()
    category = request.form.get("category", "").strip()
    stock = request.form.get("stock", "10")

    if not name or not price:
        flash("Name and price are required.", "error")
        return redirect(url_for("vendor.products"))

    # HANDLE IMAGE UPLOAD
    image_path = "/static/images/placeholder.jpg"
    if "image" in request.files:
        file = request.files["image"]
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            upload_folder = os.path.join("app", "static", "images", "products")
            os.makedirs(upload_folder, exist_ok=True)
            file.save(os.path.join(upload_folder, filename))
            image_path = f"/static/images/products/{filename}"

    product = Product(
        shop_id=shop.id,
        vendor_id=user.user_id,
        name=name,
        description=description,
        price=float(price),
        unit=unit,
        category=category,
        stock=int(stock),
        image=image_path,
    )
    db.session.add(product)
    db.session.commit()
    flash(f"{name} added successfully!", "success")
    return redirect(url_for("vendor.products"))


@vendor.route("/products/delete/<int:product_id>", methods=["POST"])
def delete_product(product_id):
    check = vendor_required()
    if check:
        return check
    product = Product.query.get_or_404(product_id)
    if product.vendor_id != session["user_id"]:
        flash("Unauthorised.", "error")
        return redirect(url_for("vendor.products"))
    db.session.delete(product)
    db.session.commit()
    flash("Product deleted.", "success")
    return redirect(url_for("vendor.products"))


@vendor.route("/products/edit/<int:product_id>", methods=["POST"])
def edit_product(product_id):
    check = vendor_required()
    if check:
        return check
    product = Product.query.get_or_404(product_id)
    if product.vendor_id != session["user_id"]:
        flash("Unauthorised.", "error")
        return redirect(url_for("vendor.products"))

    product.name = request.form.get("name", product.name).strip()
    product.description = request.form.get("description", product.description).strip()
    product.price = float(request.form.get("price", product.price))
    product.unit = request.form.get("unit", product.unit).strip()
    product.category = request.form.get("category", product.category).strip()
    product.stock = int(request.form.get("stock", product.stock))

    if "image" in request.files:
        file = request.files["image"]
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            upload_folder = os.path.join("app", "static", "images", "products")
            os.makedirs(upload_folder, exist_ok=True)
            file.save(os.path.join(upload_folder, filename))
            product.image = f"/static/images/products/{filename}"

    db.session.commit()
    flash("Product updated.", "success")
    return redirect(url_for("vendor.products"))


@vendor.route("/orders")
def orders():
    check = vendor_required()
    if check:
        return check
    user = User.query.get(session["user_id"])
    pending = (
        VendorOrder.query.filter_by(vendor_id=user.user_id, status="pending")
        .order_by(VendorOrder.created_at.desc())
        .all()
    )
    accepted = (
        VendorOrder.query.filter_by(vendor_id=user.user_id, status="accepted")
        .order_by(VendorOrder.created_at.desc())
        .all()
    )
    declined = (
        VendorOrder.query.filter_by(vendor_id=user.user_id, status="declined")
        .order_by(VendorOrder.created_at.desc())
        .all()
    )
    return render_template(
        "vendor/orders.html", pending=pending, accepted=accepted, declined=declined
    )


@vendor.route("/orders/accept/<int:order_id>", methods=["POST"])
def accept_order(order_id):
    check = vendor_required()
    if check:
        return check
    order = VendorOrder.query.get_or_404(order_id)
    if order.vendor_id != session["user_id"]:
        flash("Unauthorised.", "error")
        return redirect(url_for("vendor.orders"))
    order.status = "accepted"
    db.session.commit()
    # SEND EMAIL TO CUSTOMER
    try:
        send_order_email(order, "accepted")
        flash(f"Order #{order.order_ref} accepted. Confirmation email sent.", "success")
    except Exception as e:
        print("EMAIL ERROR:", e)
        flash(f"Order #{order.order_ref} accepted but email failed.", "success")
    return redirect(url_for("vendor.orders"))


@vendor.route("/orders/decline/<int:order_id>", methods=["POST"])
def decline_order(order_id):
    check = vendor_required()
    if check:
        return check
    order = VendorOrder.query.get_or_404(order_id)
    if order.vendor_id != session["user_id"]:
        flash("Unauthorised.", "error")
        return redirect(url_for("vendor.orders"))
    order.status = "declined"
    db.session.commit()
    try:
        send_order_email(order, "declined")
    except Exception as e:
        print("EMAIL ERROR:", e)
    flash(f"Order #{order.order_ref} declined.", "info")
    return redirect(url_for("vendor.orders"))


def send_order_email(order, status):

    subject = f"Your GLH Order #{order.order_ref} has been {'Confirmed' if status == 'accepted' else 'Declined'}"
    msg = Message(
        subject=subject,
        sender=os.getenv("EMAIL_USER"),
        recipients=[order.customer_email],
    )
    msg.html = render_template(
        "email/order_confirmation.html", order=order, status=status
    )
    mail.send(msg)


@vendor.route("/notifications")
def notifications():
    check = vendor_required()
    if check:
        return check

    user = User.query.get(session["user_id"])
    # Get vendor application messages sent to this vendor's email
    notifs = (
        ContactMessage.query.filter_by(user_id=user.user_id)
        .order_by(ContactMessage.created_at.desc())
        .all()
    )
    
    return render_template("vendor/notifications.html", notifs=notifs)


@vendor.route("/settings", methods=["GET", "POST"])
def settings():
    check = vendor_required()
    if check:
        return check
    user = User.query.get(session["user_id"])
    shop = Shop.query.filter_by(user_id=user.user_id).first()
    if request.method == "POST":
        action = request.form.get("action")
        if action == "shop" and shop:
            shop.shop_name = request.form.get("shop_name", shop.shop_name).strip()
            shop.shop_description = request.form.get(
                "shop_description", shop.shop_description
            ).strip()
            db.session.commit()
            flash("Shop details updated.", "success")
        elif action == "account":
            first = request.form.get("first_name", "").strip()
            last = request.form.get("last_name", "").strip()
            email = request.form.get("email", "").strip()
            if first and last:
                user.full_name = f"{first} {last}"
                session["user_name"] = user.full_name
            if email:
                user.email = email
                session["email"] = email
            db.session.commit()
            flash("Account details updated.", "success")
        return redirect(url_for("vendor.settings"))
    return render_template("vendor/settings.html", shop=shop, user=user)
