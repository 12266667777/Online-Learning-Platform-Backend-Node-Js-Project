const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const liveClassRoutes = require("./routes/liveclassRoutes");
const testRoutes = require("./routes/testRoutes");

const educatorRoutes = require("./routes/educatorRoutes");

const progressRoutes = require("./routes/progressRoutes");

const subscriptionRoutes = require("./routes/subscriptionRoutes");


const doubtRoutes = require("./routes/doubtRoutes");



const app = express();
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons",lessonRoutes);
app.use("/api/live-classes", liveClassRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/educators", educatorRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/doubts", doubtRoutes); 

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
