from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="BELLPOINT API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

# User Models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    phone: Optional[str] = None
    role: str = "customer"  # customer, admin
    addresses: List[dict] = []
    created_at: datetime

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

# Category Models
class Category(BaseModel):
    category_id: str = Field(default_factory=lambda: f"cat_{uuid.uuid4().hex[:12]}")
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[str] = None

# Product Models
class Product(BaseModel):
    product_id: str = Field(default_factory=lambda: f"prod_{uuid.uuid4().hex[:12]}")
    name: str
    description: str
    price: float
    category_id: str
    images: List[str] = []
    stock: int = 0
    code: Optional[str] = None
    featured: bool = False
    available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category_id: str
    images: List[str] = []
    stock: int = 0
    code: Optional[str] = None
    featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    code: Optional[str] = None
    featured: Optional[bool] = None
    available: Optional[bool] = None

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int
    price: float
    name: str
    image: Optional[str] = None

class Cart(BaseModel):
    cart_id: str = Field(default_factory=lambda: f"cart_{uuid.uuid4().hex[:12]}")
    user_id: str
    items: List[CartItem] = []
    subtotal: float = 0.0
    itbis: float = 0.0  # 18% tax in Dominican Republic
    total: float = 0.0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1

# Order Models
class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: Optional[str] = None

class Order(BaseModel):
    order_id: str = Field(default_factory=lambda: f"ord_{uuid.uuid4().hex[:12]}")
    user_id: str
    items: List[OrderItem]
    subtotal: float
    itbis: float
    total: float
    status: str = "pending"  # pending, processing, shipped, delivered, cancelled
    shipping_address: dict
    payment_method: str = "card"  # card, transfer, cash
    payment_status: str = "pending"  # pending, paid, failed
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreateOrderRequest(BaseModel):
    shipping_address: dict
    payment_method: str = "card"
    notes: Optional[str] = None

# Quote Models
class QuoteItem(BaseModel):
    product_id: str
    name: str
    quantity: int
    image: Optional[str] = None

class Quote(BaseModel):
    quote_id: str = Field(default_factory=lambda: f"quote_{uuid.uuid4().hex[:12]}")
    user_id: str
    user_name: str
    user_email: str
    user_phone: Optional[str] = None
    items: List[QuoteItem]
    observations: Optional[str] = None
    status: str = "pending"  # pending, responded, closed
    response: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    responded_at: Optional[datetime] = None

class CreateQuoteRequest(BaseModel):
    items: List[dict]
    observations: Optional[str] = None
    phone: Optional[str] = None

# Address Model
class AddressCreate(BaseModel):
    name: str
    street: str
    city: str
    province: str
    postal_code: Optional[str] = None
    phone: str
    is_default: bool = False

# ==================== AUTH HELPERS ====================

