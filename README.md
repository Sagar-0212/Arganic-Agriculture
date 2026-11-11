# Sendriya Krushibhushan - Organic Agriculture E-Commerce Platform

A full-stack MERN (MongoDB, Express, React, Node.js) platform designed for organic farming products, empowering farmers and consumers with seamless agricultural e-commerce, order tracking, and agricultural assistance.

---

## 🚀 Features

- **E-Commerce Marketplace**: Browse, filter, and purchase organic fertilizers, seeds, and agricultural supplies.
- **Farmer & Buyer Authentication**: Secure JWT-based authentication with role-based access control.
- **Shopping Cart & Checkout**: Seamless cart management and order creation.
- **Payment Gateway Integration**: Integrated with Razorpay for secure payments.
- **Receipt & Invoice Generation**: Automated PDF invoice generation for completed orders.
- **Interactive Chatbot Widget**: Integrated assistant to guide users and answer agricultural queries.
- **Responsive Modern UI**: Built with React, Tailwind CSS, Framer Motion, and Lucide icons.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit & React-Redux
- **Routing**: React Router DOM (v6)
- **Forms & Validation**: React Hook Form + Zod
- **Animations & Icons**: Framer Motion, Lucide React
- **Notifications**: React Hot Toast
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, Express Rate Limit, bcryptjs, JSON Web Tokens (JWT)
- **File Upload**: Multer & Cloudinary
- **Payments**: Razorpay Node SDK
- **Invoicing**: PDFKit

---

## 📂 Project Structure

```
Capstone/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection & seed scripts
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth & error handling middleware
│   │   ├── models/          # Mongoose data models
│   │   ├── routes/          # Express API route endpoints
│   │   ├── utils/           # Helper utilities
│   │   └── app.js           # Express app setup
│   ├── .env.example         # Sample environment configuration
│   ├── package.json
│   └── server.js            # Server entry point
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application views/pages
│   │   ├── services/        # API service clients
│   │   ├── store/           # Redux store slices
│   │   ├── App.jsx          # Root component
│   │   ├── main.jsx         # App mounting
│   │   └── index.css        # Tailwind styling
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/sendriya
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
NODE_ENV=development

# Razorpay Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email SMTP
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=info@sendriya.org
```

Seed database (optional):
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📜 License

This project is licensed under the ISC License.
