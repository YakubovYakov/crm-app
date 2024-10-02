require("dotenv").config();

const mysql = require("mysql2/promise");
const { Client } = require("pg");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DB,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
	dateStrings: true,
});

const postgresClient = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});

postgresClient.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err.stack));

module.exports = {
  pool,
  postgresClient,
};


    
// const query = `
// select 
// mm.mdoc_get_num_format(md.num,md.year,md.num_org,md.num_filial,md.num_type,mdtp.id,mdtp.class,'IBN-YYYY-P')
// as card_number
// from mm.mdoc md
// inner join mm.mdoc_type mdtp ON mdtp.id = md.mdoc_type_id
// JOIN mm.people p on p.id=md.people_id
// WHERE md.SURNAME='САЛАХЕТДИНОВ' AND md.NAME='ЮРИЙ' AND md.PATRON='АЛЕКСАНДРОВИЧ'
// limit 100
// `; 


// return postgresClient.query(query);
// })
// .then((result) => {
// // Выводим данные в консоль
// console.log("Данные из базы данных PostgreSQL:");
// console.log(result.rows);
// })
// .catch((err) => {
// console.error("Ошибка подключения или запроса к PostgreSQL:", err);
// })
// .finally(() => {

// postgresClient.end();
// });
