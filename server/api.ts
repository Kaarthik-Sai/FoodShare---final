import express, { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb, saveDb, User, Donation, ContactMessage } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "foodshare-super-secret-key-2026";

export const apiRouter = express.Router();

// Extends Request for authentication
export interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    role: "donor" | "ngo" | "volunteer" | "admin";
    name: string;
  };
}

// Middleware: Authenticate JWT
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Authentication token required" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Invalid or expired token" });
      return;
    }
    req.user = decoded as AuthenticatedRequest["user"];
    next();
  });
}

// Middleware: Optional Authenticate JWT
export function optionalAuthenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Token exists but is invalid/expired. Treat as guest
      next();
      return;
    }
    req.user = decoded as AuthenticatedRequest["user"];
    next();
  });
}

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Register User
apiRouter.post("/auth/register", async (req, res) => {
  const { name, email, password, role, phone, address, organizationName } = req.body;

  if (!name || !email || !password || !role || !phone || !address) {
    res.status(400).json({ message: "All required fields must be provided" });
    return;
  }

  const validRoles = ["donor", "ngo", "volunteer", "admin"];
  if (!validRoles.includes(role)) {
    res.status(400).json({ message: "Invalid user role selection" });
    return;
  }

  const db = getDb();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    res.status(400).json({ message: "An account with this email already exists" });
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: generateId("usr"),
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role as User["role"],
      phone,
      address,
      organizationName: role === "ngo" || role === "donor" ? organizationName : undefined,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb(db);

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user account" });
  }
});

// Login User
apiRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const db = getDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }

  try {
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: "An error occurred during authentication" });
  }
});

// Get Current User Profile
apiRouter.get("/auth/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const db = getDb();
  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) {
    res.status(404).json({ message: "User profile not found" });
    return;
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// ==========================================
// SYSTEM STATS ENDPOINT
// ==========================================
apiRouter.get("/stats", (req, res) => {
  const db = getDb();
  
  const totalDonations = db.donations.length;
  const activeDonations = db.donations.filter(d => ["pending", "accepted", "assigned", "picked_up"].includes(d.status)).length;
  const completedDonations = db.donations.filter(d => d.status === "delivered").length;
  const totalUsers = db.users.length;
  const totalNgos = db.users.filter(u => u.role === "ngo").length;
  const totalVolunteers = db.users.filter(u => u.role === "volunteer").length;
  const totalDonors = db.users.filter(u => u.role === "donor").length;

  // Derive "meals shared" from quantities (estimating average portions)
  let estimatedMeals = 0;
  db.donations.forEach(d => {
    if (d.status === "delivered") {
      const parsedQty = parseInt(d.quantity);
      if (!isNaN(parsedQty)) {
        estimatedMeals += parsedQty;
      } else {
        estimatedMeals += 15; // default average estimate per listing
      }
    }
  });

  res.json({
    totalDonations,
    activeDonations,
    completedDonations,
    totalUsers,
    totalNgos,
    totalVolunteers,
    totalDonors,
    estimatedMeals: estimatedMeals || 120 // Fallback minimum count for aesthetic fullness
  });
});

// ==========================================
// DONATION ENDPOINTS (CRUD & WORKFLOWS)
// ==========================================

// Get All Donations (filtered by roles and queries)
apiRouter.get("/donations", optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const user = req.user;
  let filtered = [...db.donations];

  // Role-based visibility filtering:
  if (user) {
    if (user.role === "donor") {
      // Donors only see their own donations
      filtered = filtered.filter(d => d.donorId === user.id);
    } else if (user.role === "ngo") {
      // NGOs see their own claimed/accepted/assigned donations AND any pending donations that are open for claiming
      filtered = filtered.filter(d => d.status === "pending" || d.ngoId === user.id);
    } else if (user.role === "volunteer") {
      // Volunteers see donations that are accepted by an NGO (ready for driver/volunteer claiming)
      // or assigned to themselves, or delivered/completed
      filtered = filtered.filter(d => 
        (d.status === "accepted" && !d.volunteerId) || 
        d.volunteerId === user.id || 
        (d.status === "delivered" && d.volunteerId === user.id)
      );
    }
    // Admins see all donations
  } else {
    // Guests see all active rescues (pending, or everything except cancelled)
    filtered = filtered.filter(d => d.status !== "cancelled");
  }

  // Sort by newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(filtered);
});

