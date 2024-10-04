const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/users");
const diagnosesRoutes = require("./routes/diagnoses");
const patientRoutes = require("./routes/patient");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(
  cors({
    origin: ["http://localhost:3000", 'http://10.111.74.28:3000'], 
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", diagnosesRoutes);
app.use("/api", patientRoutes)

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500; 
  const message = err.message || "На сервере произошла ошибка";
  res.status(statusCode).json({ message });
});

app.use((req, res, next) => {
  console.log(`Получен запрос: ${req.method} ${req.originalUrl}`);
  next();
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// app.get("/database", async (req, res) => {
//   try {
// 		const [rows, field] = await pool.query(`
// 		SELECT id, name, surname, patron, birthday, crm_status
// 		FROM people
// 	`);
//     console.log("Результат запроса:", rows);
//     res.json(rows);
//   } catch (err) {
//     console.error("Ошибка при выполнении запроса:", err);
//     res.status(500).json({ error: "Ошибка при выполнении запроса" });
//   }
// });
