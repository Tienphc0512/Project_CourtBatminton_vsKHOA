import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY; 
const secretKey = process.env.SECRET_KEY;

// Middleware
app.use(bodyParser.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Chatbot session endpoint
app.post("/chatbot/session", async (req, res) => {
  try {
    const response = await fetch("https://www.askyourdatabase.com/api/chatbot/v2/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        "chatbotid": "879d479f5a68b57e6067e83a83c73161",
        "name": "Sheldon",
        "email": "test@gmail.com"
      }),
    });

    const data = await response.json();
    res.json({ url: data.url });
  } catch (error) {
    console.error("Error creating chatbot session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Function to get logged-in user's ID
const getLoggedInCustomerId = async (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.CustomerID;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Admin check middleware
const isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Route to handle user login and generate token
app.post("/login", async (req, res) => {
  const { Name, PasswordHash } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM customers WHERE Name = ? AND PasswordHash = SHA2(?, 256)", [Name, PasswordHash]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const customer = rows[0];
    const token = jwt.sign({ CustomerID: customer.CustomerID, role: customer.role }, secretKey, { expiresIn: "1h" });
    res.json({
      user: {
        CustomerID: customer.CustomerID,
        Name: customer.Name,
        role: customer.role
      },
      token,
      role: customer.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Start of Admin routes
// Admin route to add a new court
app.post("/admin/courts", isAdmin, async (req, res) => {
  try {
    const { CourtName, PricePerHour, Conditions, Location, Status, Time1, Time2, Time3 } = req.body;

    await pool.query("INSERT INTO courts (CourtName, PricePerHour, Conditions, Location, Status, Time1, Time2, Time3) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [CourtName, PricePerHour, Conditions, Location, Status, Time1, Time2, Time3]);

    res.json({ success: "Court created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create court" });
  }
});

// Admin route to delete a court
app.delete("/admin/courts/:CourtID", isAdmin, async (req, res) => {
  try {
    const CourtID = parseInt(req.params.CourtID, 10);

    // Check if the court exists
    const [rows] = await pool.query("SELECT * FROM courts WHERE CourtID = ?", [CourtID]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Court not found" });
    }

    // Delete the court
    await pool.query("DELETE FROM courts WHERE CourtID = ?", [CourtID]);

    res.json({ success: "Court deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete court" });
  }
});

// Admin route to modify a court
app.patch("/admin/courts/:CourtID", async (req, res) => {
  try {
    const CourtID = parseInt(req.params.CourtID, 10);
    const { CourtName, PricePerHour, Conditions, Location, Status, Time1, Time2, Time3, Time1Status, Time2Status, Time3Status } = req.body;

    // Check if the court exists
    const [rows] = await pool.query("SELECT * FROM courts WHERE CourtID = ?", [CourtID]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Court not found" });
    }

    // Create an array to hold the fields to update and their values
    const fields = [];
    const values = [];

    if (CourtName !== undefined) {
      fields.push("CourtName = ?");
      values.push(CourtName);
    }
    if (PricePerHour !== undefined) {
      fields.push("PricePerHour = ?");
      values.push(PricePerHour);
    }
    if (Conditions !== undefined) {
      fields.push("Conditions = ?");
      values.push(Conditions);
    }
    if (Location !== undefined) {
      fields.push("Location = ?");
      values.push(Location);
    }
    if (Status !== undefined) {
      fields.push("Status = ?");
      values.push(Status);
    }
    if (Time1 !== undefined) {
      fields.push("Time1 = ?");
      values.push(Time1);
    }
    if (Time2 !== undefined) {
      fields.push("Time2 = ?");
      values.push(Time2);
    }
    if (Time3 !== undefined) {
      fields.push("Time3 = ?");
      values.push(Time3);
    }
    if (Time1Status !== undefined) {
      fields.push("Time1Status = ?");
      values.push(Time1Status);
    }
    if (Time2Status !== undefined) {
      fields.push("Time2Status = ?");
      values.push(Time2Status);
    }
    if (Time3Status !== undefined) {
      fields.push("Time3Status = ?");
      values.push(Time3Status);
    }

    //  return error if there are no fields
    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // query
    const sql = `UPDATE courts SET ${fields.join(", ")} WHERE CourtID = ?`;
    values.push(CourtID);

    // Update the court
    await pool.query(sql, values);

    res.json({ success: "Court updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update court" });
  }
});

// Admin route to delete court
app.delete("/admin/courts/:CourtID", isAdmin, async (req, res) => {
  try {
    const CourtID = parseInt(req.params.CourtID, 10);

    // Check if the court exists
    const [rows] = await pool.query("SELECT * FROM courts WHERE CourtID = ?", [CourtID]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Court not found" });
    }

    // Delete the court
    await pool.query("DELETE FROM courts WHERE CourtID = ?", [CourtID]);

    res.json({ success: "Court deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete court" });
  }
});

// Admin route to get all customers
app.get("/admin/customers", isAdmin, async (req, res) => {
  try {
    const [customers] = await pool.query("SELECT * FROM customers");
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Admin route to get all appointments
app.get("/admin/appointments", async (req, res) => {
  try {
    const [appointments] = await pool.query("SELECT * FROM appointments");
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

//End of Admin routes
// Route to create a new customer account
app.post("/createaccount", async (req, res) => {
  const { Name, PhoneNumber, Location, PasswordHash } = req.body;

  try {
    const [existingUser] = await pool.query("SELECT * FROM customers WHERE Name = ?", [Name]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    await pool.query(
      "INSERT INTO customers (Name, PhoneNumber, Location, PasswordHash) VALUES (?, ?, ?, SHA2(?, 256))",
      [Name, PhoneNumber, Location, PasswordHash]
    );

    res.json({ success: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Route to modify a customer's account information
app.patch("/modaccount", async (req, res) => {
  try {
    //const CustomerID = await getLoggedInCustomerId(req);
    const { CustomerID, Name, PhoneNumber, Location, PasswordHash } = req.body;

    // Create an array to hold the fields to update and their values
    const fields = [];
    const values = [];

    if (Name !== undefined) {
      fields.push("Name = ?");
      values.push(Name);
    }
    if (PhoneNumber !== undefined) {
      fields.push("PhoneNumber = ?");
      values.push(PhoneNumber);
    }
    if (Location !== undefined) {
      fields.push("Location = ?");
      values.push(Location);
    }
    if (PasswordHash !== undefined) {
      const hashedPassword = crypto.createHash('sha256').update(PasswordHash).digest('hex');
      //digest hex de luu data dang hex string, nhung ma tai sao??
      fields.push("PasswordHash = ?");
      values.push(hashedPassword);
    }

    // If no fields are provided, return an error
    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Construct the SQL query
    const sql = `UPDATE customers SET ${fields.join(", ")} WHERE CustomerID = ?`;
    values.push(CustomerID);

    // Update the account information
    await pool.query(sql, values);

    res.json({ success: "Account information updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update account information" });
  }
});

// Route to get all courts
app.get("/getcourts", async (req, res) => {
  try {
    const [courts] = await pool.query("SELECT * FROM courts");
    res.json(courts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch courts" });
  }
});

// Route to get logged in customer's account information
app.get("/getaccount", async (req, res) => {
  try {
    const CustomerID = await getLoggedInCustomerId(req);
    const [rows] = await pool.query("SELECT * FROM customers WHERE CustomerID = ?", [CustomerID]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch account information" });
  }
});

// Route to create a new appointment
// Route to create a new appointment
app.post("/createappointments", async (req, res) => {
  try {
    const CustomerID = await getLoggedInCustomerId(req);
    const { CourtID, Time, CourtName, CustomerName } = req.body;

    // Get Time1, Time2, Time3 from courts table
    const [rows] = await pool.query(`SELECT Time1, Time2, Time3 FROM courts WHERE CourtID = ?`, [CourtID]);

    // Log the entire result set to inspect its structure
    // console.log("Query Result:", rows);

    // Assuming rows is an array of objects
    if (rows.length === 0) {
      throw new Error("No court found with the given CourtID");
    }

    const TimeData = rows[0];
    // console.log("Time1:", TimeData.Time1);
    // console.log("Time2:", TimeData.Time2);
    // console.log("Time3:", TimeData.Time3);

    // Insert the appointment
    await pool.query(
      "INSERT INTO appointments (CustomerID, CourtID, Time, CourtName, CustomerName) VALUES (?, ?, ?, ?, ?)",
      [CustomerID, CourtID, Time, CourtName, CustomerName]
    );

    // Update the selected time slot status in the Courts table
    let timeSlotColumn;
    if (Time === TimeData.Time1) {
      timeSlotColumn = 'Time1Status';
    } else if (Time === TimeData.Time2) {
      timeSlotColumn = 'Time2Status';
    } else if (Time === TimeData.Time3) {
      timeSlotColumn = 'Time3Status';
    }

    if (timeSlotColumn) {
      await pool.query(`UPDATE courts SET ${timeSlotColumn} = 'Occupied' WHERE CourtID = ?`, [CourtID]);
    }

    res.json({ success: "Appointment created successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// Route to mark an appointment as missed and deduct points
app.patch("/missappointments/:AppointmentID/miss", async (req, res) => {
  try {
    const AppointmentID = parseInt(req.params.AppointmentID, 10);
    const { CourtID, Time } = req.body;

    const [rows] = await pool.query("SELECT Time1, Time2, Time3 FROM courts WHERE CourtID = ?", [CourtID]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Court not found" });
    }

    const TimeData = rows[0];

    let timeSlotColumn;
    if (Time === TimeData.Time1) {
      timeSlotColumn = 'Time1Status';
    } else if (Time === TimeData.Time2) {
      timeSlotColumn = 'Time2Status';
    } else if (Time === TimeData.Time3) {
      timeSlotColumn = 'Time3Status';
    }

    if (timeSlotColumn) {
      await pool.query(`UPDATE courts SET ${timeSlotColumn} = 'Free' WHERE CourtID = ?`, [CourtID]);
    }

    // Mark appointment as missed
    await pool.query("UPDATE appointments SET Status = 'Missed' WHERE AppointmentID = ?", [
      AppointmentID,
    ]);

    // Deduct points from the customer
    await pool.query("UPDATE customers SET CreditScore = CreditScore - 1 WHERE CustomerID = (SELECT CustomerID FROM appointments WHERE AppointmentID = ?)", [
      AppointmentID,
    ]);

    res.json({ success: "Appointment marked as missed and customer's points is deducted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to mark appointment as missed" });
  }
});

// Route to mark an appointment as Completed
app.patch("/completeappointments/:AppointmentID/complete", async (req, res) => {
  try {
    const AppointmentID = parseInt(req.params.AppointmentID, 10);
    const { CourtID, Time } = req.body;

    const [rows] = await pool.query("SELECT Time1, Time2, Time3 FROM courts WHERE CourtID = ?", [CourtID]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Court not found" });
    }

    const TimeData = rows[0];

    let timeSlotColumn;
    if (Time === TimeData.Time1) {
      timeSlotColumn = 'Time1Status';
    } else if (Time === TimeData.Time2) {
      timeSlotColumn = 'Time2Status';
    } else if (Time === TimeData.Time3) {
      timeSlotColumn = 'Time3Status';
    }

    if (timeSlotColumn) {
      await pool.query(`UPDATE courts SET ${timeSlotColumn} = 'Free' WHERE CourtID = ?`, [CourtID]);
    }

    // Mark appointment as completed
    await pool.query("UPDATE appointments SET Status = 'Completed' WHERE AppointmentID = ?", [
      AppointmentID,
    ]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to mark appointment as completed" });
  }
});

// Route to get all appointments for the logged in customer
app.get("/getappointments", async (req, res) => {
  try {
    const CustomerID = await getLoggedInCustomerId(req);
    const [appointments] = await pool.query(
      "SELECT * FROM appointments WHERE CustomerID = ?",
      [CustomerID]
    );
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Route to delete an appointment
app.delete("/deleteappointments/:AppointmentID", async (req, res) => {
  try {
    const AppointmentID = parseInt(req.params.AppointmentID, 10);

    // Check if the appointment exists 
    const [rows] = await pool.query("SELECT * FROM appointments WHERE AppointmentID = ?", [AppointmentID]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Delete the appointment
    await pool.query("DELETE FROM appointments WHERE AppointmentID = ?", [AppointmentID]);

    res.json({ success: "Appointment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

//Set appointment as OnGoing
app.patch("/ongoingappointments/:AppointmentID/ongoing", async (req, res) => {
  try {
    const AppointmentID = parseInt(req.params.AppointmentID, 10);

    // Mark appointment as OnGoing
    await pool.query("UPDATE appointments SET Status = 'OnGoing' WHERE AppointmentID = ?", [
      AppointmentID,
    ]);

    res.json({ success: "Appointment marked as OnGoing" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to mark appointment as OnGoing" });
  }
});

app.patch("/cancelappointments/:AppointmentID/cancel", async (req, res) => {
  try {
    const AppointmentID = parseInt(req.params.AppointmentID, 10);
    const { CourtID, Time } = req.body;

    const [rows] = await pool.query("SELECT Time1, Time2, Time3 FROM courts WHERE CourtID = ?", [CourtID]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Court not found" });
    }

    const TimeData = rows[0];

    let timeSlotColumn;
    if (Time === TimeData.Time1) {
      timeSlotColumn = 'Time1Status';
    } else if (Time === TimeData.Time2) {
      timeSlotColumn = 'Time2Status';
    } else if (Time === TimeData.Time3) {
      timeSlotColumn = 'Time3Status';
    }

    if (timeSlotColumn) {
      await pool.query(`UPDATE courts SET ${timeSlotColumn} = 'Free' WHERE CourtID = ?`, [CourtID]);
    }

    // Mark appointment as completed
    await pool.query("DELETE FROM appointments WHERE AppointmentID = ?", [
      AppointmentID,
    ]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

// route to confirm payment of appointment
app.patch("/confirmappointments/:AppointmentID/confirm", async (req, res) => {
  try {
    const AppointmentID = parseInt(req.params.AppointmentID, 10);

    // Mark appointment as completed
    await pool.query("UPDATE appointments SET payment = 'Confirmed' WHERE AppointmentID = ?", [
      AppointmentID,
    ]);

    res.json({ success: "Appointment payment confirmed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to confirm appointment payment" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});