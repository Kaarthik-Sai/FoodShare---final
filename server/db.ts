import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { connectToMongo, loadFromMongo, syncToMongo } from "./mongodb.js";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "donor" | "ngo" | "volunteer" | "admin";
  phone: string;
  address: string;
  organizationName?: string;
  avatar?: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorAddress: string;
  foodType: "cooked" | "raw" | "packaged" | "dry" | "other";
  title: string;
  description: string;
  quantity: string;
  cookedTime?: string;
  expiryTime: string;
  status: "pending" | "accepted" | "assigned" | "picked_up" | "delivered" | "cancelled";
  ngoId?: string;
  ngoName?: string;
  volunteerId?: string;
  volunteerName?: string;
  image?: string; // base64
  pickupNotes?: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  donations: Donation[];
  contacts: ContactMessage[];
}

// Global in-memory cache to prevent constant disk reads
let dbCache: DatabaseSchema | null = null;

function ensureDirectoryExistence() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function initDb() {
  ensureDirectoryExistence();
  
  const isMongoConnected = await connectToMongo();
  if (isMongoConnected) {
    const mongoData = await loadFromMongo();
    if (mongoData && mongoData.users.length > 0) {
      dbCache = mongoData;
      console.log("Database initialized successfully from MongoDB.");
      return;
    }
  }

  if (!isMongoConnected && fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      dbCache = JSON.parse(content);
      return;
    } catch (err) {
      console.error("Error reading database file, reinitializing...", err);
    }
  }

  // Create initial data
  console.log("Initializing database with demo accounts...");
  const salt = await bcrypt.genSalt(10);
  
  const users: User[] = [
    {
      id: "usr_admin",
      name: "App Moderator",
      email: "admin@foodshare.org",
      passwordHash: await bcrypt.hash("admin123", salt),
      role: "admin",
      phone: "+1 (555) 000-1111",
      address: "FoodShare Headquarters, Suite 100",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_donor1",
      name: "Chef John Martinez",
      email: "donor@example.com",
      passwordHash: await bcrypt.hash("donor123", salt),
      role: "donor",
      phone: "+1 (555) 123-4567",
      address: "Marriott Bistro, 789 Culinary Blvd, Downtown",
      organizationName: "Marriott Bistro",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_ngo1",
      name: "Feeding Hope Foundation",
      email: "ngo@example.com",
      passwordHash: await bcrypt.hash("ngo123", salt),
      role: "ngo",
      phone: "+1 (555) 987-6543",
      address: "123 Charity Way, Metro Area",
      organizationName: "Feeding Hope NGO",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_volunteer1",
      name: "Sam Green",
      email: "volunteer@example.com",
      passwordHash: await bcrypt.hash("volunteer123", salt),
      role: "volunteer",
      phone: "+1 (555) 456-7890",
      address: "456 Pine Street, Uptown",
      createdAt: new Date().toISOString()
    }
  ];

  const donations: Donation[] = [
    {
      id: "don_1",
      donorId: "usr_donor1",
      donorName: "Chef John Martinez",
      donorPhone: "+1 (555) 123-4567",
      donorAddress: "Marriott Bistro, 789 Culinary Blvd, Downtown",
      foodType: "cooked",
      title: "Freshly Cooked Veg Rice & Stew",
      description: "Excess healthy vegetarian meal prepared for an event. Packed in insulated containers.",
      quantity: "35 portions",
      cookedTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      expiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // expires in 6 hours
      status: "pending",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "don_2",
      donorId: "usr_donor1",
      donorName: "Chef John Martinez",
      donorPhone: "+1 (555) 123-4567",
      donorAddress: "Marriott Bistro, 789 Culinary Blvd, Downtown",
      foodType: "packaged",
      title: "Mixed Sandwiches & Fruit Cups",
      description: "Assorted pre-packaged sandwiches and fresh fruit cups from morning corporate catering.",
      quantity: "20 boxes",
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // expires tomorrow
      status: "accepted",
      ngoId: "usr_ngo1",
      ngoName: "Feeding Hope Foundation",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "don_3",
      donorId: "usr_donor1",
      donorName: "Chef John Martinez",
      donorPhone: "+1 (555) 123-4567",
      donorAddress: "Marriott Bistro, 789 Culinary Blvd, Downtown",
      foodType: "dry",
      title: "Canned Soups and Wheat Bread",
      description: "Non-perishable pantry items surplus from our monthly inventory.",
      quantity: "15 cans & 10 loaves",
      expiryTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // expires next month
      status: "delivered",
      ngoId: "usr_ngo1",
      ngoName: "Feeding Hope Foundation",
      volunteerId: "usr_volunteer1",
      volunteerName: "Sam Green",
      pickupNotes: "Collected from kitchen lobby.",
      deliveryNotes: "Delivered to community kitchen shelves.",
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString()
    }
  ];

  const contacts: ContactMessage[] = [
    {
      id: "msg_1",
      name: "Alice Vance",
      email: "alice@gmail.com",
      subject: "Partnership inquiries",
      message: "Hello! We are looking to enroll 3 more local branches as donors. Can you assist?",
      createdAt: new Date().toISOString()
    }
  ];

  dbCache = { users, donations, contacts };
  fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), "utf-8");
  
  await syncToMongo(dbCache);
}

export function getDb(): DatabaseSchema {
  if (!dbCache) {
    ensureDirectoryExistence();
    if (fs.existsSync(DB_FILE)) {
      dbCache = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } else {
      // Return temporary or run init synchronously
      dbCache = { users: [], donations: [], contacts: [] };
    }
  }
  return dbCache!;
}

export function saveDb(data: DatabaseSchema) {
  ensureDirectoryExistence();
  dbCache = data;
  fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), "utf-8");
  syncToMongo(dbCache).catch(err => {
    console.error("Failed to sync to MongoDB during saveDb:", err);
  });
}
