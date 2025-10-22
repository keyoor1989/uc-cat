# United Copier - Product Catalogue System

> A modern, full-stack product catalogue management system for United Copier - All Solutions Under A Roof for Printers

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-19.0.0-blue.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Recent Updates](#recent-updates)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

United Copier Product Catalogue is a comprehensive web application designed to showcase and manage office printing solutions, copiers, and related equipment. The system provides a public-facing product catalogue with advanced filtering, an admin dashboard for product management, PDF brochure generation, and seamless WhatsApp integration for customer inquiries.

**Live Demo:** [Your deployed URL here]

**Locations:**
- Head Office: 118, Jaora Compound, Indore, Madhya Pradesh
- Branch Offices: Bhopal, Jabalpur

---

## ✨ Features

### 🛍️ Public Catalogue
- **Product Browsing** - Grid layout with beautiful card design
- **Published Products Only** - Customers see only published products, drafts hidden
- **Advanced Search** - Real-time search by product name and description
- **Category Filtering** - Responsive tabs (desktop) and dropdown (mobile)
- **Rich Product Details** - Images, descriptions with formatting, pricing, videos
- **WhatsApp Integration** - Share products directly to WhatsApp with image previews
- **PDF Generation** - Download custom product brochures
- **Responsive Design** - Optimized for mobile, tablet, and desktop

### 🔧 Admin Dashboard
- **Product Management** - Full CRUD operations for products
- **Draft/Publish System** - Save products as drafts before publishing
- **Status Management** - Quick toggle between draft and published
- **Status Filtering** - Filter products by draft, published, or all
- **Category Management** - Organize products into categories
- **Image Upload** - Server-side storage with HTTP URLs
- **Rich Text Editor** - Markdown-like formatting (bold, italic, bullets)
- **Settings Management** - Configure WhatsApp number and company logo
- **Authentication** - JWT-based secure admin access

### 📄 PDF Generation
- **Professional Design** - Magazine-quality catalogue layout
- **Branded Header/Footer** - Company information on every page
- **Product Images** - Up to 3 images per product
- **Rich Formatting** - Supports bold, italic, and bullet points
- **Customizable** - Select specific products to include

### 📱 WhatsApp Sharing
- **Product Links** - Share with website URL for more info
- **Image Previews** - Works with HTTP URLs (server-hosted images)
- **Formatted Messages** - Professional layout with emojis
- **Contact Information** - Automatic inclusion of business details

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for Python
- **MongoDB** - NoSQL database with Motor (async driver)
- **JWT** - Token-based authentication
- **ReportLab** - Professional PDF generation
- **Pydantic** - Data validation and settings management
- **Uvicorn** - ASGI server for production

### Frontend
- **React 19** - Latest React with concurrent features
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **Axios** - HTTP client for API calls
- **React Hook Form & Zod** - Form handling and validation
- **Sonner** - Toast notifications

### DevOps
- **Git** - Version control
- **Python venv** - Virtual environment
- **npm/yarn** - Package management
- **dotenv** - Environment configuration

---

## 🆕 Recent Updates

### Version 1.0.0 - Latest Improvements

#### 🖼️ **Server-Side Image Storage** (Major Update)
- **Problem Solved:** Base64 images caused large database size and prevented WhatsApp previews
- **Implementation:**
  - Images now stored on VPS server in `backend/uploads/`
  - Public HTTP URLs generated for each image
  - 99% reduction in database size
  - WhatsApp image previews now work perfectly
- **Benefits:**
  - Faster page loading
  - Better scalability
  - CDN-ready architecture
  - Browser caching support

#### 🎨 **UI/UX Enhancements**
1. **Centered Logo**
   - Logo now centered in header on all devices
   - Increased size for better brand visibility
   - Cleaner, more professional appearance

2. **Mobile Category Navigation**
   - Converted overlapping tabs to dropdown on mobile
   - Touch-friendly interface
   - Maintains tabs on desktop for better UX

3. **Enhanced WhatsApp Sharing**
   - Added website link in share messages
   - Emoji icons for better visual appeal
   - Formatted prices with Indian locale
   - Image URL preview support
   - Professional message template

#### 📝 **Rich Text Formatting**
- **Product Descriptions** support markdown-like syntax:
  - `**bold text**` - Bold formatting
  - `*italic text*` - Italic formatting
  - `- bullet point` - Bullet lists
  - Multiple paragraphs with proper spacing
- Works in both web interface and PDF generation

#### 📄 **Professional PDF Catalogue**
- Complete redesign with magazine-quality layout
- Enhanced header with company branding
- Three-column footer with organized contact info
- Product cards with bordered frames
- Summary statistics on title page
- Rich text formatting support in descriptions
- Better image handling and aspect ratios
- Page numbering and professional typography

#### 🔧 **Technical Improvements**
- Removed third-party branding (Emergent badge)
- Updated meta tags for better SEO
- Improved security with proper authentication
- Better error handling and user feedback
- Optimized image handling

#### 📝 **Draft/Publish System** (New Feature)
- **Save Work-in-Progress** - Products can be saved as drafts
- **Status Management:**
  - **Draft** - Not visible to customers, work-in-progress
  - **Published** - Visible on public catalogue
- **Admin Features:**
  - Status dropdown filter (All, Published, Drafts)
  - Visual status badges (green for published, yellow for draft)
  - One-click publish/unpublish buttons
  - Status selector in product form with helpful descriptions
- **Benefits:**
  - Test products before making them public
  - Save incomplete products for later completion
  - Seasonal control (hide/show products)
  - Non-destructive workflow (draft instead of delete)
- **Backward Compatible:**
  - Existing products automatically set to "published"
  - No data migration required

---

## 📦 Installation

### Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** and npm/yarn
- **MongoDB** instance running
- **Git** for version control

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/uc-cat.git
cd uc-cat

# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create uploads directory
mkdir -p uploads

# Create .env file (see Configuration section)
nano .env

# Run the server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install
# or
yarn install

# Start development server
npm start
# or
yarn start
```

Frontend will be available at: `http://localhost:3000`

---

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env` file:

```bash
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=catalogue_db

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# Base URL (for image URLs)
# Local development:
BASE_URL=http://localhost:8000
# Production:
# BASE_URL=https://yourdomain.com
```

### Frontend Configuration

The frontend automatically uses `http://localhost:8000` in development. For production, update the API URL in `frontend/src/App.js`:

```javascript
export const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

---

## 🚀 Usage

### Admin Access

1. Navigate to: `http://localhost:3000/admin`
2. Login with credentials from `.env`:
   - Username: `admin` (or your configured username)
   - Password: (your configured password)
3. Access admin dashboard to manage products, categories, and settings

### Managing Products

#### Add a Product
1. Go to **Admin Dashboard** → **Products** tab
2. Click **"Add Product"** button
3. Fill in product details:
   - **Name:** Product name
   - **Description:** Use formatting:
     ```
     **Key Features:**
     - High quality printing
     - Fast processing
     - Energy efficient

     Perfect for *busy offices*!
     ```
   - **Price:** Enter price in INR
   - **Category:** Select from dropdown
   - **Images:** Upload images (will be stored on server)
   - **YouTube Link:** Optional video URL
   - **Product Status:** Choose:
     - **Draft** - Save for later, not visible to customers
     - **Published** - Immediately visible on public catalogue
4. Click **"Create Draft"** or **"Create Product"** (button text changes based on status)

#### Upload Images
- Images are automatically uploaded to server
- Generates HTTP URLs for sharing
- Supports: JPG, PNG, GIF, WEBP
- Multiple images supported (up to 3 displayed)

#### Working with Drafts

**Create as Draft:**
1. When adding/editing a product
2. Select **"Draft - Save for later"** in Product Status
3. Click save - product won't be visible to customers

**Publish a Draft:**
- **Quick Method:** Click **"Publish"** button on product card
- **Edit Method:** Edit product, change status to "Published", save

**Unpublish a Product:**
- Click **"Move to Draft"** button on published product
- Product becomes hidden from public catalogue

**Filter Products by Status:**
- Use dropdown filter at top: **"All Products"** / **"Published Only"** / **"Drafts Only"**
- See status badges on product cards: 🟢 Published / 🟡 Draft

**Use Cases:**
- Save incomplete products for later
- Test products before going live
- Hide seasonal products temporarily
- Prepare bulk products, publish when ready

### Managing Categories

1. Go to **Categories** tab
2. Click **"Add Category"**
3. Enter category name and optional description
4. Categories appear in filter dropdown/tabs

### Generating PDF Catalogues

1. Visit public catalogue: `http://localhost:3000`
2. Click **"Download PDF"** button
3. Select products to include
4. Click **"Generate PDF"**
5. Professional PDF downloads automatically

### WhatsApp Sharing

**Share from Product Card:**
1. Click **Share** icon on any product
2. WhatsApp opens with pre-formatted message
3. Message includes:
   - Product name, category, price
   - Description
   - Website link
   - Contact information
   - Image preview (if HTTP URL)

**Direct Contact:**
1. Click **Contact** button on product
2. Opens WhatsApp with product inquiry
3. Sends to configured WhatsApp number

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
Most endpoints require JWT authentication. Include token in headers:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Admin Authentication

**Login**
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

**Verify Token**
```http
GET /api/admin/verify
Authorization: Bearer <token>

Response:
{
  "valid": true,
  "username": "admin"
}
```

#### Categories

**Get All Categories**
```http
GET /api/categories

Response: [
  {
    "id": "uuid",
    "name": "Printers",
    "description": "Office printers",
    "created_at": "2025-01-22T..."
  }
]
```

**Create Category** (Auth Required)
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Scanners",
  "description": "High-speed scanners"
}
```

**Update Category** (Auth Required)
```http
PUT /api/categories/{category_id}
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Delete Category** (Auth Required)
```http
DELETE /api/categories/{category_id}
Authorization: Bearer <token>
```

