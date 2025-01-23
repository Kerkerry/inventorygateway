// Successfully initiated launch of instance (i-016efebc6da6fbcec)
// https://www.sammeechward.com/deploying-full-stack-js-to-aws-ec2
import connection from "./db_connection.js"

const insertIntoErrors=(sku,error)=>`INSERT INTO errors (sku,error)VALUES("${sku}","${error}")`;

const insertIntoItemsUpdated=(sku,name,quantity)=> `INSERT INTO items_updated(sku,name,quantity) VALUES("${sku}","${name}",${quantity})`

const fetchItemsUpdated=()=>`SELECT*FROM items_updated`;

const fetchErrorsUpdated=()=>`SELECT*FROM errors`;

const fetchVeeqoItems=()=>`SELECT * FROM veeqo`;

const fecthSquarespaceItems=()=>`SELECT * FROM squarespace`;

const insertIntoVeeqo=(sku,name,quantity_available,total_quantity_sold,total_available_stock_level,total_stock_level,price,image,warehouses)=>`
    INSERT INTO veeqo(
        sku,
        name,
        quantity,
        total_quantity_sold,
        total_available_stock_level,
        total_stock_level,
        price,
        image
    )VALUES(
        "${sku}",
        "${name}",
        ${quantity_available},
        ${total_quantity_sold},
        ${total_available_stock_level},
        ${total_stock_level},
        ${price},
        "${image}"
    );
`;

const insertIntoSquarespace=(variant_id,sku,name,quantity)=>`
    INSERT INTO squarespace(
        variant_id,
        sku,
        name,
        quantity
    )VALUES(
        "${variant_id}",
        "${sku}",
        "${name}",
        ${quantity}
    );
`

const showCreateTable=(name)=>`SHOW CREATE TABLE ${name};`;

const signupuser=(useremail,password)=>`INSERT INTO users(email,password) VALUES("${useremail}","${password}");`

const signinuser=(email)=>`SELECT * FROM users WHERE email="${email}"`;

const createUsersTable=()=>`
        CREATE TABLE IF NOT EXISTS users(
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL
    );
`;
const createItemsUpdatedTable=()=>`
    CREATE TABLE IF NOT EXISTS items_updated (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sku VARCHAR(30) NOT NULL,
        name VARCHAR(255),
        quantity INT(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- New column for creation time
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
`;

const createErrorsTables=()=>`
    CREATE TABLE IF NOT EXISTS errors(
        id INT PRIMARY KEY AUTO_INCREMENT,
        sku VARCHAR(30) NOT NULL,
        error VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- New column for creation time
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
`;

const createVeeqoTable=()=>`
    CREATE TABLE IF NOT EXISTS veeqo(
        id INT PRIMARY KEY AUTO_INCREMENT,
        sku VARCHAR(30),
        name VARCHAR(255),
        quantity INT,
        total_quantity_sold INT,
        total_available_stock_level INT,
        total_stock_level INT,
        price DOUBLE(10,2),
        image TEXT
    );
`;

const createSquareSpaceTable=()=>`
    CREATE TABLE IF NOT EXISTS squarespace(
        id INT PRIMARY KEY AUTO_INCREMENT,
        variant_id VARCHAR(100),
        sku VARCHAR(30),
        name VARCHAR(255),
        quantity INT
    );
`

const createSessionsTable=()=>`
   CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY NOT NULL,
    sess JSON NOT NULL,
    expired DATETIME NOT NULL
  );
`;

const dropTable=(tablename)=>`DROP TABLE IF EXISTS ${tablename}; `


export default{
    insertIntoErrors,
    insertIntoItemsUpdated,
    insertIntoVeeqo,
    insertIntoSquarespace,
    fetchErrorsUpdated,
    fetchItemsUpdated,
    fetchVeeqoItems,
    fecthSquarespaceItems,
    signinuser,
    signupuser,
    // Creating and dropping tables
    createUsersTable,
    createItemsUpdatedTable,
    createErrorsTables,
    createVeeqoTable,
    createSquareSpaceTable,
    createSessionsTable,
    dropTable,
    showCreateTable
}