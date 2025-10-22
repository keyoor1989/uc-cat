from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import requests
from io import BytesIO

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Define Models
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category_id: str
    images: List[str] = []  # URLs or base64
    youtube_link: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category_id: str
    images: List[str] = []
    youtube_link: Optional[str] = None

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "settings"
    whatsapp_number: str = ""
    company_logo: str = ""  # base64 or URL

class SettingsUpdate(BaseModel):
    whatsapp_number: Optional[str] = None
    company_logo: Optional[str] = None

class PDFRequest(BaseModel):
    product_ids: List[str]

# Helper Functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@api_router.post("/admin/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin):
    admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    if credentials.username == admin_username and credentials.password == admin_password:
        access_token = create_access_token({"sub": credentials.username})
        return AdminToken(access_token=access_token)
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.get("/admin/verify")
async def verify_admin(payload: dict = Depends(verify_token)):
    return {"valid": True, "username": payload.get("sub")}

# Category Routes
@api_router.post("/categories", response_model=Category)
async def create_category(category: CategoryCreate, payload: dict = Depends(verify_token)):
    category_obj = Category(**category.model_dump())
    doc = category_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.categories.insert_one(doc)
    return category_obj

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat['created_at'], str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.get("/categories/{category_id}", response_model=Category)
async def get_category(category_id: str):
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if isinstance(category['created_at'], str):
        category['created_at'] = datetime.fromisoformat(category['created_at'])
    return category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category_update: CategoryCreate, payload: dict = Depends(verify_token)):
    existing = await db.categories.find_one({"id": category_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_update.model_dump(exclude_unset=True)
    await db.categories.update_one({"id": category_id}, {"$set": update_data})
    
    updated = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, payload: dict = Depends(verify_token)):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    # Also delete products in this category
    await db.products.delete_many({"category_id": category_id})
    return {"message": "Category deleted successfully"}

# Product Routes
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, payload: dict = Depends(verify_token)):
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products(category_id: Optional[str] = Query(None)):
    query = {}
    if category_id:
        query['category_id'] = category_id
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for prod in products:
        if isinstance(prod['created_at'], str):
            prod['created_at'] = datetime.fromisoformat(prod['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product['created_at'], str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductCreate, payload: dict = Depends(verify_token)):
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.model_dump(exclude_unset=True)
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, payload: dict = Depends(verify_token)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Settings Routes
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if not settings:
        # Create default settings
        default_settings = Settings()
        await db.settings.insert_one(default_settings.model_dump())
        return default_settings
    return settings

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings_update: SettingsUpdate, payload: dict = Depends(verify_token)):
    existing = await db.settings.find_one({"id": "settings"})
    if not existing:
        # Create if doesn't exist
        new_settings = Settings(**settings_update.model_dump(exclude_unset=True))
        await db.settings.insert_one(new_settings.model_dump())
        return new_settings
    
    update_data = settings_update.model_dump(exclude_unset=True)
    await db.settings.update_one({"id": "settings"}, {"$set": update_data})
    
    updated = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    return updated

# PDF Generation Route
@api_router.post("/generate-pdf")
async def generate_pdf(pdf_request: PDFRequest):
    # Fetch selected products
    products = await db.products.find({"id": {"$in": pdf_request.product_ids}}, {"_id": 0}).to_list(1000)
    
    if not products:
        raise HTTPException(status_code=404, detail="No products found")
    
    # Fetch settings for logo
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    
    # Fetch categories for names
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    category_dict = {cat['id']: cat['name'] for cat in categories}
    
    # Generate PDF
    pdf_path = f"/tmp/catalogue_{uuid.uuid4()}.pdf"
    
    # Custom page template with header and footer
    def add_header_footer(canvas, doc):
        canvas.saveState()
        
        # Header with colorful gradient bar
        canvas.setFillColorRGB(0.23, 0.51, 0.96)  # Blue
        canvas.rect(0, doc.height + 1.5*inch, doc.width + 2*inch, 0.3*inch, fill=True)
        
        # Footer background
        canvas.setFillColorRGB(0.95, 0.95, 0.97)
        canvas.rect(0, 0, doc.width + 2*inch, 1.2*inch, fill=True)
        
        # Footer content
        canvas.setFillColorRGB(0.2, 0.2, 0.3)
        canvas.setFont('Helvetica-Bold', 14)
        canvas.drawCentredString(doc.width/2 + inch, 0.85*inch, "United Copier")
        
        canvas.setFont('Helvetica', 9)
        canvas.setFillColorRGB(0.3, 0.3, 0.4)
        canvas.drawCentredString(doc.width/2 + inch, 0.65*inch, "All Solutions Under A Roof for Printers")
        canvas.drawCentredString(doc.width/2 + inch, 0.50*inch, "118, Jaora Compound, Indore")
        canvas.drawCentredString(doc.width/2 + inch, 0.35*inch, "Contact: 8103349299")
        canvas.drawCentredString(doc.width/2 + inch, 0.20*inch, "Branch Offices: Bhopal & Jabalpur")
        
        # Page number
        canvas.setFont('Helvetica', 8)
        canvas.setFillColorRGB(0.5, 0.5, 0.6)
        canvas.drawRightString(doc.width + 0.8*inch, 0.3*inch, f"Page {canvas.getPageNumber()}")
        
        canvas.restoreState()
    
    doc = SimpleDocTemplate(pdf_path, pagesize=A4,
                           rightMargin=0.75*inch, leftMargin=0.75*inch,
                           topMargin=1*inch, bottomMargin=1.5*inch)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles with vibrant colors
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#2563eb'),
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#6366f1'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    # Add logo if available
    if settings and settings.get('company_logo'):
        try:
            logo_data = settings['company_logo']
            if logo_data.startswith('data:image'):
                logo_data = logo_data.split(',')[1]
                logo_bytes = base64.b64decode(logo_data)
                logo_img = RLImage(BytesIO(logo_bytes), width=2.5*inch, height=1.2*inch)
            elif logo_data.startswith('http'):
                response = requests.get(logo_data)
                logo_img = RLImage(BytesIO(response.content), width=2.5*inch, height=1.2*inch)
            else:
                logo_img = None
            
            if logo_img:
                story.append(logo_img)
                story.append(Spacer(1, 0.2*inch))
        except:
            pass
    
    # Add title and subtitle
    story.append(Paragraph("Product Catalogue 2025", title_style))
    story.append(Paragraph("Premium Office Solutions", subtitle_style))
    story.append(Spacer(1, 0.4*inch))
    
    # Add products with enhanced styling
    for idx, product in enumerate(products):
        # Product box with border
        prod_name_style = ParagraphStyle(
            'ProductName', 
            parent=styles['Heading2'], 
            fontSize=18, 
            textColor=colors.HexColor('#1e40af'),
            fontName='Helvetica-Bold',
            spaceAfter=8
        )
        
        # Product name with number
        story.append(Paragraph(f"{idx + 1}. {product['name']}", prod_name_style))
        
        # Category badge
        cat_name = category_dict.get(product['category_id'], 'N/A')
        cat_para = Paragraph(
            f'<para alignment="left"><font color="#8b5cf6"><b>Category:</b></font> <font color="#6366f1">{cat_name}</font></para>',
            styles['Normal']
        )
        story.append(cat_para)
        story.append(Spacer(1, 0.08*inch))
        
        # Price with highlight
        price_style = ParagraphStyle(
            'Price',
            parent=styles['Normal'],
            fontSize=16,
            textColor=colors.HexColor('#059669'),
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph(f"Price: ₹{product['price']}", price_style))
        story.append(Spacer(1, 0.08*inch))
        
        # Description
        desc_para = Paragraph(
            f'<para alignment="left"><font color="#1f2937"><b>Description:</b> {product["description"]}</font></para>',
            styles['Normal']
        )
        story.append(desc_para)
        story.append(Spacer(1, 0.15*inch))
        
        # Add product images in a grid
        if product.get('images') and len(product['images']) > 0:
            images_to_show = product['images'][:3]  # Show up to 3 images
            img_list = []
            
            for img_data in images_to_show:
                try:
                    if img_data.startswith('data:image'):
                        img_data = img_data.split(',')[1]
                        img_bytes = base64.b64decode(img_data)
                        prod_img = RLImage(BytesIO(img_bytes), width=2*inch, height=1.5*inch)
                    elif img_data.startswith('http'):
                        response = requests.get(img_data)
                        prod_img = RLImage(BytesIO(response.content), width=2*inch, height=1.5*inch)
                    else:
                        continue
                    img_list.append(prod_img)
                except:
                    continue
            
            if img_list:
                # Create table for images
                img_table_data = [img_list]
                img_table = Table(img_table_data, colWidths=[2.2*inch] * len(img_list))
                img_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 5),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                ]))
                story.append(img_table)
                story.append(Spacer(1, 0.15*inch))
        
        # Add decorative separator
        story.append(Spacer(1, 0.2*inch))
        
        # Colored separator line
        separator_table = Table([['']], colWidths=[6.5*inch], rowHeights=[0.02*inch])
        separator_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#93c5fd')),
        ]))
        story.append(separator_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Build PDF with custom template
    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    
    return FileResponse(pdf_path, media_type='application/pdf', filename='United_Copier_Catalogue.pdf')

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()