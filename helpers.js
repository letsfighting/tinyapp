const generateRandomString = () => {
  let index;
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    index = Math.floor(Math.random() * 63);
    result += characters.charAt(index);
  }

  return result;
};

const urlsForUser = (id, urlDatabase) => {
  let urlsMatched = {};
  for (const i in urlDatabase) {
    if (id === urlDatabase[i]["userID"]) {
      urlsMatched[i] = urlDatabase[i];
    }
  }
  console.log(urlsMatched);
  return urlsMatched;
};

const getUserByEmail = (email, database) => {
  let userByEmail = undefined;

  for (const p in database) {
    if (database[p]["email"] === email) {
      userByEmail = database[p]["id"];
    }
  }

  return userByEmail;
};

module.exports = { generateRandomString, urlsForUser, getUserByEmail };
