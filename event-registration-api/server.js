const express = require("express");
const app = express();
const PORT = 3000;

// JSON request body parse karne ke liye middleware
app.use(express.json());

// In-memory array initial records ke saath
let registrations = [
  {
    id: 501,
    participantName: "Riya Sharma",
    eventName: "Tech Fest",
    department: "CSE",
    ticketCount: 2,
    paymentStatus: "Paid",
  },
  {
    id: 502,
    participantName: "Arjun Mehta",
    eventName: "Code Sprint",
    department: "IT",
    ticketCount: 1,
    paymentStatus: "Pending",
  },
  {
    id: 503,
    participantName: "Neha Verma",
    eventName: "Tech Fest",
    department: "ECE",
    ticketCount: 3,
    paymentStatus: "Paid",
  },
];

// Unique numeric ID generate karne ke liye counter
let nextId = 504;

// POST aur PUT requests ke liye validation helper
function validateRegistration(body) {
  const { participantName, eventName, department, ticketCount, paymentStatus } = body;

  // Check required string fields
  if (
    typeof participantName !== "string" ||
    participantName.trim() === "" ||
    typeof eventName !== "string" ||
    eventName.trim() === "" ||
    typeof department !== "string" ||
    department.trim() === ""
  ) {
    return "participantName, eventName, and department are required non-empty strings.";
  }

  // ticketCount positive integer hona chahiye
  if (
    typeof ticketCount !== "number" ||
    !Number.isInteger(ticketCount) ||
    ticketCount <= 0
  ) {
    return "ticketCount must be a positive integer.";
  }

  // paymentStatus sirf 'Paid' ya 'Pending' hona chahiye
  if (paymentStatus !== "Paid" && paymentStatus !== "Pending") {
    return 'paymentStatus must be either "Paid" or "Pending".';
  }

  return null;
}

// 1. GET all records
app.get("/api/registrations", (req, res) => {
  res.status(200).json(registrations);
});

// 6. Filter records by department (case-insensitive)
// IMPORTANT: Isse /:id se pehle declare karna zaroori hai
app.get("/api/registrations/filter", (req, res) => {
  const { department } = req.query;

  if (!department || typeof department !== "string") {
    return res.status(200).json([]);
  }

  const filtered = registrations.filter(
    (reg) => reg.department.toLowerCase() === department.trim().toLowerCase()
  );

  res.status(200).json(filtered);
});

// 7. GET pending registrations
// IMPORTANT: Isse bhi /:id se pehle declare karna zaroori hai
app.get("/api/registrations/pending", (req, res) => {
  const pendingRecords = registrations.filter(
    (reg) => reg.paymentStatus === "Pending"
  );

  res.status(200).json(pendingRecords);
});

// 3. GET registration by ID
app.get("/api/registrations/:id", (req, res) => {
  const id = Number(req.params.id);
  const registration = registrations.find((reg) => reg.id === id);

  if (!registration) {
    return res.status(404).json({
      error: `Registration with ID ${req.params.id} not found.`,
    });
  }

  res.status(200).json(registration);
});

// 2. POST a new record
app.post("/api/registrations", (req, res) => {
  const error = validateRegistration(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { participantName, eventName, department, ticketCount, paymentStatus } = req.body;

  const newRecord = {
    id: nextId++,
    participantName: participantName.trim(),
    eventName: eventName.trim(),
    department: department.trim(),
    ticketCount,
    paymentStatus,
  };

  registrations.push(newRecord);
  res.status(201).json(newRecord);
});

// 4. PUT / update a record
app.put("/api/registrations/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = registrations.findIndex((reg) => reg.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: `Registration with ID ${req.params.id} not found.`,
    });
  }

  const error = validateRegistration(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { participantName, eventName, department, ticketCount, paymentStatus } = req.body;

  const updatedRecord = {
    id,
    participantName: participantName.trim(),
    eventName: eventName.trim(),
    department: department.trim(),
    ticketCount,
    paymentStatus,
  };

  registrations[index] = updatedRecord;
  res.status(200).json(updatedRecord);
});

// 5. DELETE a record
app.delete("/api/registrations/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = registrations.findIndex((reg) => reg.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: `Registration with ID ${req.params.id} not found.`,
    });
  }

  const deletedRecord = registrations.splice(index, 1)[0];
  res.status(200).json({
    message: `Registration with ID ${id} deleted successfully.`,
    deletedRecord,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});