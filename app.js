const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();

const dbPath = path.join(__dirname, "userData.db");

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const validPhonenumber = (phonenumber) => {
  return phonenumber.length < 10;
};

app.post("/register", async (request, response) => {
  const { name, email, phonenumber, address } = request.body;
  const hashedPhonenumber = await bcrypt.hash(phonenumber, 10);

  const selectUserQuery = `
    SELECT * FROM user WHERE name = '${name}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
      user (name, email, phonenumber, address)
      VALUES (
        '${name}',
        '${email}',
        '${hashedPhonenumber}',
        '${address}');`;
    if (validPhonenumner(phonenumner)) {
      await db.run(createUserQuery);
      response.status(200);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Phonenumber is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const { name, phonenumber } = request.body;

  const selectUserQuery = `
    SELECT * FROM user WHERE name='${name}';`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPhonenumberMatched = await bcrypt.compare(phonenumber, dbUser.phonenumber);
    if (isPhonenumberdMatched === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid phone number");
    }
  }
});

app.put("/change-phonenumber", async (request, response) => {
  const { username, oldPhonenumber, newPhonenumber } = request.body;
  const checkUserQuery = `
    SELECT * FROM user WHERE name='${name}';`;
  const dbUser = await db.get(checkUserQuery);

  if (dbUser === undefined) {
    response.status(400);
    response.send("User not Registered");
  } else {
    const isValidPassword = await bcrypt.compare(oldPhonenumber, dbUser.phonenumber);
    if (isValidPhonenumber === true) {
      const lengthOfPhonenumber = newPhonenumber.length;
      if (lengthOfPhonenumber < 10) {
        response.status(400);
        response.send("Phone number is too short");
      } else {
        const encryptPhonenumber = await bcrypt.hash(newPhonenumber, 10);
        const updateUserQuery = `
                UPDATE user set phonenumber='${encryptPhonenumber}'
                WHERE name = '${name}';`;
        await db.run(updateUserQuery);
        response.send("Phone number updated");
      }
    } else {
      response.status(400);
      response.send("Invalid current phone number");
    }
  }
});

module.exports = app;
