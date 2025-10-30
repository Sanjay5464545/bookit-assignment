import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create experiences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(500),
        price INTEGER NOT NULL,
        duration VARCHAR(100),
        location VARCHAR(255),
        rating DECIMAL(2,1),
        reviews INTEGER
      )
    `);

    // Create slots table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS slots (
        id SERIAL PRIMARY KEY,
        experience_id INTEGER REFERENCES experiences(id),
        slot_date VARCHAR(50),
        slot_time VARCHAR(50),
        available INTEGER,
        booked INTEGER DEFAULT 0
      )
    `);

    // Create bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        experience_id INTEGER REFERENCES experiences(id),
        experience_title VARCHAR(255),
        slot_id INTEGER,
        slot_date VARCHAR(50),
        slot_time VARCHAR(50),
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        promo_code VARCHAR(50),
        total_amount INTEGER,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'confirmed'
      )
    `);

    // Insert sample data if tables are empty
    const { rows } = await pool.query('SELECT COUNT(*) FROM experiences');
    if (rows[0].count === '0') {
      await insertSampleData();
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

async function insertSampleData() {
  const experiences = [
    { title: 'Scuba Diving in Goa', description: 'Explore the underwater world of Goa with professional instructors', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', price: 3500, duration: '3 hours', location: 'Goa, India', rating: 4.8, reviews: 245 },
    { title: 'Paragliding in Manali', description: 'Soar through the skies and enjoy breathtaking mountain views', image: 'https://images.unsplash.com/photo-1564769625392-651b6e5b8b33?w=800', price: 2500, duration: '30 minutes', location: 'Manali, Himachal Pradesh', rating: 4.9, reviews: 189 },
    { title: 'Desert Safari in Jaisalmer', description: 'Experience the Thar Desert with camel rides and cultural shows', image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800', price: 4000, duration: 'Full day', location: 'Jaisalmer, Rajasthan', rating: 4.7, reviews: 321 }
  ];

  for (const exp of experiences) {
    const result = await pool.query(
      'INSERT INTO experiences (title, description, image, price, duration, location, rating, reviews) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [exp.title, exp.description, exp.image, exp.price, exp.duration, exp.location, exp.rating, exp.reviews]
    );
    
    const expId = result.rows[0].id;
    
    // Add slots for each experience
    const slots = [
      { date: '2025-11-05', time: '09:00 AM', available: 5, booked: 3 },
      { date: '2025-11-05', time: '02:00 PM', available: 5, booked: 5 },
      { date: '2025-11-06', time: '09:00 AM', available: 5, booked: 1 },
      { date: '2025-11-06', time: '02:00 PM', available: 5, booked: 0 }
    ];
    
    for (const slot of slots) {
      await pool.query(
        'INSERT INTO slots (experience_id, slot_date, slot_time, available, booked) VALUES ($1, $2, $3, $4, $5)',
        [expId, slot.date, slot.time, slot.available, slot.booked]
      );
    }
  }
}
