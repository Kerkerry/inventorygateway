import connection from "./db_connection.js";
import db_queries from "./db_queries.js";

const createUsersTable=()=>{
    const q=db_queries.createUsersTable();
    connection.query(q,(error,result)=>{
        if(error){
            console.log(`Error creating users table >>> ${error}`);
            return;
        }
        console.log(`Successfully created users table`);
    })
};

const createItemsUpdatedTable=()=>{
    const q=db_queries.createItemsUpdatedTable();
    connection.query(q,(error,result)=>{
        if(error){
            console.log(`Error creating items updated table >>> ${error}`);
            return;
        }
        console.log(`Successfully created items updated table`);
    })
};

const createErrorsTable=()=>{
    const q=db_queries.createErrorsTables();
    connection.query(q,(error,result)=>{
        if(error){
            console.log(`Error creating errors table >>> ${error}`);
            return;
        }
        console.log(`Successfully created errors table`);
    })
};

const createVeeqoTable=()=>{
    const q=db_queries.createVeeqoTable();
    connection.query(q,(error,result)=>{
        if(error){
            console.log(`Error creating veeqo table >>> ${error}`);
            return;
        }
        console.log(`Successfully created veeqo table`);
    })
};

const createSquarespaceTable=()=>{
    const q=db_queries.createSquareSpaceTable();
    connection.query(q,(error,result)=>{
        if(error){
            console.log(`Error creating squarespace table >>> ${error}`);
            return;
        }
        console.log(`Successfully created squarespace table`);
    })
};

const createSessionsTable=()=>{
    const q=db_queries.createSessionsTable();
    connection.query(q,(error,result)=>{
        if(error){
            console.log(`Error creating sessions table >>> ${error}`);
            return;
        }
        console.log(`Successfully created sessions table`);
    })
};

createUsersTable();
createItemsUpdatedTable();
createErrorsTable();
createVeeqoTable();
createSquarespaceTable();
createSessionsTable();

