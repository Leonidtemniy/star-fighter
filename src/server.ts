import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к базе данных
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'Openthegate12)',
  database: 'star_fighter'
});

// Создание таблицы, если не существует
db.query(
  `
  CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    score INT
  )
`,
  err => {
    if (err) {
      console.error('Ошибка при создании таблицы:', err);
    } else {
      console.log('Таблица scores готова');
    }
  }
);

// Обработчик сохранения счета
const saveScoreHandler: express.RequestHandler = (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== 'number') {
    res.status(400).json({ error: 'Неверные данные' });
    return;
  }

  db.query('INSERT INTO scores (name, score) VALUES (?, ?)', [name, score], err => {
    if (err) {
      console.error('Ошибка при сохранении в БД:', err);
      res.status(500).json({ error: 'Ошибка при сохранении' });
    } else {
      res.status(200).json({ message: 'Сохранено' });
    }
  });
};

// POST-запрос для сохранения результата
app.post('/save-score', saveScoreHandler);

// GET-запрос на корень
app.get('/leaderboard', (req, res) => {
  db.query('SELECT name, score FROM scores ORDER BY score DESC LIMIT 10', (err, results) => {
    if (err) {
      console.error('Ошибка получения лидерборда:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      res.json(results);
    }
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
