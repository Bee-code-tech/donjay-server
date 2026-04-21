import mongoose from "mongoose";
import dotenv from "dotenv";
import { createDeal } from "../controllers/deal.controller.js";
import User from "../models/user.model.js";
import Car from "../models/car.model.js";
import Deal from "../models/deal.model.js";

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Find a customer and an approved car not owned by them
        const customer = await User.findOne({ role: 'customer' });
        const car = await Car.findOne({ status: 'approved', owner: { $ne: customer._id } });

        if (!customer || !car) {
            console.error("Could not find test data");
            process.exit(1);
        }

        console.log(`Testing with Customer: ${customer.email}, Car: ${car.carName}`);

        const mockRes = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                this.data = data;
                return this;
            }
        };

        // 1. Try without receiptUrl
        const req1 = {
            user: customer,
            body: {
                dealType: 'buy',
                primaryCarId: car._id,
                offerPrice: 20000,
                customerContact: {
                    phone: '123456789',
                    email: customer.email
                }
            }
        };

        console.log("\nScenario 1: Creating Buy deal WITHOUT receiptUrl...");
        await createDeal(req1, mockRes);
        console.log("Status:", mockRes.statusCode);
        console.log("Response:", mockRes.data);

        if (mockRes.statusCode === 400 && mockRes.data.error === "Receipt URL is required for buy deals") {
            console.log("✅ Validation worked correctly (Failed as expected)");
        } else {
            console.log("❌ Validation failed");
        }

        // 2. Try WITH receiptUrl
        const req2 = {
            user: customer,
            body: {
                dealType: 'buy',
                primaryCarId: car._id,
                offerPrice: 20000,
                customerContact: {
                    phone: '123456789',
                    email: customer.email
                },
                receiptUrl: 'https://cloudinary.com/test-receipt.jpg'
            }
        };

        console.log("\nScenario 2: Creating Buy deal WITH receiptUrl...");
        await createDeal(req2, mockRes);
        console.log("Status:", mockRes.statusCode);
        
        if (mockRes.statusCode === 201) {
            console.log("✅ Deal created successfully");
            console.log("Saved Receipt URL:", mockRes.data.deal.receiptUrl);
            
            // Clean up
            await Deal.findByIdAndDelete(mockRes.data.deal._id);
            console.log("Cleaned up test deal");
        } else {
            console.log("❌ Deal creation failed:", mockRes.data);
        }

    } catch (err) {
        console.error("Test error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

test();
