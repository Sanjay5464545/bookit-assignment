 # BookIt - Travel Experience Booking Platform

Full-stack web application for discovering and booking travel experiences across India.

#  Live Demo

- **Frontend:** [Add Vercel URL after deployment]
- **Backend API:** [Add Render URL after deployment]
- **GitHub:** [Your repo URL]

#  Tech Stack

**Frontend:**
- Next.js 16 with TypeScript
- TailwindCSS v4
- Axios for API calls
- React Hot Toast for notifications

**Backend:**
- Node.js + Express
- TypeScript
- In-memory data storage
- CORS enabled

#  Features

 Browse travel experiences with details  
 View experience information with ratings  
 Select available date & time slots  
 Apply promotional codes for discounts  
 Complete booking with user validation  
 Booking confirmation page  
Responsive mobile-friendly design  
 Real-time slot availability checking  

#  Run Locally

# Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

# Backend Setup

cd backend
npm install
npm run dev


Backend runs on `http://localhost:5000`

### Frontend Setup


cd frontend
npm install
npm run dev


Frontend runs on `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experiences` | Get all experiences |
| GET | `/api/experiences/:id` | Get single experience |
| GET | `/api/experiences/:id/slots` | Get available slots |
| POST | `/api/promo/validate` | Validate promo code |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/:id` | Get booking details |

##  Test Promo Codes

- `FIRST50` - 50% discount
- `SAVE500` - ₹500 flat discount  
- `WELCOME20` - 20% discount

##  Pages

1. **Home** - Browse experiences
2. **Experience Details** - View info & select slots
3. **Checkout** - Enter details & payment
4. **Confirmation** - Booking success

##  Design

UI designed using Figma specifications with amber/yellow branding.

##  Author

[Your Name]  
Email: [Your Email]  
GitHub: [Your GitHub Profile]

