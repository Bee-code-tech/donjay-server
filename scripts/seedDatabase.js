import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Car from "../models/car.model.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🎯 MongoDB Connected for seeding");
  } catch (error) {
    console.log("Database connection error:", error);
    process.exit(1);
  }
};

// Sample users data
const sampleUsers = [
  {
    name: "john_doe",
    email: "john.doe@example.com",
    password: "password123",
    phoneNumber: "+1234567890",
    role: "customer"
  },
  {
    name: "jane_smith",
    email: "jane.smith@example.com",
    password: "password123",
    phoneNumber: "+1234567891",
    role: "customer"
  },
  {
    name: "mike_wilson",
    email: "mike.wilson@example.com",
    password: "password123",
    phoneNumber: "+1234567892",
    role: "customer"
  },
  {
    name: "sarah_brown",
    email: "sarah.brown@example.com",
    password: "password123",
    phoneNumber: "+1234567893",
    role: "customer"
  },
  {
    name: "david_jones",
    email: "david.jones@example.com",
    password: "password123",
    phoneNumber: "+1234567894",
    role: "customer"
  },
  {
    name: "lisa_miller",
    email: "lisa.miller@example.com",
    password: "password123",
    phoneNumber: "+1234567895",
    role: "customer"
  },
  {
    name: "chris_davis",
    email: "chris.davis@example.com",
    password: "password123",
    phoneNumber: "+1234567896",
    role: "customer"
  },
  {
    name: "emma_garcia",
    email: "emma.garcia@example.com",
    password: "password123",
    phoneNumber: "+1234567897",
    role: "customer"
  },
  {
    name: "ryan_martin",
    email: "ryan.martin@example.com",
    password: "password123",
    phoneNumber: "+1234567898",
    role: "customer"
  },
  {
    name: "admin_user",
    email: "admin@donjay.com",
    password: "admin123",
    phoneNumber: "+1234567899",
    role: "admin"
  },
  {
    name: "alex_taylor",
    email: "alex.taylor@example.com",
    password: "password123",
    phoneNumber: "+1234567800",
    role: "customer"
  },
  {
    name: "nina_white",
    email: "nina.white@example.com",
    password: "password123",
    phoneNumber: "+1234567801",
    role: "customer"
  },
  {
    name: "tom_anderson",
    email: "tom.anderson@example.com",
    password: "password123",
    phoneNumber: "+1234567802",
    role: "customer"
  },
  {
    name: "zoe_thomas",
    email: "zoe.thomas@example.com",
    password: "password123",
    phoneNumber: "+1234567803",
    role: "customer"
  },
  {
    name: "mark_jackson",
    email: "mark.jackson@example.com",
    password: "password123",
    phoneNumber: "+1234567804",
    role: "customer"
  }
];

