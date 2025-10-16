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
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80",
      "https://images.unsplash.com/photo-1623869675781-80aa31cacc0e?w=800&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80",
      "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1593450146993-8f17c8e5cc77?w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
      "https://images.unsplash.com/photo-1622800881374-6e3134c82e77?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1610768764270-790fbec18178?w=800&q=80",
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&q=80",
      "https://images.unsplash.com/photo-1606611013016-969a3f1ee4ae?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1600705722821-c1a047873a1f?w=800&q=80",
      "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1599912027796-c1e0c9eb0af1?w=800&q=80",
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1618843479619-f08b29e2c1d8?w=800&q=80",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
      "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1622800881374-6e3134c82e77?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
      "https://images.unsplash.com/photo-1602549533694-5ca5d6943ce2?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80",
      "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?w=800&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
      "https://images.unsplash.com/photo-1606611013016-969a3f1ee4ae?w=800&q=80",
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&q=80"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      "https://images.unsplash.com/photo-1610768764270-790fbec18178?w=800&q=80"
    ],
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