#### Products

**Get All Products**
```http
GET /api/products
# Optional filters:
GET /api/products?category_id=uuid
GET /api/products?status=published
GET /api/products?status=draft
GET /api/products?category_id=uuid&status=published

Response: [
  {
    "id": "uuid",
    "name": "HP LaserJet Pro",
    "description": "**High-speed** printer...",
    "price": 45000,
    "category_id": "uuid",
    "images": ["http://server.com/uploads/abc.jpg"],
    "youtube_link": "https://youtube.com/...",
    "status": "published",  // "draft" or "published"
    "created_at": "2025-01-22T..."
  }
]
```

**Query Parameters:**
- `category_id` (optional): Filter by category
- `status` (optional): Filter by status - "draft", "published", or omit for all

**Create Product** (Auth Required)
```http
POST /api/products
Authorization: Bearer <token>

{
  "name": "Product Name",
  "description": "Description with **formatting**",
  "price": 25000,
  "category_id": "uuid",
  "images": ["http://server.com/uploads/image.jpg"],
  "youtube_link": "https://youtube.com/watch?v=...",
  "status": "draft"  // or "published", defaults to "draft"
}
```

**Update Product** (Auth Required)
```http
PUT /api/products/{product_id}
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "price": 30000,
  "status": "published",  // Change from draft to published
  ...
}
```

