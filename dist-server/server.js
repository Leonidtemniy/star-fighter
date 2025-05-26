// Импорт необходимых библиотек
import express from 'express'; // Веб-фреймворк для создания API
import mysql from 'mysql2'; // MySQL клиент
import cors from 'cors'; // Middleware для разрешения CORS-запросов
// Инициализация приложения
const app = express();
const PORT = 3001;
// --- Middleware ---
// Разрешаем CORS, чтобы можно было обращаться к серверу с браузера
app.use(cors());
// Разрешаем серверу автоматически парсить JSON в теле запросов
app.use(express.json());
// --- Подключение к базе данных ---
const db = mysql.createConnection({
    host: '127.0.0.1', // Локальный хост (localhost)
    user: 'root', // Имя пользователя MySQL
    password: 'Openthegate12)', // Пароль пользователя
    database: 'star_fighter' // Название базы данных
});
// --- Создание таблицы, если она не существует ---
db.query(`
  CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Уникальный ID
    name VARCHAR(255),                -- Имя игрока
    score INT                         -- Очки игрока
  )
`, err => {
    if (err) {
        console.error('Ошибка при создании таблицы:', err); // Вывод ошибки, если не удалось создать
    }
    else {
        console.log('Таблица scores готова'); // Успешное сообщение
    }
});
// --- Обработчик POST-запроса для сохранения счета ---
const saveScoreHandler = (req, res) => {
    const { name, score } = req.body;
    // Валидация: имя должно быть строкой, а score — числом
    if (!name || typeof score !== 'number') {
        res.status(400).json({ error: 'Неверные данные' });
        return;
    }
    // Запрос в базу данных для вставки новой записи
    db.query('INSERT INTO scores (name, score) VALUES (?, ?)', [name, score], err => {
        if (err) {
            console.error('Ошибка при сохранении в БД:', err);
            res.status(500).json({ error: 'Ошибка при сохранении' });
        }
        else {
            res.status(200).json({ message: 'Сохранено' });
        }
    });
};
// --- Маршрут POST для сохранения счета ---
app.post('/save-score', saveScoreHandler);
// --- Маршрут GET для получения лидерборда ---
app.get('/leaderboard', (_req, res) => {
    console.log('Запрос на /leaderboard');
    // Получение 10 лучших результатов из базы, сортированных по убыванию score
    db.query('SELECT name, score FROM scores ORDER BY score DESC LIMIT 10', (err, results) => {
        if (err) {
            console.error('Ошибка получения лидерборда:', err);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
        else {
            res.json(results); // Возврат списка лидеров в формате JSON
        }
    });
});
// --- Запуск сервера ---
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
