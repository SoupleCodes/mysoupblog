import express from 'express';
import sqlite3 from 'sqlite3';
sqlite3.verbose();

const app = express();
const port = 3000;
const db = new sqlite3.Database(':memory:');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Initialize database
db.serialize(() => {
    db.run("CREATE TABLE articles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, author TEXT, subject TEXT, content TEXT)");
});

// Routes
app.get('/', (req, res) => {
    db.all("SELECT * FROM articles", (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('index', { articles: rows });
    });
});

app.get('/article/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM articles WHERE id = ?", [id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (row) {
            res.render('article', { article: row });
        } else {
            res.status(404).send('Article not found');
        }
    });
});

app.get('/subject/:subject', (req, res) => {
    const subject = req.params.subject;
    db.all("SELECT * FROM articles WHERE subject = ?", [subject], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('subject', { articles: rows, subject });
    });
});

app.post('/add', (req, res) => {
    const { title, author, subject, content } = req.body;
    db.run("INSERT INTO articles (title, author, subject, content) VALUES (?, ?, ?, ?)", [title, author, subject, content], function(err) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.redirect('/');
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