**Delete Product** (Auth Required)
```http
DELETE /api/products/{product_id}
Authorization: Bearer <token>
```

#### Image Upload

**Upload Image** (Auth Required)
```http
POST /api/upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image-file>

Response:
{
  "success": true,
  "url": "http://server.com/uploads/uuid.jpg",
  "filename": "uuid.jpg"
}
```

#### Settings

**Get Settings**
```http
GET /api/settings

Response:
{
  "id": "settings",
  "whatsapp_number": "919876543210",
  "company_logo": "http://server.com/uploads/logo.png"
}
```

**Update Settings** (Auth Required)
```http
PUT /api/settings
Authorization: Bearer <token>

{
  "whatsapp_number": "919876543210",
  "company_logo": "http://server.com/uploads/logo.png"
}
```

#### PDF Generation

**Generate PDF**
```http
POST /api/generate-pdf
Content-Type: application/json

{
  "product_ids": ["uuid1", "uuid2", "uuid3"]
}

Response: PDF file download
```

---

## 🌐 Deployment

### VPS Deployment (Recommended)

#### Prerequisites
- Ubuntu 20.04+ VPS
- Domain name (optional but recommended)
- SSH access

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3 python3-pip python3-venv -y

# Install MongoDB
sudo apt install mongodb -y
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Nginx
sudo apt install nginx -y
```

#### Step 2: Deploy Backend

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/uc-cat.git
cd uc-cat/backend

# Set up virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
sudo nano .env
# (Add production configuration)

# Create uploads directory
mkdir -p uploads
sudo chmod 755 uploads

# Install as systemd service
sudo nano /etc/systemd/system/uc-cat-backend.service
```

