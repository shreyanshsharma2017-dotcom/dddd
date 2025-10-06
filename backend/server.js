// Admin: Get all attendance records with user info
// ...existing code...
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");



const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));  // allow up to 50 MB
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Create router for /admin endpoints
const router = express.Router();

// ================= MongoDB Connection =================
mongoose.connect("mongodb://127.0.0.1:27017/login_app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// GET /admin/progress → fetch all tasks
router.get("/progress", async (req, res) => {
  try {
    const tasks = await ProgressTask.find().sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /admin/progress → create a new task
router.post("/progress", async (req, res) => {
  try {
    const { name, progress, assignedTo, dueDate } = req.body;
    const newTask = new ProgressTask({ name, progress, assignedTo, dueDate });
    await newTask.save();
    res.json({ success: true, task: newTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// routes/admin.js
router.post("/assign-member", async (req, res) => {
  try {
    const { taskId, memberId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.json({ success: false, message: "Task not found" });

    // Avoid duplicates
    if (!task.assignedTo.includes(memberId)) {
      task.assignedTo.push(memberId);
    }

    await task.save();
    res.json({ success: true, message: "Member assigned successfully", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Mount the router to /admin
app.use("/admin", router);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // store in uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage });

// Upload profile picture & update user record
router.post("/:id", upload.single("profilePic"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic: `/uploads/${req.file.filename}` },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
/* Progress Task Schema */
const progressTaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  progress: { type: Number, default: 0 }, // 0-100
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  dueDate: { type: Date } // optional
}, { timestamps: true });


// ================= Schemas =================
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  address: String,
  phone: String,
  avatar: String, // URL to avatar image
  role: { type: String, default: "User" }, // "User" or "Admin"
});

const AttendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: String,
  status: String,
});

const LeaveRequestSchema = new mongoose.Schema({
  name: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  from: String,
  to: String,
  reason: String,
  status: { type: String, default: "Pending" },
});

const PayrollSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  month: String,
  salary: Number,
  status: String,
});

const AnnouncementSchema = new mongoose.Schema({
  title: String,
  message: String,
  date: { type: Date, default: Date.now },
});


const TaskSchema = new mongoose.Schema({
  name: String,
  progress: Number,
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }]
});

const MemberSchema = new mongoose.Schema({
  name: String,
  status: String
});


// ================= Models =================
const User = mongoose.model("User", UserSchema);
const Attendance = mongoose.model("Attendance", AttendanceSchema);
const LeaveRequest = mongoose.model("LeaveRequest", LeaveRequestSchema);
const Payroll = mongoose.model("Payroll", PayrollSchema);
const Announcement = mongoose.model("Announcement", AnnouncementSchema);
const ProgressTask = mongoose.model("ProgressTask", progressTaskSchema);

// ================= Middleware =================
// Promote a user to admin (for setup/debug)
app.put("/make-admin/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
const isAdmin = async (req, res, next) => {
  const userId = req.header("userId");
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const user = await User.findById(userId);
  if (!user || typeof user.role !== "string" || user.role.toLowerCase() !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  req.user = user;
  next();
};

// ================= Auth APIs =================
app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const [firstName, ...lastParts] = fullName.split(" ");
    const lastName = lastParts.join(" ");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ firstName, lastName, email, password: hashedPassword, role: role || "User" });
    await newUser.save();
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    res.json({
      success: true,
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= User Dashboard APIs =================
// Analytics endpoint
app.get("/analytics", async (req, res) => {
  try {
    const { email } = req.query;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Example analytics data (customize as needed)
    const totalEmployees = await User.countDocuments();
    const leavesTaken = await LeaveRequest.countDocuments({ userId: user._id });
    const attendanceRecords = await Attendance.find({ userId: user._id });
    const present = attendanceRecords.filter(a => a.status === "Present").length;
    const absent = attendanceRecords.filter(a => a.status === "Absent").length;
    const late = attendanceRecords.filter(a => a.status === "Late").length;
    const attendanceRate = present + absent + late > 0 ? Math.round((present / (present + absent + late)) * 100) : 0;
    const payrollProcessed = await Payroll.countDocuments({ userId: user._id });

    res.json({
      success: true,
      analytics: {
        totalEmployees,
        leavesTaken,
        attendanceRate,
        payrollProcessed
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/attendance/:userId", async (req, res) => {
  try {
    const attendance = await Attendance.find({ userId: req.params.userId });
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/leave-request", async (req, res) => {
  try {
    const { userId, from, to, reason } = req.body;

    // Fetch user to get name
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const leave = new LeaveRequest({
      userId,
      name: user.firstName + " " + user.lastName, // store full name
      from,
      to,
      reason
    });

    await leave.save();
    res.json({ success: true, message: "Leave request submitted", leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



// User can view their own leave requests
app.get("/leave-request/:userId", async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ userId: req.params.userId });
    res.json({ success: true, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


app.get("/payroll/:userId", async (req, res) => {
  try {
    const payroll = await Payroll.find({ userId: req.params.userId });
    res.json({ success: true, payroll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all announcements
app.get("/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find({});
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Post a new announcement (admin or user)
app.post("/announcements", async (req, res) => {
  try {
    const { title, message } = req.body;
    const announcement = new Announcement({ title, message });
    await announcement.save();
    res.json({ success: true, message: "Announcement created", announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete an announcement (admin or user)
app.delete("/announcements/:id", async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    res.json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= Admin Dashboard APIs =================
// Admin: Get all team members
app.get("/admin/team-members", async (req, res) => {
  try {
    const members = await User.find({}, "name email role avatar");
    res.json({ success: true, members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// All admin routes protected by isAdmin middleware
app.get("/admin/employees", isAdmin, async (req, res) => {
// Admin: Get all attendance records with user info
app.get("/admin/attendance", isAdmin, async (req, res) => {
  try {
    const attendance = await Attendance.find({}).populate('userId', 'firstName lastName email');
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
  try {
    const employees = await User.find({});
    res.json({ success: true, employees });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch employees" });
  }
});

// Admin can approve or reject a leave request
app.put("/admin/leave-requests/:id", isAdmin, async (req, res) => {
  try {
    const { status } = req.body; // must be "Approved" or "Rejected"
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // update + populate user info
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'firstName lastName email')


    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }

    res.json({ success: true, message: "Leave request updated", leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/admin/users/:id/role", isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update role" });
  }
});

app.get("/admin/leave-requests", isAdmin, async (req, res) => {
  try {
  const leaveRequests = await LeaveRequest.find({}).populate('userId', 'firstName lastName email')
;
  res.json({ success: true, leaveRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/admin/payroll", isAdmin, async (req, res) => {
  try {
    const payroll = await Payroll.find({}).populate("userId", "name email");
    res.json({ success: true, payroll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/admin/announcements", isAdmin, async (req, res) => {
  try {
    const announcements = await Announcement.find({});
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Create new announcement
app.post("/admin/announcements", isAdmin, async (req, res) => {
  try {
    const { title, message } = req.body;
    const announcement = new Announcement({ title, message });
    await announcement.save();
    res.json({ success: true, message: "Announcement created", announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update an announcement
app.put("/admin/announcements/:id", isAdmin, async (req, res) => {
  try {
    const { title, message } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, message },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    res.json({ success: true, message: "Announcement updated", announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete an announcement
app.delete("/admin/announcements/:id", isAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    res.json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Get user info by ID
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update user profile
app.put("/users/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, phone, address, avatar },
      { new: true } // return the updated document
    );

    if (!updatedUser)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= Start Server =================
app.listen(5000, () => console.log("Server running on port 5000"));
