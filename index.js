require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const DATA_FILE = "data.json";

// Read books from file
const getBooks = () => {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
};

// Write books to file
const saveBooks = (books) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
};

// **CREATE**: Add a new book
app.post("/books", (req, res) => {
  const books = getBooks();
  const { book_id, title, author, genre, year, copies } = req.body;

  if (!book_id || !title || !author || !genre || !year || copies == null) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (books.some((book) => book.book_id === book_id)) {
    return res.status(400).json({ error: "Book ID already exists" });
  }

  books.push({ book_id, title, author, genre, year, copies });
  saveBooks(books);
  res.status(201).json({ message: "Book added successfully", book: req.body });
});

// **READ**: Get all books
app.get("/books", (req, res) => {
  res.json(getBooks());
});

// **READ**: Get a specific book by ID
app.get("/books/:id", (req, res) => {
  const books = getBooks();
  const book = books.find((b) => b.book_id === req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

// **UPDATE**: Update a book by ID
app.put("/books/:id", (req, res) => {
  const books = getBooks();
  const index = books.findIndex((b) => b.book_id === req.params.id);

  if (index === -1) return res.status(404).json({ error: "Book not found" });

  books[index] = { ...books[index], ...req.body };
  saveBooks(books);
  res.json({ message: "Book updated", book: books[index] });
});

// **DELETE**: Delete a book by ID
app.delete("/books/:id", (req, res) => {
  let books = getBooks();
  const newBooks = books.filter((b) => b.book_id !== req.params.id);

  if (books.length === newBooks.length)
    return res.status(404).json({ error: "Book not found" });

  saveBooks(newBooks);
  res.json({ message: "Book deleted successfully" });
});

// **Start the Server**
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
