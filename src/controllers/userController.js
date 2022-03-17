import bcrypt from 'bcrypt';
import { connection } from '../database.js';

export async function createUser(req, res) {
  const user = req.body;

  try {
    const existingUsers = await connection.query('SELECT * FROM users WHERE email=$1', [user.email])
    if (existingUsers.rowCount > 0) {
      return res.sendStatus(409);
    }

    const passwordHash = bcrypt.hashSync(user.password, 10);

    await connection.query(`
      INSERT INTO 
        users(name, email, password) 
      VALUES ($1, $2, $3)
    `, [user.name, user.email, passwordHash])

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getUser(req, res) {
  const { user } = res.locals;

  try {
    res.send(user);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getUserById(req, res) {
  const { id } = req.params;

  try {
    const userById = await connection.query(
      `SELECT u.id, u.name, (
        SELECT COUNT (uu."userId")
          FROM "urlsUsers" uu
          WHERE uu."userId" = $1) AS "visitCount",
        FROM users u
        `,[id]
    )

    const visits = await connection.query(
      `SELECT urls.*, (
        SELECT COUNT (uu."userId")
          FROM "urlsUsers" uu
          WHERE uu."userId" = $1 AND uu."urlId" = urls.id) AS "visitCount"
      )
        FROM urls
        WHERE urls.id = 
      `, [id]
    )

    res.send({ ...user.rows, visits })
  }catch(err){
    res.sendStatus(500);
  }
}