// Sample cars data
const sampleCars = [
  {
    carName: "Toyota Camry",
    year: 2022,
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "2.5L 4-cylinder",
    mileage: 25000,
    price: 28500,
    note: "Well maintained family sedan with excellent fuel economy",
    images: ["https://example.com/toyota-camry-1.jpg"],
    status: "approved"
  },
  {
    carName: "Honda Civic",
    year: 2023,
    condition: "new",
    transmission: "manual",
    fuelType: "petrol",
    engine: "2.0L 4-cylinder",
    mileage: 5000,
    price: 24900,
    note: "Brand new compact car, perfect for city driving",
    images: ["https://example.com/honda-civic-1.jpg"],
    status: "pending"
  },
  {
    carName: "Tesla Model 3",
    year: 2023,
    condition: "used",
    transmission: "automatic",
    fuelType: "electric",
    engine: "Electric Motor",
    mileage: 15000,
    price: 45000,
    note: "Electric vehicle with autopilot features",
    images: ["https://example.com/tesla-model3-1.jpg"],
    status: "approved"
  },
  {
    carName: "Ford F-150",
    year: 2021,
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "3.5L V6",
    mileage: 35000,
    price: 38000,
    note: "Reliable pickup truck for work and recreation",
    images: ["https://example.com/ford-f150-1.jpg"],
    status: "approved"
  },
  {
    carName: "BMW 3 Series",
    year: 2022,
    condition: "certified pre-owned",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "2.0L Turbo 4-cylinder",
    mileage: 18000,
    price: 42000,
    note: "Luxury sedan with premium features",
    images: ["https://example.com/bmw-3series-1.jpg"],
    status: "approved"
  },
  {
    carName: "Audi A4",
    year: 2023,
    condition: "new",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "2.0L TFSI",
    mileage: 2000,
    price: 48000,
    note: "Premium compact executive car",
    images: ["https://example.com/audi-a4-1.jpg"],
    status: "pending"
  },
  {
    carName: "Chevrolet Malibu",
    year: 2020,
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "1.5L Turbo",
    mileage: 45000,
    price: 22000,
    note: "Affordable midsize sedan with good features",
    images: ["https://example.com/chevy-malibu-1.jpg"],
    status: "approved"
  },
  {
    carName: "Nissan Altima",
    year: 2022,
    condition: "used",
    transmission: "cvt",
    fuelType: "petrol",
    engine: "2.5L 4-cylinder",
    mileage: 28000,
    price: 26500,
    note: "Comfortable ride with advanced safety features",
    images: ["https://example.com/nissan-altima-1.jpg"],
    status: "approved"
  },
  {
    carName: "Hyundai Elantra",
    year: 2023,
    condition: "new",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "2.0L 4-cylinder",
    mileage: 1000,
    price: 23500,
    note: "Stylish compact sedan with warranty",
    images: ["https://example.com/hyundai-elantra-1.jpg"],
    status: "pending"
  },
  {
    carName: "Mercedes C-Class",
    year: 2022,
    condition: "certified pre-owned",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "2.0L Turbo",
    mileage: 22000,
    price: 52000,
    note: "Luxury sedan with advanced technology",
    images: ["https://example.com/mercedes-c-class-1.jpg"],
    status: "approved"
  },
  {
    carName: "Volkswagen Jetta",
    year: 2021,
    condition: "used",
    transmission: "manual",
    fuelType: "petrol",
    engine: "1.4L TSI",
    mileage: 32000,
    price: 21000,
    note: "European engineering with good fuel economy",
    images: ["https://example.com/vw-jetta-1.jpg"],
    status: "approved"
  },
  {
    carName: "Subaru Outback",
    year: 2023,
    condition: "new",
    transmission: "cvt",
    fuelType: "petrol",
    engine: "2.5L Boxer",
    mileage: 500,
    price: 35000,
    note: "All-wheel drive SUV perfect for adventures",
    images: ["https://example.com/subaru-outback-1.jpg"],
    status: "pending"
  },
  {
    carName: "Mazda CX-5",
    year: 2022,
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "2.5L 4-cylinder",
    mileage: 20000,
    price: 29000,
    note: "Compact SUV with sporty handling",
    images: ["https://example.com/mazda-cx5-1.jpg"],
    status: "approved"
  },
  {
    carName: "Jeep Wrangler",
    year: 2021,
    condition: "used",
    transmission: "manual",
    fuelType: "petrol",
    engine: "3.6L V6",
    mileage: 38000,
    price: 33000,
    note: "Off-road capable with removable doors and roof",
    images: ["https://example.com/jeep-wrangler-1.jpg"],
    status: "approved"
  },
  {
    carName: "Lexus ES",
    year: 2023,
    condition: "new",
    transmission: "automatic",
    fuelType: "hybrid",
    engine: "2.5L Hybrid",
    mileage: 800,
    price: 46000,
    note: "Luxury hybrid sedan with premium interior",
    images: ["https://example.com/lexus-es-1.jpg"],
    status: "pending"
  },
  {
    carName: "Kia Optima",
    year: 2020,
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "2.4L 4-cylinder",
    mileage: 42000,
    price: 19500,
    note: "Reliable midsize sedan with long warranty",
    images: ["https://example.com/kia-optima-1.jpg"],
    status: "approved"
  },
  {
    carName: "Acura TLX",
    year: 2022,
    condition: "certified pre-owned",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "2.0L Turbo",
    mileage: 16000,
    price: 39000,
    note: "Sport luxury sedan with precision handling",
    images: ["https://example.com/acura-tlx-1.jpg"],
    status: "approved"
  },
  {
    carName: "Infiniti Q50",
    year: 2021,
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "3.0L Twin Turbo V6",
    mileage: 30000,
    price: 35500,
    note: "Performance sedan with advanced driver assistance",
    images: ["https://example.com/infiniti-q50-1.jpg"],
    status: "approved"
  },
  {
    carName: "Genesis G90",
    year: 2023,
    condition: "new",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "3.3L Twin Turbo V6",
    mileage: 200,
    price: 68000,
    note: "Full-size luxury sedan with premium amenities",
    images: ["https://example.com/genesis-g90-1.jpg"],
    status: "pending"
  },
  {
    carName: "Cadillac CT5",
    year: 2022,
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    engine: "2.0L Turbo",
    mileage: 24000,
    price: 41000,
    note: "American luxury sedan with bold styling",
    images: ["https://example.com/cadillac-ct5-1.jpg"],
    status: "approved"
  }
];

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedUsers = async () => {
  try {
    console.log("🌱 Seeding users...");

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { name: userData.name }]
      });

      if (existingUser) {
        console.log(`User ${userData.name} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await hashPassword(userData.password);
      const profilePic = `https://avatar.iran.liara.run/public/boy?username=${userData.name}`;

      const newUser = new User({
        ...userData,
        password: hashedPassword,
        profilePic,
        isVerified: true // Set as verified for seeded users
      });

      await newUser.save();
      console.log(`✅ Created user: ${userData.name}`);
    }

    console.log("✅ Users seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  }
};

const seedCars = async () => {
  try {
    console.log("🚗 Seeding cars...");

    // Get all users to assign as car owners
    const users = await User.find({ role: 'customer' });

    if (users.length === 0) {
      console.log("❌ No users found. Please seed users first.");
      return;
    }

    for (let i = 0; i < sampleCars.length; i++) {
      const carData = sampleCars[i];
      const randomUser = users[Math.floor(Math.random() * users.length)];

      const existingCar = await Car.findOne({
        carName: carData.carName,
        year: carData.year,
        owner: randomUser._id
      });

      if (existingCar) {
        console.log(`Car ${carData.carName} ${carData.year} already exists, skipping...`);
        continue;
      }

      const newCar = new Car({
        ...carData,
        owner: randomUser._id,
        approvedBy: carData.status === 'approved' ? randomUser._id : undefined,
        approvedAt: carData.status === 'approved' ? new Date() : undefined
      });

      await newCar.save();
      console.log(`✅ Created car: ${carData.carName} ${carData.year}`);
    }

    console.log("✅ Cars seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding cars:", error);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("🚀 Starting database seeding...");

    await seedUsers();
    await seedCars();

    console.log("🎉 Database seeding completed successfully!");

    // Show statistics
    const userCount = await User.countDocuments();
    const carCount = await Car.countDocuments();
    const approvedCars = await Car.countDocuments({ status: 'approved' });
    const pendingCars = await Car.countDocuments({ status: 'pending' });

    console.log("\n📊 Database Statistics:");
    console.log(`👥 Total Users: ${userCount}`);
    console.log(`🚗 Total Cars: ${carCount}`);
    console.log(`✅ Approved Cars: ${approvedCars}`);
    console.log(`⏳ Pending Cars: ${pendingCars}`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the seeding
seedDatabase();