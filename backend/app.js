// app.js

const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/users");
const diagnosesRoutes = require("./routes/diagnoses");
const patientRoutes = require("./routes/patient");

const app = express();
const PORT = process.env.PORT || 3002;

// Настройка CORS
app.use(
  cors({
    origin: ["http://10.111.74.28", "http://crm.m11.dzm",], // Добавлены все нужные домены
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Разрешенные методы
    allowedHeaders: ["Content-Type", "Authorization"], // Разрешенные заголовки
    credentials: true, // Разрешить отправку куки и других кросс-доменных данных
  })
);

// Обработка preflight-запросов (OPTIONS)
app.options("*", cors());

app.use(express.json());

// Маршруты API
app.use("/api", userRoutes);
app.use("/api", diagnosesRoutes);
app.use("/api", patientRoutes);

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

