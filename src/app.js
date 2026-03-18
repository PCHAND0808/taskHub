const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { z } = require("zod");

const app = express();
app.use(cors());
app.use(express.json());

let tasks = [];

//  Validation schema
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

app.post("/tasks", (req, res) => {
  try {
    // Validate input
    const data = taskSchema.parse(req.body);

    // Create new task
    const newTask = {
      id: uuidv4(),
      ...data,
    };

    // Store in memory
    tasks.push(newTask);

    res.status(201).json({
      message: "Task created successfully",
      data: newTask,
    });
  } catch (err) {
    res.status(400).json({
      message: "Validation failed",
      errors: err.errors,
    });
  }
});

app.get("/tasks", (req, res) => {
  try {
    console.log("Fetching tasks:", tasks);
    res.status(200).json({
      message: "Tasks fetched successfully",
      data: tasks
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong"
    });
  }
});


app.delete("/tasks/:id", (req, res) => {
  try {
  // Step 1: Check header
    const authHeader = req.headers["x-admin-auth"];

    if (authHeader !== "true") {
      return res.status(403).json({
        message: "Unauthorized: Missing or invalid admin header"
      });
    }

    const { id } = req.params;

    //  Step 2: Check if task exists
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Step 3: Remove task
    tasks.splice(taskIndex, 1);

    res.status(200).json({
      message: "Task deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: "Something went wrong"
    });
  }
});

// listen on port 3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
