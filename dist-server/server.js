import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Openthegate12)',
    database: 'star_fighter'
});
db.query(`
  CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    score INT
  )
`);
const saveScoreHandler = (req, res) => {
    const { name, score } = req.body;
    if (!name || typeof score !== 'number') {
        res.status(400).json({ error: 'Неверные данные' });
        return;
    }
    db.query('INSERT INTO scores (name, score) VALUES (?, ?)', [name, score], err => {
        if (err) {
            res.status(500).json({ error: 'Ошибка при сохранении' });
        }
        else {
            res.status(200).json({ message: 'Сохранено' });
        }
    });
};
app.post('/save-score', saveScoreHandler);
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