**Systemd Service File:**
```ini
[Unit]
Description=United Copier Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/uc-cat/backend
Environment="PATH=/var/www/uc-cat/backend/venv/bin"
ExecStart=/var/www/uc-cat/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Start backend service
sudo systemctl daemon-reload
sudo systemctl start uc-cat-backend
sudo systemctl enable uc-cat-backend
sudo systemctl status uc-cat-backend
```

#### Step 3: Deploy Frontend

```bash
cd /var/www/uc-cat/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Build folder will be created at: frontend/build
```

#### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/uc-cat
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /var/www/uc-cat/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Serve uploaded images directly
    location /uploads {
        alias /var/www/uc-cat/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/uc-cat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 5: SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

#### Step 6: Update Environment Variables

Update `backend/.env` with production values:
```bash
BASE_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
```

Restart backend:
```bash
sudo systemctl restart uc-cat-backend
```

### Environment Variables for Production

```bash
# backend/.env
MONGO_URL=mongodb://localhost:27017
DB_NAME=catalogue_db
JWT_SECRET=<generate-strong-secret>
ADMIN_USERNAME=<your-admin-username>
ADMIN_PASSWORD=<strong-password>
CORS_ORIGINS=https://yourdomain.com
BASE_URL=https://yourdomain.com
```

---

## 📁 Project Structure

```
uc-cat/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── uploads/              # Uploaded images directory
│   │   └── .gitkeep
│   └── .env                  # Environment variables (not in git)
│
├── frontend/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/          # Radix UI components
│   │   ├── pages/
│   │   │   ├── HomePage.js         # Public catalogue
│   │   │   ├── AdminLogin.js       # Admin authentication
│   │   │   └── AdminDashboard.js   # Admin panel
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── package.json         # Node dependencies
│   └── tailwind.config.js   # Tailwind configuration
│
├── tests/
│   └── backend_test.py      # API tests
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
python backend_test.py
```

Tests include:
- Admin authentication
- Category CRUD operations
- Product CRUD operations
- Settings management
- PDF generation

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**United Copier**
- Website: [Your website]
- Email: contact@unitedcopier.com
- Phone: 8103349299

---

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

## 📞 Support

For support, email contact@unitedcopier.com or call 8103349299.

**Branch Offices:**
- Bhopal
- Jabalpur

**Head Office:**
118, Jaora Compound, Indore, Madhya Pradesh

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] Multi-language support (Hindi, English)
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Product comparison feature
- [ ] Customer reviews and ratings
- [ ] Integration with payment gateway
- [ ] Mobile app (React Native)
- [ ] CDN integration for images
- [ ] Advanced search with filters
- [ ] Bulk product import/export

---

## 📊 Performance

- **Page Load:** < 2 seconds
- **Image Load:** Lazy loading enabled
- **Database Queries:** Optimized with indexes
- **PDF Generation:** < 5 seconds for 50 products
- **WhatsApp Share:** Instant

---

## 🔐 Security

- JWT token-based authentication
- Password hashing with bcrypt
- CORS protection configured
- Input validation with Pydantic
- File type validation for uploads
- SQL injection prevention (NoSQL)
- XSS protection in React

---

Made with ❤️ by United Copier Team

*Last Updated: January 2025*
