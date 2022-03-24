const express = require("express");
const cookieSession = require("cookie-session");
const app = express(); // instantiate an express object for us to use
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080
const {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
} = require("./helpers");

const users = {};

const bodyParser = require("body-parser");

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs"); //set view engine to EJS

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

app.get("/", (req, res) => {
  const user = req.session.user_id;

  if (!users[user]) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
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

//starting here
app.get("/urls", (req, res) => {
  const user = req.session.user_id;

  if (users[user]) {
    const templateVars = {
      username: users[user],
      urls: urlsForUser(users[user]["id"], urlDatabase),
    };

    res.render("urls_index", templateVars);
  } else {
    const templateVars = {
      username: "",
      urls: "",
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;

  if (!users[user]) {
    res.redirect("/login");
  }

  const templateVars = {
    username: users[user],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  const user = req.session.user_id;
  console.log(user);

  if (!users[user]) {
    res.status(401);
    res.send("Error 401: Unauthorized");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL]["longURL"] = req.body.longURL;
    urlDatabase[shortURL]["userID"] = req.session.user_id;
    console.log(urlDatabase);
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user = req.session.user_id;

  if (!users[user]) {
    res.status(401);
    res.send("Error 401: Unauthorized - Please login first");
  } else if (urlDatabase[req.params.shortURL]) {
    if (user === urlDatabase[req.params.shortURL]["userID"]) {
      const templateVars = {
        username: users[user],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]["longURL"],
        owner: urlDatabase[req.params.shortURL]["userID"],
      };
      console.log(urlDatabase);
      res.render("urls_show", templateVars);
    } else {
      res.status(401);
      res.send("Error 401: Requested resource does not belong to the user");
    }
  } else {
    res.status(400);
    res.send("Error 400: Bad Request - shortURL ID invalid");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    console.log(longURL);
    res.redirect(longURL);
  } else {
    res.status(400);
    res.send("Error 400: Bad Request - shortURL ID invalid");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params); // Log the POST request body to the console in this case it returns the short URL

  const user = req.session.user_id;

  if (!users[user]) {
    res.status(401);
    res.send("Error 401: Unauthorized - Please login first");
  } else if (urlDatabase[req.params.shortURL]) {
    if (user === urlDatabase[req.params.shortURL]["userID"]) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      res.status(401);
      res.send("Error 401: Requested resource does not belong to the user");
    }
  } else {
    res.status(400);
    res.send("Error 400: Bad Request - shortURL ID invalid");
  }
});

app.get("/urls/:shortURL/edit", (req, res) => {
  console.log(req.params); // Log the POST request body to the console
  const shortURL = req.params.shortURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  console.log(req.params); // Log the POST request body to the console
  const shortURL = [req.params.shortURL];
  urlDatabase[shortURL]["longURL"] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  const user = req.session.user_id;
  const templateVars = {
    username: users[user],
  };
  res.render(`urls_login`, templateVars);
});

app.post("/login", (req, res) => {
  const userByEmail = getUserByEmail(req.body.email, users);
  if (userByEmail === undefined) {
    res.status(403);
    res.send("Error 403: Email address invalid");
  } else {
    if (
      users[userByEmail]["email"] === req.body.email &&
      bcrypt.compareSync(req.body.password, users[userByEmail]["password"])
    ) {
      const loggedInUserID = users[userByEmail]["id"];
      req.session.user_id = loggedInUserID;

      res.redirect("/urls");
    }

    res.status(403);
    res.send("Error 403: Password invalid");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
  console.log(users);
});

app.get("/register", (req, res) => {
  const user = req.session.user_id;
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
    const userByEmail = getUserByEmail(req.body.email, users);

    if (userByEmail !== undefined) {
      res.status(400);
      res.send("Error 404: Email Address was previously used");
    } else {
      let newID = generateRandomString();
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);

      users[newID] = {
        id: newID,
        email: req.body.email,
        password: hashedPassword,
      };

      console.log(users);

      req.session.userId = newID;
      res.redirect("/urls");
    }
  }
});
