import mongoose from "mongoose";
import { User, Donation, ContactMessage } from "./db";

let isMongoConnected = false;

export async function connectToMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No MONGODB_URI environment variable detected. Running in offline file-based fallback mode.");
    return false;
  }

  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(uri);
    isMongoConnected = true;
    console.log("MongoDB connected successfully!");
    return true;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    isMongoConnected = false;
    return false;
  }
}

export function getIsMongoConnected(): boolean {
  return isMongoConnected;
}

// User Schema & Model
const MongoUserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ["donor", "ngo", "volunteer", "admin"] },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  organizationName: { type: String },
  avatar: { type: String },
  createdAt: { type: String, required: true }
});

export const MongoUser = mongoose.model("User", MongoUserSchema);

// Donation Schema & Model
const MongoDonationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  donorId: { type: String, required: true },
  donorName: { type: String, required: true },
  donorPhone: { type: String, required: true },
  donorAddress: { type: String, required: true },
  foodType: { type: String, required: true, enum: ["cooked", "raw", "packaged", "dry", "other"] },
  title: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: String, required: true },
  cookedTime: { type: String },
  expiryTime: { type: String, required: true },
  status: { type: String, required: true, enum: ["pending", "accepted", "assigned", "picked_up", "delivered", "cancelled"] },
  ngoId: { type: String },
  ngoName: { type: String },
  volunteerId: { type: String },
  volunteerName: { type: String },
  image: { type: String },
  pickupNotes: { type: String },
  deliveryNotes: { type: String },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true }
});

export const MongoDonation = mongoose.model("Donation", MongoDonationSchema);

// ContactMessage Schema & Model
const MongoContactSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: String, required: true }
});

export const MongoContact = mongoose.model("ContactMessage", MongoContactSchema);

// Load all database items from MongoDB
export async function loadFromMongo() {
  try {
    const users = await MongoUser.find({}).lean();
    const donations = await MongoDonation.find({}).lean();
    const contacts = await MongoContact.find({}).lean();

    return {
      users: users.map(u => {
        const { _id, __v, ...rest } = u as any;
        return rest;
      }) as User[],
      donations: donations.map(d => {
        const { _id, __v, ...rest } = d as any;
        return rest;
      }) as Donation[],
      contacts: contacts.map(c => {
        const { _id, __v, ...rest } = c as any;
        return rest;
      }) as ContactMessage[]
    };
  } catch (error) {
    console.error("Error loading data from MongoDB:", error);
    return null;
  }
}

// Sync local cache memory back to MongoDB (upserting changed elements, deleting removed ones)
export async function syncToMongo(data: { users: User[]; donations: Donation[]; contacts: ContactMessage[] }) {
  if (!isMongoConnected) return;

  try {
    // 1. Sync Users
    for (const user of data.users) {
      await MongoUser.findOneAndUpdate({ id: user.id }, user, { upsert: true, new: true });
    }
    const userIds = data.users.map(u => u.id);
    await MongoUser.deleteMany({ id: { $nin: userIds } });

    // 2. Sync Donations
    for (const donation of data.donations) {
      await MongoDonation.findOneAndUpdate({ id: donation.id }, donation, { upsert: true, new: true });
    }
    const donationIds = data.donations.map(d => d.id);
    await MongoDonation.deleteMany({ id: { $nin: donationIds } });

    // 3. Sync Contacts
    for (const contact of data.contacts) {
      await MongoContact.findOneAndUpdate({ id: contact.id }, contact, { upsert: true, new: true });
    }
    const contactIds = data.contacts.map(c => c.id);
    await MongoContact.deleteMany({ id: { $nin: contactIds } });

    console.log("Successfully synchronized MongoDB with current memory database state.");
  } catch (error) {
    console.error("Error synchronizing with MongoDB:", error);
  }
}
