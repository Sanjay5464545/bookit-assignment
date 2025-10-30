import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (for now - we'll add real DB later)
const experiences = [
  {
    id: 1,
    title: "Scuba Diving in Goa",
    description: "Explore the underwater world of Goa with professional instructors",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    price: 3500,
    duration: "3 hours",
    location: "Goa, India",
    rating: 4.8,
    reviews: 245
  },
  {
    id: 2,
    title: "Paragliding in Manali",
    description: "Soar through the skies and enjoy breathtaking mountain views",
    image: "https://images.unsplash.com/photo-1564769625392-651b6e5b8b33?w=800",
    price: 2500,
    duration: "30 minutes",
    location: "Manali, Himachal Pradesh",
    rating: 4.9,
    reviews: 189
  },
  {
    id: 3,
    title: "Desert Safari in Jaisalmer",
    description: "Experience the Thar Desert with camel rides and cultural shows",
    image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
    price: 4000,
    duration: "Full day",
    location: "Jaisalmer, Rajasthan",
    rating: 4.7,
    reviews: 321
  }
];

const slots = {
  1: [
    { id: 1, date: "2025-11-05", time: "09:00 AM", available: 5, booked: 3 },
    { id: 2, date: "2025-11-05", time: "02:00 PM", available: 5, booked: 5 },
    { id: 3, date: "2025-11-06", time: "09:00 AM", available: 5, booked: 1 },
    { id: 4, date: "2025-11-06", time: "02:00 PM", available: 5, booked: 0 }
  ],
  2: [
    { id: 5, date: "2025-11-05", time: "10:00 AM", available: 3, booked: 2 },
    { id: 6, date: "2025-11-05", time: "03:00 PM", available: 3, booked: 0 },
    { id: 7, date: "2025-11-07", time: "10:00 AM", available: 3, booked: 3 }
  ],
  3: [
    { id: 8, date: "2025-11-08", time: "06:00 AM", available: 10, booked: 4 },
    { id: 9, date: "2025-11-08", time: "04:00 PM", available: 10, booked: 7 },
    { id: 10, date: "2025-11-09", time: "06:00 AM", available: 10, booked: 2 }
  ]
};

const promoCodes = {
  "FIRST50": { discount: 50, type: "percentage" },
  "SAVE500": { discount: 500, type: "fixed" },
  "WELCOME20": { discount: 20, type: "percentage" }
};

let bookings: any[] = [];

// Routes

// 1. GET /api/experiences - Get all experiences
app.get('/api/experiences', (req: Request, res: Response) => {
  res.json({ success: true, data: experiences });
});

// 2. GET /api/experiences/:id - Get single experience
app.get('/api/experiences/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const experience = experiences.find(exp => exp.id === id);
  
  if (!experience) {
    return res.status(404).json({ success: false, message: 'Experience not found' });
  }
  
  res.json({ success: true, data: experience });
});

// 3. GET /api/experiences/:id/slots - Get available slots
app.get('/api/experiences/:id/slots', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const experienceSlots = slots[id as keyof typeof slots] || [];
  
  res.json({ success: true, data: experienceSlots });
});

// 4. POST /api/promo/validate - Validate promo code
app.post('/api/promo/validate', (req: Request, res: Response) => {
  const { code, amount } = req.body;
  
  if (!code || !amount) {
    return res.status(400).json({ success: false, message: 'Code and amount required' });
  }
  
  const promo = promoCodes[code as keyof typeof promoCodes];
  
  if (!promo) {
    return res.status(404).json({ success: false, message: 'Invalid promo code' });
  }
  
  let discount = 0;
  if (promo.type === 'percentage') {
    discount = (amount * promo.discount) / 100;
  } else {
    discount = promo.discount;
  }
  
  const finalAmount = Math.max(amount - discount, 0);
  
  res.json({ 
    success: true, 
    data: { 
      discount, 
      finalAmount,
      discountType: promo.type,
      discountValue: promo.discount
    } 
  });
});

// 5. POST /api/bookings - Create booking
app.post('/api/bookings', (req: Request, res: Response) => {
  const { experienceId, slotId, userName, userEmail, promoCode, totalAmount } = req.body;
  
  if (!experienceId || !slotId || !userName || !userEmail) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  // Find the experience and slot
  const experience = experiences.find(exp => exp.id === experienceId);
  const experienceSlots = slots[experienceId as keyof typeof slots] || [];
  const slot = experienceSlots.find(s => s.id === slotId);
  
  if (!experience || !slot) {
    return res.status(404).json({ success: false, message: 'Experience or slot not found' });
  }
  
  // Check if slot is available
  if (slot.booked >= slot.available) {
    return res.status(400).json({ success: false, message: 'Slot is fully booked' });
  }
  
  // Create booking
  const booking = {
    id: bookings.length + 1,
    experienceId,
    experienceTitle: experience.title,
    slotId,
    slotDate: slot.date,
    slotTime: slot.time,
    userName,
    userEmail,
    promoCode: promoCode || null,
    totalAmount,
    bookingDate: new Date().toISOString(),
    status: 'confirmed'
  };
  
  bookings.push(booking);
  slot.booked += 1; // Update slot availability
  
  res.json({ success: true, data: booking, message: 'Booking confirmed successfully!' });
});

// 6. GET /api/bookings/:id - Get booking details
app.get('/api/bookings/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const booking = bookings.find(b => b.id === id);
  
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  
  res.json({ success: true, data: booking });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'BookIt API is running' });
});

// Add this before app.listen()
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'BookIt API Server',
    version: '1.0.0',
    endpoints: {
      experiences: '/api/experiences',
      slots: '/api/experiences/:id/slots',
      promoValidation: '/api/promo/validate',
      bookings: '/api/bookings',
      health: '/health'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
});