async def get_session_from_request(request: Request) -> Optional[dict]:
    """Extract and validate session from cookie or header"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        return None
    
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        return None
    
    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at <= datetime.now(timezone.utc):
        return None
    
    return session

async def get_current_user(request: Request) -> Optional[User]:
    """Get current authenticated user"""
    session = await get_session_from_request(request)
    if not session:
        return None
    
    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if user_doc:
        return User(**user_doc)
    return None

async def require_auth(request: Request) -> User:
    """Require authenticated user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> User:
    """Require admin user"""
    user = await require_auth(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    try:
        session_id = request.headers.get("X-Session-ID")
        if not session_id:
            body = await request.json()
            session_id = body.get("session_id")
        
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id required")
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            user_data = resp.json()
        
        session_data = SessionDataResponse(**user_data)
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": session_data.email}, {"_id": 0})
        
        if existing_user:
            user_id = existing_user["user_id"]
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            new_user = {
                "user_id": user_id,
                "email": session_data.email,
                "name": session_data.name,
                "picture": session_data.picture,
                "role": "customer",
                "addresses": [],
                "created_at": datetime.now(timezone.utc)
            }
            await db.users.insert_one(new_user)
        
        # Create session
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        session_doc = {
            "user_id": user_id,
            "session_token": session_data.session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.user_sessions.delete_many({"user_id": user_id})
        await db.user_sessions.insert_one(session_doc)
        
        response.set_cookie(
            key="session_token",
            value=session_data.session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60
        )
        
        user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        
        return {
            "session_token": session_data.session_token,
            "user": user_doc
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session exchange error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session = await get_session_from_request(request)
    if session:
        await db.user_sessions.delete_one({"session_token": session["session_token"]})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ==================== USER ENDPOINTS ====================

@api_router.put("/users/profile")
async def update_profile(request: Request, phone: Optional[str] = None):
    """Update user profile"""
    user = await require_auth(request)
    update_data = {}
    if phone:
        update_data["phone"] = phone
    
    if update_data:
        await db.users.update_one({"user_id": user.user_id}, {"$set": update_data})
    
    updated = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return updated

@api_router.post("/users/addresses")
async def add_address(request: Request, address: AddressCreate):
    """Add shipping address"""
    user = await require_auth(request)
    
    address_dict = address.model_dump()
    address_dict["address_id"] = f"addr_{uuid.uuid4().hex[:8]}"
    
    if address.is_default:
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": {"addresses.$[].is_default": False}}
        )
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$push": {"addresses": address_dict}}
    )
    
    updated = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return updated

@api_router.delete("/users/addresses/{address_id}")
async def delete_address(request: Request, address_id: str):
    """Delete shipping address"""
    user = await require_auth(request)
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$pull": {"addresses": {"address_id": address_id}}}
    )
    
    updated = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return updated

# ==================== CATEGORY ENDPOINTS ====================

@api_router.get("/categories")
async def get_categories():
    """Get all categories"""
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    return categories

@api_router.post("/categories")
async def create_category(category: CategoryCreate, request: Request):
    """Create category (admin only)"""
    await require_admin(request)
    
    cat_obj = Category(**category.model_dump())
    await db.categories.insert_one(cat_obj.model_dump())
    return cat_obj.model_dump()

@api_router.put("/categories/{category_id}")
async def update_category(category_id: str, category: CategoryCreate, request: Request):
    """Update category (admin only)"""
    await require_admin(request)
    
    await db.categories.update_one(
        {"category_id": category_id},
        {"$set": category.model_dump()}
    )
    
    updated = await db.categories.find_one({"category_id": category_id}, {"_id": 0})
    return updated

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, request: Request):
    """Delete category (admin only)"""
    await require_admin(request)
    
    await db.categories.delete_one({"category_id": category_id})
    return {"message": "Category deleted"}

# ==================== PRODUCT ENDPOINTS ====================

@api_router.get("/products")
async def get_products(
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 50,
    skip: int = 0
):
    """Get products with filters"""
    query = {"available": True}
    
    if category_id:
        query["category_id"] = category_id
    if featured is not None:
        query["featured"] = featured
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        query.setdefault("price", {})["$lte"] = max_price
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"code": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents(query)
    
    return {"products": products, "total": total}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get single product"""
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products")
async def create_product(product: ProductCreate, request: Request):
    """Create product (admin only)"""
    await require_admin(request)
    
    prod_obj = Product(**product.model_dump())
    await db.products.insert_one(prod_obj.model_dump())
    return prod_obj.model_dump()

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductUpdate, request: Request):
    """Update product (admin only)"""
    await require_admin(request)
    
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    
    if update_data:
        await db.products.update_one(
            {"product_id": product_id},
            {"$set": update_data}
        )
    
    updated = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, request: Request):
    """Delete product (admin only)"""
    await require_admin(request)
    
    await db.products.delete_one({"product_id": product_id})
    return {"message": "Product deleted"}

# ==================== CART ENDPOINTS ====================

@api_router.get("/cart")
async def get_cart(request: Request):
    """Get user's cart"""
    user = await require_auth(request)
    
    cart = await db.carts.find_one({"user_id": user.user_id}, {"_id": 0})
    if not cart:
        cart = Cart(user_id=user.user_id).model_dump()
        await db.carts.insert_one(cart)
    
    return cart

