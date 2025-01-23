import connection from "./db_connection.js";
import db_queries from "./db_queries.js";
const dropErrorsTabe=()=>{
    const q=db_queries.dropTable('errors');
    connection.query(q,(error,result)=>{
        if(error){
            console.log(`Error dropping errors table`);   
        }

        console.log('Droped successfully >>> ',result);
        
    })
}

const dropItemsUpdatedTabe=()=>{
    const q=db_queries.dropTable('items_updated');
    connection.query(q,(error,result)=>{
        if(error){
            console.log(`Error dropping items updated table`);   
        }

        console.log('Droped successfully >>> ',result);
        
    })
}

const dropVeeqoTabe=()=>{
    const q=db_queries.dropTable('veeqo');
    connection.query(q,(error,result)=>{
        if(error){
            console.log(`Error dropping veeqo table`);   
        }

        console.log('Droped successfully >>> ',result);
        
    })
}

const dropSquarespaceTabe=()=>{
    const q=db_queries.dropTable('squarespace');
    connection.query(q,(error,result)=>{
        if(error){
            console.log(`Error dropping squarespace table`);   
        }

        console.log('Droped successfully >>> ',result);
        
    })
}

dropErrorsTabe();
dropItemsUpdatedTabe();
dropVeeqoTabe();
dropSquarespaceTabe();
