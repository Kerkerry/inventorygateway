import mysql from 'mysql2'

const connection = mysql.createConnection(
    // {
    //     host:'localhost',
    //     user: process.env.DB_USER,
    //     password:process.env.DB_PASSWORD,
    //     database:'inventory',
    //     port:process.env.DB_PORT
    // }
    {
        host:'localhost',
        user: 'root',
        password:'',
        database:'inventory',
        port:process.env.DB_PORT
    }
);

export default connection;