@api_router.post("/cart/add")
async def add_to_cart(request: Request, item: AddToCartRequest):
    """Add item to cart"""
    user = await require_auth(request)
    
    product = await db.products.find_one({"product_id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    cart = await db.carts.find_one({"user_id": user.user_id}, {"_id": 0})
    
    if not cart:
        cart = Cart(user_id=user.user_id).model_dump()
    
    items = cart.get("items", [])
    
    existing_item = next((i for i in items if i["product_id"] == item.product_id), None)
    
    if existing_item:
        existing_item["quantity"] += item.quantity
    else:
        cart_item = CartItem(
            product_id=product["product_id"],
            quantity=item.quantity,
            price=product["price"],
            name=product["name"],
            image=product["images"][0] if product.get("images") else None
        )
        items.append(cart_item.model_dump())
    
    subtotal = sum(i["price"] * i["quantity"] for i in items)
    itbis = subtotal * 0.18
    total = subtotal + itbis
    
    cart.update({
        "items": items,
        "subtotal": round(subtotal, 2),
        "itbis": round(itbis, 2),
        "total": round(total, 2),
        "updated_at": datetime.now(timezone.utc)
    })
    
    await db.carts.update_one(
        {"user_id": user.user_id},
        {"$set": cart},
        upsert=True
    )
    
    return cart

@api_router.put("/cart/update")
async def update_cart_item(request: Request, product_id: str, quantity: int):
    """Update cart item quantity"""
    user = await require_auth(request)
    
    cart = await db.carts.find_one({"user_id": user.user_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get("items", [])
    
    if quantity <= 0:
        items = [i for i in items if i["product_id"] != product_id]
    else:
        for item in items:
            if item["product_id"] == product_id:
                item["quantity"] = quantity
                break
    
    subtotal = sum(i["price"] * i["quantity"] for i in items)
    itbis = subtotal * 0.18
    total = subtotal + itbis
    
    cart.update({
        "items": items,
        "subtotal": round(subtotal, 2),
        "itbis": round(itbis, 2),
        "total": round(total, 2),
        "updated_at": datetime.now(timezone.utc)
    })
    
    await db.carts.update_one(
        {"user_id": user.user_id},
        {"$set": cart}
    )
    
    return cart

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(request: Request, product_id: str):
    """Remove item from cart"""
    return await update_cart_item(request, product_id, 0)

@api_router.delete("/cart/clear")
async def clear_cart(request: Request):
    """Clear cart"""
    user = await require_auth(request)
    
    cart = Cart(user_id=user.user_id).model_dump()
    
    await db.carts.update_one(
        {"user_id": user.user_id},
        {"$set": cart},
        upsert=True
    )
    
    return cart

# ==================== ORDER ENDPOINTS ====================

@api_router.post("/orders")
async def create_order(request: Request, order_request: CreateOrderRequest):
    """Create order from cart"""
    user = await require_auth(request)
    
    cart = await db.carts.find_one({"user_id": user.user_id}, {"_id": 0})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    order_items = [
        OrderItem(
            product_id=item["product_id"],
            name=item["name"],
            price=item["price"],
            quantity=item["quantity"],
            image=item.get("image")
        ).model_dump()
        for item in cart["items"]
    ]
    
    order = Order(
        user_id=user.user_id,
        items=order_items,
        subtotal=cart["subtotal"],
        itbis=cart["itbis"],
        total=cart["total"],
        shipping_address=order_request.shipping_address,
        payment_method=order_request.payment_method,
        notes=order_request.notes,
        payment_status="paid" if order_request.payment_method == "card" else "pending"
    )
    
    await db.orders.insert_one(order.model_dump())
    
    # Clear cart
    await db.carts.update_one(
        {"user_id": user.user_id},
        {"$set": Cart(user_id=user.user_id).model_dump()}
    )
    
    return order.model_dump()

@api_router.get("/orders")
async def get_orders(request: Request):
    """Get user's orders"""
    user = await require_auth(request)
    
    orders = await db.orders.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(request: Request, order_id: str):
    """Get single order"""
    user = await require_auth(request)
    
    order = await db.orders.find_one(
        {"order_id": order_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

# ==================== QUOTE ENDPOINTS ====================

@api_router.post("/quotes")
async def create_quote(request: Request, quote_request: CreateQuoteRequest):
    """Create quote request"""
    user = await require_auth(request)
    
    quote_items = []
    for item in quote_request.items:
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if product:
            quote_items.append(QuoteItem(
                product_id=product["product_id"],
                name=product["name"],
                quantity=item.get("quantity", 1),
                image=product["images"][0] if product.get("images") else None
            ).model_dump())
    
    quote = Quote(
        user_id=user.user_id,
        user_name=user.name,
        user_email=user.email,
        user_phone=quote_request.phone or user.phone,
        items=quote_items,
        observations=quote_request.observations
    )
    
    await db.quotes.insert_one(quote.model_dump())
    
    return quote.model_dump()

@api_router.get("/quotes")
async def get_quotes(request: Request):
    """Get user's quotes"""
    user = await require_auth(request)
    
    quotes = await db.quotes.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    return quotes

# ==================== ADMIN ENDPOINTS ====================

@api_router.get("/admin/orders")
async def admin_get_orders(request: Request, status: Optional[str] = None):
    """Get all orders (admin only)"""
    await require_admin(request)
    
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def admin_update_order_status(request: Request, order_id: str, status: str):
    """Update order status (admin only)"""
    await require_admin(request)
    
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    return order

@api_router.get("/admin/quotes")
async def admin_get_quotes(request: Request, status: Optional[str] = None):
    """Get all quotes (admin only)"""
    await require_admin(request)
    
    query = {}
    if status:
        query["status"] = status
    
    quotes = await db.quotes.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return quotes

@api_router.put("/admin/quotes/{quote_id}/respond")
async def admin_respond_quote(request: Request, quote_id: str, response: str):
    """Respond to quote (admin only)"""
    await require_admin(request)
    
    await db.quotes.update_one(
        {"quote_id": quote_id},
        {
            "$set": {
                "status": "responded",
                "response": response,
                "responded_at": datetime.now(timezone.utc)
            }
        }
    )
    
    quote = await db.quotes.find_one({"quote_id": quote_id}, {"_id": 0})
    return quote

@api_router.get("/admin/users")
async def admin_get_users(request: Request):
    """Get all users (admin only)"""
    await require_admin(request)
    
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/role")
async def admin_update_user_role(request: Request, user_id: str, role: str):
    """Update user role (admin only)"""
    await require_admin(request)
    
    if role not in ["customer", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"role": role}}
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user

@api_router.get("/admin/stats")
async def admin_get_stats(request: Request):
    """Get dashboard stats (admin only)"""
    await require_admin(request)
    
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    total_quotes = await db.quotes.count_documents({})
    pending_quotes = await db.quotes.count_documents({"status": "pending"})
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({})
    
    # Calculate total sales
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    sales_result = await db.orders.aggregate(pipeline).to_list(1)
    total_sales = sales_result[0]["total"] if sales_result else 0
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_quotes": total_quotes,
        "pending_quotes": pending_quotes,
        "total_users": total_users,
        "total_products": total_products,
        "total_sales": round(total_sales, 2)
    }

@api_router.get("/admin/products")
async def admin_get_all_products(request: Request):
    """Get all products including unavailable (admin only)"""
    await require_admin(request)
    
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    return products

# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "BELLPOINT API"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
