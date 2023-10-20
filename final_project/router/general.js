const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   res.send(JSON.stringify(books,null,4));
// });

public_users.get('/', function (req, res) {
  // Wrap the asynchronous operation in a Promise
  const getBooks = new Promise((resolve, reject) => {
    // Assuming 'books' is an object with book information
    if (books) {
      resolve(books);
    } else {
      reject("Error: Books not available.");
    }
  });

  // Handle the Promise using .then() and .catch()
  getBooks
    .then((bookData) => {
      // Send the book data as a JSON response
      res.json(bookData);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});


// Get book details based on ISBN
// public_users.get('/isbn/:isbn',function (req, res) {
//   const isbn = req.params.isbn
//   if(isbn){
//     res.send(JSON.stringify(books[isbn],null,4))
//   } else {
//     res.status(404).json({message: "Book with the ISBN not found"})
//   }
//  });
  
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  if (isbn) {
    // Wrap the asynchronous operation in a Promise
    const getBookDetails = new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book with the ISBN not found");
      }
    });

    // Handle the Promise using .then() and .catch()
    getBookDetails
      .then((book) => {
        // Send the book details as a JSON response
        res.json(book);
      })
      .catch((error) => {
        res.status(404).json({ message: error });
      });
  } else {
    res.status(400).json({ message: "Invalid ISBN provided" });
  }
});


// Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//   const author = req.params.author;
//   const bookKeys = Object.keys(books)

//   const authorBooks =[];

//   bookKeys.forEach((key) =>{
//     if (books[key].author === author){
//       authorBooks.push(books[key]);
//     }
//   });

//   if(authorBooks.length > 0){
//     res.json(authorBooks);
//   } else {
//     res.status(404).json({message: "Author not found"})
//   }
// });

public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const bookKeys = Object.keys(books);

    const authorBooks = [];

    for (const key of bookKeys) {
      if (books[key].author === author) {
        authorBooks.push(books[key]);
      }
    }

    if (authorBooks.length > 0) {
      res.json(authorBooks);
    } else {
      res.status(404).json({ message: "Author not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//   const title = req.params.title;
//   const bookKeys = Object.keys(books)

//   const titleBooks =[];

//   bookKeys.forEach((key) =>{
//     if (books[key].title === title){
//       titleBooks.push(books[key]);
//     }
//   });

//   if(titleBooks.length > 0){
//     res.json(titleBooks);
//   } else {
//     res.status(404).json({message: "Title not found"})
//   }
// });
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const response = await axios.get('http://localhost:5000/'); // Replace with your actual API endpoint

    if (response.status === 200) {
      const booksData = response.data;
      const booksArray = Object.values(booksData); // Convert the object to an array
      const titleBooks = booksArray.filter(book => book.title === title);

      if (titleBooks.length > 0) {
        res.json(titleBooks);
      } else {
        res.status(404).json({ message: `No books found with title "${title}"` });
      }
    } else {
      console.error('Request to the API failed with status code:', response.status);
      res.status(response.status).json({ message: 'Failed to fetch books.' });
    }
  } catch (error) {
    console.error('Error while making the request:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn
  if(isbn){
    res.send(JSON.stringify(books[isbn].reviews,null,4))
  } else {
    res.status(404).json({message: "Reviews not found"})
  }
});

module.exports.general = public_users;