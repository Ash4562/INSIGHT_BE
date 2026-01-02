const express = require("express");
const mongoose = require("mongoose");
const connectDb = require("./src/db/db");
const adminAuthRouter = require("./src/routes/admin.Routes/admin.auth.");
const cookieParser = require("cookie-parser");
const adminCounsRouter = require("./src/routes/admin.Routes/admin.couns.routes");
const authMiddleware = require("./src/middlewares/auth");
const counsAuthRouter = require("./src/routes/counseller.Routes/counseller.auth.route");
const counStudentRouter = require("./src/routes/counseller.Routes/counseller.student.routes");
const RefreshAccess = require("./src/controllers/common.controllers/verify");
const r_Auth_Router = require("./src/routes/receptionist.Routes/recep.auth.routes");
const cors = require("cors");
const couns_ProfileRouter = require("./src/routes/counseller.Routes/counseller.profile.routes");
const recep_VisitsRouter = require("./src/routes/receptionist.Routes/recep.visits.routes");
const couns_VisitRouter = require("./src/routes/counseller.Routes/counseller.visits.route");
const recept_StudentRouter = require("./src/routes/receptionist.Routes/recep.students.routes");
const admin_StudentRouter = require("./src/routes/admin.Routes/admin.students.routes");
const recep_CounsRouter = require("./src/routes/receptionist.Routes/recep.couns.routes");
const {
  admin_Employee_Router,
} = require("./src/routes/admin.Routes/admin.employee.routes");
const admin_Fees_Router = require("./src/routes/admin.Routes/admin.fees.routes");
const couns_CoursesRouter = require("./src/routes/counseller.Routes/counseller.courses.routes");
const admin_SalaryRouter = require("./src/routes/admin.Routes/admin.salary.routes");
const { LogoutAuth } = require("./src/controllers/common.controllers/logout");
const couns_Payment_Router = require("./src/routes/counseller.Routes/counseller.payment.route");
const admin_Visit_Router = require("./src/routes/admin.Routes/admin.visit.routes");
const app = express();
const dotenv = require("dotenv").config();

let PORT = process.env.PORT || 3000;
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://insight-asi1.onrender.com",
      "https://insight-reception-fe.onrender.com",
      "https://insight-admin.onrender.com",
      "https://counsillorpanel.onrender.com",
      "https://insight-counsellor-panel.onrender.com"
    ],
    credentials: true,
  })
);

// Admin Routes
app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin/couns", authMiddleware, adminCounsRouter);
app.use("/api/v1/admin/students", authMiddleware, admin_StudentRouter);
app.use("/api/v1/admin/employee", authMiddleware, admin_Employee_Router);
app.use("/api/v1/admin/fees", authMiddleware, admin_Fees_Router);
app.use("/api/v1/admin/salary", authMiddleware, admin_SalaryRouter);
app.use("/api/v1/admin/visits", authMiddleware, admin_Visit_Router);
// app.use("/api/v1/admin/transactions", authMiddleware, admin_Transactions_Route);

// Refresh token for every route
app.post("/api/refresh", RefreshAccess);
app.post("/api/logout", LogoutAuth.Logout);

// Counselling Routes
app.use("/api/v1/auth/counseller", counsAuthRouter);
app.use("/api/v1/student/counseller", authMiddleware, counStudentRouter);
app.use("/api/v1/counseller/profile", authMiddleware, couns_ProfileRouter);
app.use("/api/v1/counseller/visitors", authMiddleware, couns_VisitRouter);
app.use("/api/v1/counseller/courses", authMiddleware, couns_CoursesRouter);
app.use("/api/v1/counseller/partial/payment", authMiddleware, couns_Payment_Router);
// app.use("/api/v1/counseller/partial/reciepts", authMiddleware, couns_Payment_Router);

// Reception Auth
app.use("/api/v1/auth/reception", r_Auth_Router);
app.use("/api/v1/visits/reception", authMiddleware, recep_VisitsRouter);
app.use("/api/v1/students/reception", authMiddleware, recept_StudentRouter);
app.use("/api/v1/counseller/reception", authMiddleware, recep_CounsRouter);

connectDb()
  .then(() => {
    console.log("Database Connected");
    app.listen(PORT, () => {
      console.log(`Server started on ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
