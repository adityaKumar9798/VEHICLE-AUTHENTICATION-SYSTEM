# Parking Management System

A full-stack parking management application built with React, TypeScript, Express, and PostgreSQL. This system provides comprehensive vehicle parking management with features like vehicle registration, entry/exit tracking, payment processing, and advanced vehicle authentication.

## 🚗 Features

- **Vehicle Management**: Register and manage vehicles with owner information
- **Parking Sessions**: Track vehicle entry and exit times with automated calculations
- **Image Capture**: Webcam integration for vehicle entry/exit documentation
- **Payment Processing**: Calculate and manage parking fees
- **Analytics Dashboard**: Real-time charts and statistics using Recharts
- **User Authentication**: Secure login system with session management
- **Advanced Vehicle Authentication**: Multiple authentication methods including OCR, QR codes, RFID, and MFA
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components

## 🔐 Authentication Features

- **License Plate Recognition**: AI-powered OCR for automatic vehicle identification
- **QR Code Authentication**: Generate and scan QR codes for instant verification
- **RFID Card Support**: Contactless card-based authentication
- **Multi-Factor Authentication**: Configurable MFA with multiple verification methods
- **Authentication History**: Comprehensive audit logs and tracking
- **Real-time Confidence Scoring**: Authentication reliability indicators

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Wouter** - Lightweight routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Webcam** - Camera integration
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Passport.js** - Authentication
- **bcryptjs** - Password hashing
- **Express Sessions** - Session management
- **Zod** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **tsx** - TypeScript execution

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utilities and configurations
│       └── pages/         # Page components
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── db.ts            # Database connection
│   └── static.ts        # Static file serving
├── shared/               # Shared types and schemas
│   ├── routes.ts        # Route type definitions
│   └── schema.ts        # Database schemas
├── script/              # Build scripts
└── drizzle.config.ts    # Database configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd parking-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/parking_db
   NODE_ENV=development
   PORT=5000
   SESSION_SECRET=your-secret-key
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📊 Database Schema

### Users
- `id` - UUID primary key
- `username` - Unique username
- `password` - Hashed password

### Vehicles
- `id` - Serial primary key
- `ownerName` - Vehicle owner's name
- `vehicleNumber` - Unique vehicle registration number
- `vehicleType` - Type of vehicle (Car/Bike)
- `contactNumber` - Owner's contact number
- `imageUrl` - Vehicle image URL
- `createdAt` - Registration timestamp

### Parking Sessions
- `id` - Serial primary key
- `vehicleNumber` - Associated vehicle number
- `slotNumber` - Parking slot assignment
- `entryTime` - Vehicle entry timestamp
- `exitTime` - Vehicle exit timestamp
- `entryImageUrl` - Entry image capture
- `status` - Session status (PARKED/EXITED)
- `totalAmount` - Calculated parking fee

## 🔐 Authentication

The system uses Passport.js with local authentication strategy:
- Username/password-based login
- Session management with express-session
- Protected routes with authentication middleware
- Admin user seeding on server startup

## 💳 Payment System

- Automated fee calculation based on parking duration
- Support for different vehicle types with varying rates
- Real-time amount computation during exit process
- Payment history tracking

## 📈 Analytics

- Real-time dashboard with key metrics
- Vehicle entry/exit statistics
- Revenue tracking and visualization
- Parking slot utilization reports
- Interactive charts using Recharts

## 🎨 UI Components

Built with modern design principles:
- Responsive layout for all screen sizes
- Dark/light theme support
- Smooth animations and transitions
- Accessible components following ARIA standards
- Loading states and error handling

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema changes

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Zod for runtime validation
- Drizzle ORM for type-safe database operations

## 🚀 Deployment

### Production Build
1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the production server:
   ```bash
   npm run start
   ```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 5000)
- `SESSION_SECRET` - Session encryption key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using modern web technologies**