// Create Donation Listing
apiRouter.post("/donations", authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  if (user.role !== "donor" && user.role !== "admin") {
    res.status(403).json({ message: "Only registered donors can submit donation listings" });
    return;
  }

  const { title, description, quantity, foodType, cookedTime, expiryTime, image, pickupNotes } = req.body;

  if (!title || !description || !quantity || !foodType || !expiryTime) {
    res.status(400).json({ message: "Missing required food donation details" });
    return;
  }

  const db = getDb();
  const donorProfile = db.users.find(u => u.id === user.id);

  const newDonation: Donation = {
    id: generateId("don"),
    donorId: user.id,
    donorName: donorProfile?.name || user.name,
    donorPhone: donorProfile?.phone || "",
    donorAddress: donorProfile?.address || "",
    foodType: foodType as Donation["foodType"],
    title,
    description,
    quantity,
    cookedTime,
    expiryTime,
    status: "pending",
    image, // base64 representation of upload
    pickupNotes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.donations.push(newDonation);
  saveDb(db);

  res.status(201).json(newDonation);
});

// Get Single Donation details
apiRouter.get("/donations/:id", optionalAuthenticateToken, (req, res) => {
  const db = getDb();
  const donation = db.donations.find(d => d.id === req.params.id);

  if (!donation) {
    res.status(404).json({ message: "Donation listing not found" });
    return;
  }

  res.json(donation);
});

// Update Donation details (Only allowed for Donor, and only if state is still "pending")
apiRouter.put("/donations/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const db = getDb();
  const index = db.donations.findIndex(d => d.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ message: "Donation listing not found" });
    return;
  }

  const donation = db.donations[index];

  // Access check
  if (donation.donorId !== user.id && user.role !== "admin") {
    res.status(403).json({ message: "Forbidden: You are not the author of this listing" });
    return;
  }

  if (donation.status !== "pending" && user.role !== "admin") {
    res.status(400).json({ message: "Cannot edit donation after it has been claimed by an NGO" });
    return;
  }

  const { title, description, quantity, foodType, cookedTime, expiryTime, image, pickupNotes } = req.body;

  db.donations[index] = {
    ...donation,
    title: title || donation.title,
    description: description || donation.description,
    quantity: quantity || donation.quantity,
    foodType: foodType || donation.foodType,
    cookedTime: cookedTime || donation.cookedTime,
    expiryTime: expiryTime || donation.expiryTime,
    image: image !== undefined ? image : donation.image,
    pickupNotes: pickupNotes || donation.pickupNotes,
    updatedAt: new Date().toISOString()
  };

  saveDb(db);
  res.json(db.donations[index]);
});

