from datetime import datetime
from app import db


# User Model
class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)

    role = db.Column(db.String(20), default="customer")  # customer/vendor/admin
    is_vendor_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    marketing_opt_in = db.Column(db.Boolean, default=False)

    # Relationships
    products = db.relationship("Product", backref="vendor", lazy=True)
    orders = db.relationship("Order", backref="customer", lazy=True)





# Order Model
class Order(db.Model):
    __tablename__ = "orders"

    order_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)

    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="pending")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    items = db.relationship("OrderItem", backref="order", lazy=True)


# Order Item
class OrderItem(db.Model):
    __tablename__ = "order_items"

    item_id = db.Column(db.Integer, primary_key=True)

    order_id = db.Column(db.Integer, db.ForeignKey("orders.order_id"), nullable=False)
    product_id = db.Column(
        db.Integer, db.ForeignKey("products.id"), nullable=False
    )

    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)


# Revivew model
class Review(db.Model):
    __tablename__ = "reviews"

    review_id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"))

    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# PASSWORD HISTORY MODEL
class PasswordHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer)

    password_hash = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ContactMessage(db.Model):
    __tablename__ = "contact_messages"

    id = db.Column(db.Integer, primary_key=True)  # general or vendor

    form_type = db.Column(db.String(20), nullable=False)

    full_name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(120), nullable=False)

    message = db.Column(db.Text, nullable=False)

    subject = db.Column(db.String(100))  # general only

    business_name = db.Column(db.String(100))  # vendor only

    product_type = db.Column(db.String(50))  # vendor only

    location = db.Column(db.String(100))  # vendor only

    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=True)

    status = db.Column(
        db.String(20), default="pending"
    )  # pending / accepted / declined

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    is_read = db.Column(db.Boolean, default=False)


class Shop(db.Model):
    __tablename__ = "shops"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    shop_name = db.Column(db.String(100), nullable=False)
    shop_description = db.Column(db.Text)
    shop_banner = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey("shops.id"), nullable=False)
    vendor_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), default="kg")
    category = db.Column(db.String(50))
    stock = db.Column(db.Integer, default=10)
    image = db.Column(db.String(200))
    is_popular = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    shop = db.relationship("Shop", backref="products", foreign_keys=[shop_id], lazy=True)


class VendorOrder(db.Model):
    __tablename__ = "vendor_orders"
    id = db.Column(db.Integer, primary_key=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    customer_email = db.Column(db.String(120))
    customer_name = db.Column(db.String(100))
    order_ref = db.Column(db.String(20), nullable=False)
    items_json = db.Column(db.Text)
    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending/accepted/declined
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
