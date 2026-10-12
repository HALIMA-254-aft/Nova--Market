from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///nova_market.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
CORS(app)


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    price = db.Column(db.Float, nullable=False)
    old_price = db.Column(db.Float)
    rating = db.Column(db.Float, default=0)
    reviews = db.Column(db.Integer, default=0)
    image = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "price": self.price,
            "oldPrice": self.old_price,
            "rating": self.rating,
            "reviews": self.reviews,
            "image": self.image,
            "description": self.description
        }


@app.route("/")
def home():
    return jsonify({
        "message": "NOVA Market API is running"
    })


@app.route("/api/products")
def get_products():
    products = Product.query.all()

    return jsonify([
        product.to_dict()
        for product in products
    ])


@app.route("/api/products/<int:product_id>")
def get_product(product_id):
    product = Product.query.get_or_404(product_id)

    return jsonify(product.to_dict())


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True, port=5000)