// Patch Donation Status (Workflow operations)
apiRouter.patch("/donations/:id/status", authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { status, pickupNotes, deliveryNotes } = req.body;

  if (!status) {
    res.status(400).json({ message: "New status must be provided" });
    return;
  }

  const db = getDb();
  const index = db.donations.findIndex(d => d.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ message: "Donation listing not found" });
    return;
  }

  const donation = db.donations[index];
  const userProfile = db.users.find(u => u.id === user.id);

  // Workflow logic and role gates:
  if (status === "accepted") {
    // NGO claims the donation
    if (user.role !== "ngo" && user.role !== "admin") {
      res.status(403).json({ message: "Only registered NGOs can claim donations" });
      return;
    }
    if (donation.status !== "pending") {
      res.status(400).json({ message: "This donation has already been claimed or modified" });
      return;
    }
    donation.status = "accepted";
    donation.ngoId = user.id;
    donation.ngoName = userProfile?.organizationName || userProfile?.name || user.name;
  } 
  
  else if (status === "assigned") {
    // Volunteer accepts delivery assignment
    if (user.role !== "volunteer" && user.role !== "admin") {
      res.status(403).json({ message: "Only registered volunteers can accept delivery jobs" });
      return;
    }
    if (donation.status !== "accepted") {
      res.status(400).json({ message: "Donation must be claimed by an NGO first before delivery can be assigned" });
      return;
    }
    donation.status = "assigned";
    donation.volunteerId = user.id;
    donation.volunteerName = userProfile?.name || user.name;
  } 
  
  else if (status === "picked_up") {
    // Volunteer marks as picked up
    if (donation.volunteerId !== user.id && user.role !== "admin") {
      res.status(403).json({ message: "Only the assigned volunteer can update delivery status" });
      return;
    }
    if (donation.status !== "assigned") {
      res.status(400).json({ message: "Donation must be in assigned state to mark as picked up" });
      return;
    }
    donation.status = "picked_up";
    if (pickupNotes) donation.pickupNotes = pickupNotes;
  } 
  
  else if (status === "delivered") {
    // Volunteer marks as delivered
    if (donation.volunteerId !== user.id && user.role !== "admin") {
      res.status(403).json({ message: "Only the assigned volunteer can mark delivery completion" });
      return;
    }
    if (donation.status !== "picked_up" && donation.status !== "assigned") {
      res.status(400).json({ message: "Donation must be assigned or picked up before marking delivered" });
      return;
    }
    donation.status = "delivered";
    if (deliveryNotes) donation.deliveryNotes = deliveryNotes;
  } 
  
  else if (status === "cancelled") {
    // Original donor or NGO or Admin cancels
    const isOwner = donation.donorId === user.id;
    const isNgoClaimant = donation.ngoId === user.id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isNgoClaimant && !isAdmin) {
      res.status(403).json({ message: "You are not authorized to cancel this donation listing" });
      return;
    }
    donation.status = "cancelled";
  } 
  
  else {
    res.status(400).json({ message: "Invalid status state transition requested" });
    return;
  }

  donation.updatedAt = new Date().toISOString();
  db.donations[index] = donation;
  saveDb(db);

  res.json(donation);
});

// Delete Donation Listing (Only Admin or original donor if still pending)
apiRouter.delete("/donations/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const db = getDb();
  const index = db.donations.findIndex(d => d.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ message: "Donation listing not found" });
    return;
  }

  const donation = db.donations[index];

  if (donation.donorId !== user.id && user.role !== "admin") {
    res.status(403).json({ message: "Forbidden: You are not authorized to delete this listing" });
    return;
  }

  if (donation.status !== "pending" && user.role !== "admin") {
    res.status(400).json({ message: "Cannot delete donation once it is active in NGO claiming workflows" });
    return;
  }

  db.donations.splice(index, 1);
  saveDb(db);

  res.json({ message: "Donation listing successfully deleted" });
});

// ==========================================
// USER PROFILE ENDPOINTS
// ==========================================

// Update User Profile details
apiRouter.put("/users/profile", authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { name, phone, address, organizationName, avatar } = req.body;

  if (!name || !phone || !address) {
    res.status(400).json({ message: "Name, phone, and address are required" });
    return;
  }

  const db = getDb();
  const index = db.users.findIndex(u => u.id === user.id);

  if (index === -1) {
    res.status(404).json({ message: "User account profile not found" });
    return;
  }

  const existingProfile = db.users[index];

  db.users[index] = {
    ...existingProfile,
    name,
    phone,
    address,
    organizationName: existingProfile.role === "ngo" || existingProfile.role === "donor" ? organizationName : undefined,
    avatar: avatar || existingProfile.avatar,
  };

  saveDb(db);

  const { passwordHash: _, ...profileWithoutPassword } = db.users[index];
  res.json(profileWithoutPassword);
});

// ==========================================
// CONTACT / ENQUIRY ENDPOINTS
// ==========================================

// Create a Contact Enquiry
apiRouter.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400).json({ message: "Please complete all enquiry form fields" });
    return;
  }

  const db = getDb();
  const newMessage: ContactMessage = {
    id: generateId("msg"),
    name,
    email: email.toLowerCase(),
    subject,
    message,
    createdAt: new Date().toISOString()
  };

  db.contacts.push(newMessage);
  saveDb(db);

  res.status(201).json({ message: "Thank you for contacting us! We will get back to you shortly." });
});

// Get all Contact Messages (Admin only)
apiRouter.get("/contact", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ message: "Access restricted to administrators" });
    return;
  }

  const db = getDb();
  // Sort messages by newest first
  const sortedMessages = [...db.contacts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sortedMessages);
});
