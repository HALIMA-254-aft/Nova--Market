from app import app, db, Product


products = [
    {
        "name": "Wireless Headphones",
        "category": "Electronics",
        "price": 79.99,
        "old_price": 99.99,
        "rating": 4.8,
        "reviews": 124,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        "description": "Premium wireless headphones with immersive sound and comfortable all-day wear."
    },
    {
        "name": "Smart Watch",
        "category": "Electronics",
        "price": 129.99,
        "old_price": 159.99,
        "rating": 4.7,
        "reviews": 89,
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        "description": "A modern smartwatch for tracking activity, notifications and everyday fitness."
    },
    {
        "name": "Minimal Backpack",
        "category": "Fashion",
        "price": 54.99,
        "old_price": 69.99,
        "rating": 4.6,
        "reviews": 76,
        "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        "description": "A lightweight minimalist backpack designed for work, travel and everyday use."
    },
    {
        "name": "Running Shoes",
        "category": "Sports",
        "price": 89.99,
        "old_price": 119.99,
        "rating": 4.9,
        "reviews": 156,
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
        "description": "Comfortable performance running shoes with responsive cushioning."
    },
    {
        "name": "Portable Speaker",
        "category": "Electronics",
        "price": 49.99,
        "old_price": 64.99,
        "rating": 4.5,
        "reviews": 63,
        "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80",
        "description": "Compact portable speaker with clear audio for indoor and outdoor listening."
    },
    {
        "name": "Smart Lamp",
        "category": "Home",
        "price": 39.99,
        "old_price": 49.99,
        "rating": 4.4,
        "reviews": 51,
        "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
        "description": "A stylish smart lamp that adds practical lighting to modern spaces."
    },
    {
        "name": "Premium Hoodie",
        "category": "Fashion",
        "price": 59.99,
        "old_price": 79.99,
        "rating": 4.7,
        "reviews": 98,
        "image": "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80",
        "description": "Soft premium hoodie with a clean everyday design."
    },
    {
        "name": "Skincare Set",
        "category": "Beauty",
        "price": 44.99,
        "old_price": 59.99,
        "rating": 4.8,
        "reviews": 112,
        "image": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80",
        "description": "A carefully selected skincare set for a simple everyday routine."
    }
]


with app.app_context():
    db.drop_all()
    db.create_all()

    for product_data in products:
        product = Product(**product_data)
        db.session.add(product)

    db.session.commit()

    print("NOVA Market database seeded successfully.")
    print(f"Added {len(products)} products.")