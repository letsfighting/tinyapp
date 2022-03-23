const express = require("express");
const cookieParser = require("cookie-parser");
const app = express(); // instantiate an express object for us to use
const PORT = 8080; // default port 8080

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID", //lookup this
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const bodyParser = require("body-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString() {
  let index;
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    index = Math.floor(Math.random() * 63);
    result += characters.charAt(index);
  }

  return result;
}

app.set("view engine", "ejs"); //set view engine to EJS

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//start listening to requests on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = {
    username: users[user],
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = {
    username: users[user],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = {
    username: users[user],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params); // Log the POST request body to the console
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

app.get("/urls/:shortURL/edit", (req, res) => {
  console.log(req.params); // Log the POST request body to the console
  const shortURL = [req.params.shortURL];

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  console.log(req.params); // Log the POST request body to the console
  const shortURL = [req.params.shortURL];
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  console.log(username);
  res.cookie("username", username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = {
    username: users[user],
  };
  res.render(`urls_newUser`, templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send("Error 404: Email Address/Password fields cannot be blank");
  } else {
    for (let account in users) {
      if (users[account]["email"] === req.body.email) {
        res.status(400);
        res.send("Error 404: Email Address was previously used");
      }
    }

    let newID = generateRandomString();

    users[newID] = {
      id: newID,
      email: req.body.email,
      password: req.body.password,
    };

    console.log(users);

    res.cookie("user_id", newID);
    res.redirect("/urls");
  }
});
