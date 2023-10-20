const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let userswithsamename = users.filter((user) =>{
    return user.username === username
  })

  if(userswithsamename.length >0){
    return true
  }else{
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return(user.username === username && user.password ===password)
  });

  if(validusers.length >0){
    return true
  }else {
    return false
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
 if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Check if the user is logged in (authenticated)
  if (!req.session.authorization) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Get the username of the logged-in user from the session
  const username = req.session.authorization.username;

  // Get the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Get the review text from the request query
  const reviewText = req.query.review;

  // Check if the book with the given ISBN exists in the 'books' data
  if (books[isbn]) {
    // Check if the user has already reviewed this book
    if (books[isbn].reviews[username]) {
      // If the user has already reviewed the book, update the existing review
      books[isbn].reviews[username] = reviewText;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      // If the user has not reviewed the book, add a new review
      books[isbn].reviews[username] = reviewText;
      return res.status(200).json({ message: "Review added successfully" });
    }
  } else {
    // If the book with the given ISBN doesn't exist, return an error
    return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  if (!req.session.authorization) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  const username = req.session.authorization.username;

  const isbn = req.params.isbn;

  // Check if the book with the given ISBN exists in the 'books' data
  if (books[isbn]) {
    const book = books[isbn];

    // Check if there is a review by the session username for that book
    if (book.reviews && book.reviews[username]) {
      // If a review by the session username exists, delete it
      delete book.reviews[username];
      res.status(200).json({ message: "Review deleted successfully." });
    } else {
      res.status(404).json({ message: "Review not found for the given ISBN." });
    }
  } else {
    res.status(404).json({ message: "Book not found for the given ISBN." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;