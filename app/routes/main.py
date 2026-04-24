from flask import Blueprint, session, redirect, url_for, render_template, request, flash
from app.models import User, ContactMessage, Product
from app import db

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return render_template("public/home.html")


@main.route("/test-db")
def test_db():
    user = User(
        full_name="Test User",
        email="testing@test.com",
        password_hash="123",
        date_of_birth="12/03/2026",
    )
    db.session.add(user)
    db.session.commit()
    return "User added!"


@main.route("/location")
def location():
    return render_template("public/location.html")


@main.route("/privacy")
def privacy():
    return render_template("public/privacy.html")


@main.route("/about")
def about():
    return render_template("public/about.html")


@main.route("/contact")
def contact():
    return render_template("public/contact.html")


@main.route("/contact/submit", methods=["POST"])
def contact_submit():
    form_type = request.form.get("form_type")
    full_name = request.form.get("full_name") or session.get("full_name", "")
    email = request.form.get("email") or session.get("email", "")
    message = request.form.get("message", "")

    if form_type == "vendor":
        msg = ContactMessage(
            form_type="vendor",
            full_name=full_name,
            email=email,
            message=message,
            business_name=request.form.get("business_name", ""),
            product_type=request.form.get("product_type", ""),
            user_id=session.get("user_id"),
            status="pending",
            is_read=False,
        )

        db.session.add(msg)
        db.session.commit()
        flash(
            f"Application recieved! We'll review and email {email} within 5 working days.",
            "success",
        )

    else:
        msg = ContactMessage(
            form_type="general",
            full_name=full_name,
            email=email,
            message=message,
            subject=request.form.get("subject", ""),
            user_id=session.get("user_id"),
            is_read=False,
        )

        db.session.add(msg)
        db.session.commit()
        flash("Message sent! We'll get back to you within 24 hours.", "success")

    return redirect(url_for("main.contact"))


@main.route("/delivery")
def delivery():
    return render_template("public/delivery.html")


@main.route("/faqs")
def faqs():
    return render_template("public/faqs.html")


@main.route("/terms")
def terms():
    return render_template("public/terms.html")


@main.route("/returns")
def returns():
    return render_template("public/returns.html")


@main.route("/shop")
def shop():
    products = Product.query.all()

    popular_products = Product.query.filter_by(is_popular=True).limit(4).all()

    return render_template(
        "public/shop.html", popular_products=popular_products, products=products
    )


@main.route("/set-language/<lang>")
def set_language(lang):
    if lang in ["en", "fr", "es"]:
        session["lang"] = lang
    return "", 204


@main.route("/logout")
def logout():
    if "user_id" not in session:
        flash("You are already logged out.", "info")
        return redirect(url_for("main.home"))
    session.clear()
    flash("You have been logged out.", "success")
    return redirect(url_for("main.home"))


@main.route("/user/update", methods=["POST"])
def user_update():
    if "user_id" not in session:
        return redirect(url_for("auth.login"))
    user = User.query.get(session["user_id"])
   
    if not user:
        session.clear()
        flash("Your session expired. Please log in again", "error")
        return redirect(url_for("auth.login"))
    
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
    flash("Settings updated.", "success")
    return redirect(request.referrer or url_for("main.home"))


@main.route("/user/delete")
def user_delete():
    if "user_id" not in session:
        return redirect(url_for("main.home"))
    from app.models import User

    user = User.query.get(session["user_id"])
    if user:
        db.session.delete(user)
        db.session.commit()
    session.clear()
    flash("Your account has been deleted.", "info")
    return redirect(url_for("main.home"))


@main.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    user = User.query.get(session["user_id"])
    if not user:
        session.clear()
        flash("Your session exipred. Please log in again.", "error")
        return redirect(url_for("auth.login"))

    return render_template("user/dashboard.html")


@main.route("/dashboard/orders")
def dashboard_orders():
    if "user_id" not in session:
        return redirect(url_for("auth.login"))
    user = User.query.get(session["user_id"])

    if not user:
        session.clear()
        flash("Your session expired. Please log in again", "error")
        return redirect(url_for("auth.login"))
    return render_template("user/orders.html")


@main.route("/dashboard/addresses")
def dashboard_addresses():
    if "user_id" not in session:
        return redirect(url_for("auth.login"))
    user = User.query.get(session["user_id"])

    if not user:
        session.clear()
        flash("Your session expired. Please log in again", "error")
        return redirect(url_for("auth.login"))

    return render_template("user/addresses.html")


@main.route("/checkout")
def checkout():
    if "user_id" not in session:
        return redirect(url_for("auth.login") + "?next=/checkout")
    
    user = User.query.get(session["user_id"])

    if not user:
        session.clear()
        flash("Your session expired. Please log in again", "error")
        return redirect(url_for("auth.login"))

    return render_template("user/checkout.html")


@main.route("/order-success")
def order_success():
    if "user_id" not in session:
        return redirect(url_for("auth.login"))
    
    user = User.query.get(session["user_id"])

    if not user:
        session.clear()
        flash("Your session expired. Please log in again", "error")
        return redirect(url_for("auth.login"))
    return render_template("user/order_success.html")


@main.route("/order/save", methods=["POST"])
def save_order():
    if "user_id" not in session:
        return {"success": False}, 401
    from app.models import VendorOrder, Product, Shop
    import json

    data = request.get_json()
    if not data:
        return {"success": False}, 400

    items = data.get("items", [])
    ref = data.get("ref", "GLH000")
    total = float(data.get("total", 0))

    # Group items by vendor
    vendor_items = {}
    for item in items:
        # Try exact name match first
        product = Product.query.filter(Product.name.ilike(item.get("name", ""))).first()

        if not product:
            # Try partial match
            product = Product.query.filter(
                Product.name.ilike(f"%{item.get('name', '')}%")
            ).first()

        if product:
            vid = product.vendor_id
            if vid not in vendor_items:
                vendor_items[vid] = []
            vendor_items[vid].append(item)
        else:
            # No product match — assign to first vendor as fallback
            first_vendor = Shop.query.first()
            if first_vendor:
                vid = first_vendor.user_id
                if vid not in vendor_items:
                    vendor_items[vid] = []
                vendor_items[vid].append(item)

    # Create one VendorOrder per vendor
    for vendor_id, vitems in vendor_items.items():
        order = VendorOrder(
            vendor_id=vendor_id,
            customer_id=session["user_id"],
            customer_email=session.get("email", ""),
            customer_name=session.get("user_name", ""),
            order_ref=ref,
            items_json=json.dumps(vitems),
            total=total,
            status="pending",
        )
        db.session.add(order)

    try:
        db.session.commit()
        return {"success": True}
    except Exception as e:
        db.session.rollback()
        print("ORDER SAVE ERROR:", e)
        return {"success": False}, 500
