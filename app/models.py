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
    
    role = db.Column(db.String(20), default="customer") #customer/vendor/admin
    is_vendor_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships 
    products = db.relationship("Product", backref="vendor", lazy=True)
    orders = db.relationship("Order", backref="customer", lazy=True)
    
# Product Model
class Product(db.Model):
    __tablename__ = "products"
    
    product_id = db.Column(db.Integer, primary_key=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    
    stock = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(260))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
# Order Model
class Order(db.Model):
    __tablename__ = "orders"
    
    order_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="pending")
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    #Relationships
    items = db.relationship("OrderItem", backref="order", lazy=True)
    
# Order Item
class OrderItem(db.Model):
    __tablename__ = "order_items"
    
    item_id = db.Column(db.Integer, primary_key=True)
    
    order_id = db.Column(db.Integer, db.ForeignKey("orders.order_id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.product_id"), nullable=False)
    
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    
# Revivew model 
class Review(db.Model):
    __tablename__ = "reviews"
    
    review_id = db.Column(db.Integer, primary_key=True)
    
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    product_id = db.Column(db.Integer, db.ForeignKey("products.product_id"))
    
    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)