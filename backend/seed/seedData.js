require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Service = require('../models/Service');
const Gallery = require('../models/Gallery');
const Content = require('../models/Content');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/glow-grace-salon');
  console.log('Connected for seeding...');
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      Admin.deleteMany(),
      Service.deleteMany(),
      Gallery.deleteMany(),
      Content.deleteMany(),
    ]);

    // Create admin
    await Admin.create({
      name: 'Salon Owner',
      email: process.env.ADMIN_EMAIL || 'admin@glowgrace.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'owner',
    });
    console.log('Admin created: admin@glowgrace.com / Admin@123456');

    // Create services
    const services = [
      {
        name: 'Hair Cut',
        slug: 'hair-cut',
        description: 'Expert precision cuts tailored to your face shape and lifestyle. Includes consultation, wash, cut, and style.',
        price: 45,
        duration: 45,
        category: 'hair',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
        isFeatured: true,
        staff: [
          { name: 'Sarah Mitchell', specialty: 'Precision Cuts' },
          { name: 'James Chen', specialty: 'Modern Styles' },
        ],
      },
      {
        name: 'Hair Spa',
        slug: 'hair-spa',
        description: 'Luxurious deep conditioning treatment with aromatherapy oils, scalp massage, and steam therapy for revitalized hair.',
        price: 75,
        duration: 90,
        category: 'spa',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
        isFeatured: true,
        staff: [
          { name: 'Emma Rodriguez', specialty: 'Hair Treatments' },
          { name: 'Sarah Mitchell', specialty: 'Scalp Therapy' },
        ],
      },
      {
        name: 'Hair Coloring',
        slug: 'hair-coloring',
        description: 'Professional color services including highlights, balayage, ombre, and full color with premium ammonia-free products.',
        price: 120,
        duration: 120,
        category: 'hair',
        image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600',
        isFeatured: true,
        staff: [
          { name: 'Emma Rodriguez', specialty: 'Color Specialist' },
          { name: 'Lisa Park', specialty: 'Balayage Expert' },
        ],
      },
      {
        name: 'Facial',
        slug: 'facial',
        description: 'Customized facial treatment with deep cleansing, exfoliation, extraction, and hydrating mask for radiant skin.',
        price: 85,
        duration: 60,
        category: 'skin',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d880?w=600',
        isFeatured: true,
        staff: [
          { name: 'Lisa Park', specialty: 'Skincare' },
          { name: 'Emma Rodriguez', specialty: 'Anti-Aging' },
        ],
      },
      {
        name: 'Makeup',
        slug: 'makeup',
        description: 'Professional makeup application for any occasion. Includes skin prep, flawless base, and long-lasting finish.',
        price: 65,
        duration: 60,
        category: 'makeup',
        image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600',
        isFeatured: false,
        staff: [
          { name: 'Maya Johnson', specialty: 'Glam Makeup' },
          { name: 'Lisa Park', specialty: 'Natural Looks' },
        ],
      },
      {
        name: 'Bridal Makeup',
        slug: 'bridal-makeup',
        description: 'Complete bridal beauty package with trial session, long-wear makeup, and touch-up kit for your special day.',
        price: 250,
        duration: 120,
        category: 'bridal',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
        isFeatured: true,
        staff: [
          { name: 'Maya Johnson', specialty: 'Bridal Expert' },
        ],
      },
      {
        name: 'Manicure',
        slug: 'manicure',
        description: 'Classic manicure with nail shaping, cuticle care, hand massage, and polish application. Gel options available.',
        price: 35,
        duration: 45,
        category: 'nails',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600',
        isFeatured: false,
        staff: [
          { name: 'Nina Patel', specialty: 'Nail Art' },
          { name: 'Maya Johnson', specialty: 'Gel Manicure' },
        ],
      },
      {
        name: 'Pedicure',
        slug: 'pedicure',
        description: 'Relaxing pedicure with foot soak, exfoliation, callus treatment, massage, and polish for beautiful feet.',
        price: 45,
        duration: 60,
        category: 'nails',
        image: 'https://images.unsplash.com/photo-1519014815651-8c5f37e2b3d2?w=600',
        isFeatured: false,
        staff: [
          { name: 'Nina Patel', specialty: 'Spa Pedicure' },
        ],
      },
    ];

    await Service.insertMany(services);
    console.log(`${services.length} services created`);

    // Create gallery images
    const galleryImages = [
      { title: 'Elegant Hair Styling', imageUrl: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb29d?w=600', category: 'hair' },
      { title: 'Bridal Beauty', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', category: 'bridal' },
      { title: 'Makeup Artistry', imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600', category: 'makeup' },
      { title: 'Nail Design', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600', category: 'nails' },
      { title: 'Spa Treatment', imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600', category: 'spa' },
      { title: 'Salon Interior', imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600', category: 'salon' },
      { title: 'Color Transformation', imageUrl: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600', category: 'hair' },
      { title: 'Facial Glow', imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d880?w=600', category: 'spa' },
      { title: 'Wedding Ready', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', category: 'bridal' },
      { title: 'Luxury Lounge', imageUrl: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb29d?w=600', category: 'salon' },
    ];

    await Gallery.insertMany(galleryImages);
    console.log(`${galleryImages.length} gallery images created`);

    // Create CMS content
    const contentItems = [
      {
        key: 'hero',
        section: 'home',
        data: {
          title: 'Glow & Grace Salon',
          subtitle: 'Where Beauty Meets Elegance',
          description: 'Experience luxury beauty treatments in an atmosphere of refined elegance. Our expert stylists and therapists are dedicated to making you look and feel extraordinary.',
          ctaPrimary: 'Book Appointment',
          ctaSecondary: 'Explore Services',
        },
      },
      {
        key: 'whyChooseUs',
        section: 'home',
        data: {
          title: 'Why Choose Us',
          items: [
            { icon: 'bi-gem', title: 'Premium Products', description: 'We use only the finest professional-grade products from leading beauty brands.' },
            { icon: 'bi-people', title: 'Expert Stylists', description: 'Our team of certified professionals brings years of experience and passion.' },
            { icon: 'bi-heart', title: 'Personalized Care', description: 'Every treatment is customized to your unique needs and preferences.' },
            { icon: 'bi-shield-check', title: 'Hygiene First', description: 'Strict sanitization protocols ensure your safety and comfort.' },
          ],
        },
      },
      {
        key: 'testimonials',
        section: 'home',
        data: {
          items: [
            { name: 'Jessica Adams', text: 'Absolutely love this salon! Sarah gave me the best haircut I have ever had. The atmosphere is so relaxing and luxurious.', rating: 5 },
            { name: 'Maria Garcia', text: 'My bridal makeup was flawless! Maya made me feel like a princess on my wedding day. Highly recommend!', rating: 5 },
            { name: 'Rachel Kim', text: 'The hair spa treatment transformed my damaged hair. Emma is a miracle worker. Will definitely be back!', rating: 5 },
            { name: 'Amanda Wright', text: 'Best salon in town! Professional staff, beautiful interior, and amazing results every single time.', rating: 5 },
          ],
        },
      },
      {
        key: 'about',
        section: 'about',
        data: {
          story: 'Founded in 2015, Glow & Grace Salon began as a dream to create a sanctuary where beauty and wellness converge. What started as a small boutique salon has grown into a premier destination for discerning clients seeking exceptional beauty services.',
          mission: 'To empower every client to discover and embrace their unique beauty through personalized, luxurious treatments delivered with warmth, expertise, and unwavering attention to detail.',
          vision: 'To be the most trusted and beloved luxury salon, setting the standard for excellence in beauty services while fostering a community where everyone feels beautiful, confident, and valued.',
          team: [
            { name: 'Sarah Mitchell', role: 'Lead Stylist & Co-Founder', image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300', bio: '15+ years of experience in precision cutting and styling.' },
            { name: 'Emma Rodriguez', role: 'Color Specialist', image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300', bio: 'Award-winning colorist specializing in balayage and creative color.' },
            { name: 'Maya Johnson', role: 'Makeup Artist', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300', bio: 'Bridal and editorial makeup artist with celebrity clientele.' },
            { name: 'Lisa Park', role: 'Skincare Expert', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300', bio: 'Licensed esthetician with expertise in advanced facial treatments.' },
          ],
        },
      },
      {
        key: 'contact',
        section: 'contact',
        data: {
          phone: '+1 (555) 123-4567',
          email: 'hello@glowgrace.com',
          address: '123 Beauty Boulevard, Suite 100, New York, NY 10001',
          hours: {
            weekdays: 'Monday - Friday: 9:00 AM - 8:00 PM',
            saturday: 'Saturday: 9:00 AM - 6:00 PM',
            sunday: 'Sunday: 10:00 AM - 5:00 PM',
          },
          social: {
            facebook: 'https://facebook.com/glowgracesalon',
            instagram: 'https://instagram.com/glowgracesalon',
            twitter: 'https://twitter.com/glowgracesalon',
            pinterest: 'https://pinterest.com/glowgracesalon',
          },
          mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878459418!3d40.74076684379132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b30eac9f%3A0x25905d500610b7e!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1635959481600!5m2!1sen!2sus',
        },
      },
    ];

    await Content.insertMany(contentItems);
    console.log(`${contentItems.length} content items created`);

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
