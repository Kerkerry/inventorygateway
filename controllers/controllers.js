import https from 'https';
import crypto from 'crypto';
import cron from 'node-cron';
import dotenv from 'dotenv';
import queries from '../models/db_queries.js';
import connection from '../models/db_connection.js';
import bcrypt from 'bcrypt';
dotenv.config({path:"credentials.env"});
//a function to generate Idempotency key
const generateIdempotencyKey=()=>crypto.randomBytes(32).toString('hex');
// User Agent
const userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
// Filtering items from veeqo
const filterSimilarItems=(squarespaceItems, veeqoItems)=> {
  const squarespaceskus=new Set(squarespaceItems.map(item=>item.sku))
  const veeqofiltered=veeqoItems.filter(item=>squarespaceskus.has(item.sku))
  return veeqofiltered;
}

// Hasing the password
const hashPassword=async(password) =>{
  try {
    const saltRounds = 10; // Adjust this value to increase security (higher is slower)
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash; 
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error; // Handle the error appropriately in your application
  }
}

// Comparing the hashed password and the password
const comparePassword=async(password, hash)=> {
  try {
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error; // Handle the error appropriately
  }
}

// Create items updated table
const createItemsUpdatedTable=()=>{
  const q=queries.createItemsUpdatedTable();
  connection.query(q,(error,result)=>{
    if(error){
      console.log('Error creating items updated table: ',error);
      return;
    }
    console.log('Success creating items updated table');
  })
}
// Dropping items updated table
const dropItemsUpdatedTable=()=>{
  const q=queries.dropTable('items_updated');
  connection.query(q,(error,result)=>{
    if(error){
      console.log('Error dropping items updated table: ',error);
      return;
    }
    console.log('Success dropping items updated table');
  })
}

// Creating the error table
const createErrorsTable=()=>{
  const q=queries.createErrorsTables();
  connection.query(q,(error,result)=>{
    if(error){
      console.log('Error creating errors table: ',error);
      return;
    }
    console.log('Success creating errors table');
  })
}

// Dropping errors table
const dropErrorsTable=()=>{
  const q=queries.dropTable('errors');
  connection.query(q,(error,result)=>{
    if(error){
      console.log('Error dropping errors table: ',error);
      return;
    }
    console.log('Success dropping errors table');
  })
}

// Creating veeqo table
const createVeeqoTable=()=>{
  const q=queries.createVeeqoTable();
  connection.query(q,(error,result)=>{
    if(error){
      console.log(`Error creating veeqo table>>>>${error}`);
    }
    console.log(`Successfully created veeqo table`);
  })
}
// drooping veeqo table
const dropVeeqotable=()=>{
  const q=queries.dropTable('veeqo');
  connection.query(q,(error,result)=>{
    if(error){
      console.log(`Error dropping veeqo table>>>>${error}`);
    }
    console.log(`Successfully dropped veeqo table`);
  })
}

// Creating squarespace table
const createSquareSpaceTable=()=>{
  const q=queries.createSquareSpaceTable();
  connection.query(q,(error,result)=>{
    if(error){
      console.log(`Error creating squarespace table>>>>${error}`);
    }
    console.log(`Successfully created squarespace table`);
  })
}

// Dropping squarespace table
const dropSquarespacetable=()=>{
  const q=queries.dropTable('squarespace');
  connection.query(q,(error,result)=>{
    if(error){
      console.log(`Error dropping squarespace table>>>>${error}`);
    }
    console.log(`Successfully dropped squarespace table`);
  })
}


// Fteching items from veeqo
const fetchFromVeeqo=()=>{
    // Api options
    const options = {
      hostname: 'api.veeqo.com',
      // path: '/products?since_id=40236984&warehouse_id=59669&created_at_min=2016-03-01%2011%3A10%3A01&page_size=250&page=1&query=',
      path: '/products?since_id=40236984&page_size=250&page=1',
      method: 'GET',
      headers: {
        'x-api-key': process.env.veeqo_api_key,
        'Accept': 'application/json'
      }
    };
    // Fetching the items
    const request = https.request(options, (res) => {
      let data = '';
      let responseItems=[];
    
      res.on('data', (chunk) => {
        data += chunk;
      });
    
      res.on('end', () => {
        const products = JSON.parse(data);
        // Getting only the required attributes
        // console.log(products[3].sellables[0].stock_entries);
        // console.log(products[4].sellables[0].stock_entries);
        // console.log(products[5].sellables[0].stock_entries);
        // console.log(products[6]);
        // return;
        
        for(let i=0; i<products.length; i++){
          let newItem={
            'sku':products[i].sellables[0].sku_code,
            'name':products[i].sellables[0].product_title,
            'quantity':products[i].sellables[0].stock_entries[0].physical_stock_level,
            'total_quantity_sold':products[i].total_quantity_sold,
            'total_available_stock_level':products[i].total_available_stock_level,
            'total_stock_level':products[i].total_stock_level,
            'price':products[i].sellables[0].price,
            'image':products[i].sellables[0].image_url,
          }
          responseItems.push(newItem);
        }
        // Sql operations should come here
        for(let i=0; i<responseItems.length;i++){
          
          const iq=queries.insertIntoVeeqo(
            responseItems[i].sku,responseItems[i].name,responseItems[i].quantity,responseItems[i].total_quantity_sold,
            responseItems[i].total_available_stock_level,responseItems[i].total_stock_level,responseItems[i].price,
            responseItems[i].image
          );
          connection.query(iq,(error,result)=>{
            if(error){
              console.log(`Error inserting into veeqo ${responseItems[i].sku}>>>>${error}`); 
              return;
            }
            console.log(`Succesffuly inserted ${responseItems[i].sku} into veeqo table`);
            
          })
        } 
        request.on('error', (error) => {
          console.error('Error making request:', error);
        });
        
        request.end();
    
    });
    
  }).on('error', (error) => {
    console.error(error);
  });
  request.end();
}

// fetchFromVeeqo();
// Fetch from squarespace
const fecthFromSquarespace=()=>{
  const options0 = {
    hostname: 'api.squarespace.com',
    path: `/1.0/commerce/inventory`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.squarespace_api_key}`,
      'Accept': 'application/json',
      'User-Agent':userAgent
    }
  };

  const requ = https.request(options0, (resp) => {
    let responseData = '';
  
    resp.on('data', (chunk) => {
      responseData += chunk;
    });
  
    resp.on('end', async () => {
      if (resp.statusCode === 200) {
        console.log('Inventory retrieved successfully!');
        const inventoryData = JSON.parse(responseData);
        // Squarespace invenory
        const sqinventory=inventoryData.inventory;
        for(let i=0; i<sqinventory.length;i++){
          const sq=queries.insertIntoSquarespace(sqinventory[i].variantId,sqinventory[i].sku,sqinventory[i].descriptor,sqinventory[i].quantity);
          connection.query(sq,(error,result)=>{
            if(error){
              console.log(`Error inserting ${sqinventory[i].sku} into squarespace table: ${error}`);
              return
            }
            console.log(`Succesfully insert ${sqinventory[i].sku} into squarespace table`);
          })
        }
        
      } else {
        console.error(`Error retrieving inventory: ${resp.statusCode}`);
        console.error(responseData);
      }
    });
  });

  requ.on('error', (error) => {
    console.error('Error making request:', error);
  });
  
  requ.end();
}

// Schedule creating items_udated, errors, veeqo, and squarespace tables
const scheduleCreateItemsUpdatedAndErrorsTable=(cronExpression)=>{
  const job=cron.schedule(cronExpression,()=>{
    console.log('Creating items updated and Errors table scheduled');
    createItemsUpdatedTable();
    createErrorsTable();
    createVeeqoTable();
    createSquareSpaceTable();
    console.log('Finished Creating items updated and Errors table');
  })
  return job;
}


// Schedule dropping errors, items_updated veeqo, and squarespace tables
const scheduleDroppingErrorsItemsUpdatedTables=(cronExpression)=>{
  const job=cron.schedule(cronExpression,()=>{
    console.log('Dropping Errors table scheduled');
    dropItemsUpdatedTable();
    dropErrorsTable();
    dropVeeqotable();
    dropSquarespacetable()
    console.log('Finished Dropping Errors table');
  })
  return job;
}


// Schedule fetch from both veeqo and squarespace
const scheduleFetchFromBothveeqoAndSquarespace=(cronExpression)=>{
  const job=cron.schedule(cronExpression,()=>{
    console.log('Preparing to fetch from veeqo and square space')
      fetchFromVeeqo();
      fecthFromSquarespace();
    console.log('Finished fetching from veeqo and square space')
  })
  return job;
}

// Updating inventory asynchronuously
const updateInventoryItem=(variantId,quantity,sku) =>{
  
  return new Promise((resolve, reject) => {
    const idempotencyKey=generateIdempotencyKey()
    const data = {
      // Determine the operation type based on the item's quantity 
      setFiniteOperations: quantity !== null ? [{ variantId: variantId, quantity: quantity }] : [],
    };

    const options = {
      hostname: 'api.squarespace.com',
      path: '/1.0/commerce/inventory/adjustments',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.squarespace_api_key}`,
        'User-Agent': userAgent,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey, // Generate a unique key for each request
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          // console.log(`Inventory updated for ${sku}`);
         console.log(`${sku} Inserted successfully`);
          resolve(); // Resolve the promise on success
        } else {
          console.error(`Error Inserted inventory for ${sku}: ${res.statusCode}`);
          console.error(responseData);
          reject(new Error(`Error Inserted inventory for ${sku}`)); // Reject the promise on error
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Error making request for ${sku}:`, error);
      reject(error); // Reject the promise on request error
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}
// Scheduling update
const scheduleInventoryUpdates=(cronExpression) =>{
  // Create a new cron job
  const job = cron.schedule(cronExpression, async () => {
    console.log('Starting inventory update job...');
            // Veeqo
            // Api options
            const options = {
              hostname: 'api.veeqo.com',
              path: '/products?page_size=250',
              method: 'GET',
              headers: {
                'x-api-key': process.env.veeqo_api_key,
                'Accept': 'application/json'
              }
            };
            // Fetching the items
            const request = https.request(options, (res) => {
              let data = '';
              let responseItems=[];
            
              res.on('data', (chunk) => {
                data += chunk;
              });
            
              res.on('end', () => {
                const products = JSON.parse(data);
                for(let i=0; i<products.length; i++){
                  let newItem={
                    'sku':products[i].sellables[0].sku_code,
                    'name':products[i].sellables[0].product_title,
                    'quantity':products[i].sellables[0].stock_entries[0].physical_stock_level
                  }
                  responseItems.push(newItem);
                }
              // console.log(responseItems);
              // Squarespace
                  const options0 = {
                    hostname: 'api.squarespace.com',
                    path: `/1.0/commerce/inventory`,
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${process.env.squarespace_api_key}`,
                      'Accept': 'application/json',
                      'User-Agent':userAgent
                    }
                  };
                  // Fetching the items
                  const requ = https.request(options0, (resp) => {
                    let responseData = '';
                  
                    resp.on('data', (chunk) => {
                      responseData += chunk;
                    });
                  
                    resp.on('end', async () => {
                      if (resp.statusCode === 200) {
                        console.log('Inventory retrieved successfully!');
                        const inventoryData = JSON.parse(responseData);
                        // Squarespace invenory
                        const sqinventory=inventoryData.inventory;
                        // Filtering veeqo items to be left with only those on square space
                        const similarItemsveeqo=filterSimilarItems(sqinventory,responseItems)
                        // Updating squarespace inventory
                       
                        for(let i=0; i<sqinventory.length; i++){
                          
                          const veeqoitem=responseItems.find(item=>item.sku===sqinventory[i].sku)
                          const sqsku=sqinventory[i].sku;
                          try {
                            await updateInventoryItem(sqinventory[i].variantId,veeqoitem.quantity,sqinventory[i].sku).then((v)=>{
                              
                               const insertquery=queries.insertIntoItemsUpdated(sqsku,sqinventory[i].descriptor,veeqoitem.quantity);
                               connection.query(insertquery,(error,result)=>{
                                 if(error){
                                   console.log(`"Error inserting item from the sql database: ", ${sqsku} >> ${error}`);
                                   return;
                                 }
                                 console.log("Successfully inserted>>>",sqsku);
                               })
                            });
                            
                          } catch (error) {
                            
                            if(error.toString().includes("Cannot read properties of undefined")){
                              const q=queries.insertIntoErrors(sqsku,'Failed to fetch the item from veeqo')
                                  connection.query(q,(error,result)=>{
                                    if(error){
                                      console.log(`Error inserting the error: ${sqsku} >> ${error}`);
                                      return;
                                    }
                                    console.log("Succefully inserted error",sqsku);
                                  })
                            }else{
                              const q=queries.insertIntoErrors(sqsku,error)
                                  connection.query(q,(error,result)=>{
                                    if(error){
                                      console.log(`Error inserting the error: ${sqsku} >> ${error}`);
                                      return;
                                    }
                                    console.log("Succefully inserted error",sqsku);
                                  })
                            }
                          }
                        }
                      } else {
                        console.error(`Error retrieving inventory: ${resp.statusCode}`);
                        console.error(responseData);
                      }
                    });
                  });
                  
                  requ.on('error', (error) => {
                    console.error('Error making request:', error);
                  });
                  requ.end();
              
              });
              
              
            }).on('error', (error) => {
              console.error(error);
            });
            request.end();

    console.log('Inventory update job completed.');
  });

  // You can optionally stop the job later if needed
  // job.stop(); 

  return job; // Return the job object if you need to access it later
}

// Scheduling the jobs
const dropItemsUpdatedAndErrorsTableJob=scheduleDroppingErrorsItemsUpdatedTables('00 06 * * *');
const createErrorsAndItemsUpdatedJob=scheduleCreateItemsUpdatedAndErrorsTable('02 06 * * *');
const invenoryUpdatejob = scheduleInventoryUpdates('04 06 * * *');
const fetchfromVeeqoandSquareSpacejob = scheduleFetchFromBothveeqoAndSquarespace('06 06 * * *');


// Route controllers

// Signup get
const signuppage=(req,res)=>{
  res.render('signup',{'title':'Signup'});
}

// Signin user
const signIn=(req,res)=>{
    
    const email=req.body.email;
    const password=req.body.password
    const query=queries.signinuser(email);
    connection.query(query,async (error,result)=>{
      if(error){
        console.log("Failed to find the user: ",error);
        return;
      }
      
      if(result.length!==0){
        const validatePassword=await comparePassword(password,result[0].password);
        if(validatePassword){
            console.log('Correct password, allow the user');
            req.session.isLoggedIn=true;
            res.redirect('/home');
          return;
          // res.render('home',{'title':"Home",'success':items,'errors':errors})
        }else{
          const error='Wrong password';
          res.render('index',{error:error,'title':'login','email':email});
          console.log('Wrong password');
        }
      }else{
        const error='The email is not registered';
        res.render('index', {error:error,title:'Login','email':email},)
        console.log('The email is not registered');
        return;
      }
      
      
    })
}

// signup user
const siginUp=async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;
    const hashedpassword=await hashPassword(password);
    const query=queries.signupuser(email,hashedpassword);
    connection.query(query,(err,result)=>{
      if(err){
        console.log("Error occured registering the user: ",err);
        return;
      }
      console.log('Succesfully registered the user');
      
    })
}

const signOut=(req,res)=>{
  req.session.destroy(err => {
    if (err) {
      console.error("Error destroying session:", err);
      // Handle the error appropriately, maybe redirect to an error page
      return res.status(500).send('An error occurred');
    } 
    res.redirect('/'); // Redirect to the index page after session is destroyed
  });
}




// index
const index=(req,res)=>res.render('index',{title:'Welcome','error':null,'email':null});
// Dashboard
const home=(req,res)=>{
  if(req.session.isLoggedIn){
    connection.query(queries.fetchItemsUpdated(),(err,result1)=>{
      if(err){
        console.log(err);
        return
      }
      connection.query(queries.fetchErrorsUpdated(),(err,result2)=>{
        if(err){
          console.log(err);
          return
        }
        // return;
        connection.query(queries.fetchVeeqoItems(),(error,result3)=>{
          if(error){
            console.log(`Error fetching veeqo items>>>${error}`);
          }
          connection.query(queries.fecthSquarespaceItems(),(error,result4)=>{
            if(error){
              console.log(`Error fetching squarespace items>>>${error}`);
            }
            res.render('dashboard',{'title':'dashboard','items':result1.length,'errors':result2.length,'veeqo':result3.length,'squarespace':result4.length});
          })
        })
      })
    })
  }else{
    res.redirect('/')
  }
}

// Update
const general=(req,res)=>{
  console.log(req.session.cookie);
  
  if(req.session.isLoggedIn){
    connection.query(queries.fetchItemsUpdated(),(err,result1)=>{
      if(err){
        console.log(err);
        return
      }
      connection.query(queries.fetchErrorsUpdated(),(err,result2)=>{
        if(err){
          console.log(err);
          return
        }
        // return;
        res.render('home',{'success':result1,'errors':result2,'title':'Home'})
      })
    })
  }else{
    res.redirect('/')
  }
}
const successes=(req,res)=>{
  if(req.session.isLoggedIn){
    connection.query(queries.fetchItemsUpdated(),(err,result)=>{
      if(err){
        console.log(err);
        return
      }
      res.render('successes',{'success':result,'title':'Successful updates'})
    })
  }else{
    res.redirect('/');
  }
}

// Errors
const failedupdates=(req,res)=>{
  if(req.session.isLoggedIn){
    connection.query(queries.fetchErrorsUpdated(),(err,result)=>{
      if(err){
        console.log(err);
        return
      }
      console.log(result);
      res.render('failedupdates',{'failedupdates':result,'title':'Failed updates'})
    })
  }else{
    res.redirect('/');
  }
}
// veeqo
const veeqoItems=(req,res)=>{
  if(req.session.isLoggedIn){
    const q=queries.fetchVeeqoItems();
    connection.query(q,(error,result)=>{
      if(error){
        console.log(`Error fetching veeqo items>>>${error}`);
      }
      res.render('veeqo',{'items':result,'title':'veeqo'});
    })
  }else{
    res.redirect('/');
  }
}

// Squarespace
const squarespaceItems=(req,res)=>{
  if(req.session.isLoggedIn){
    const q=queries.fecthSquarespaceItems();
    connection.query(q,(error,result)=>{
      if(error){
        console.log(`Error fetching squarespace items>>>${error}`);
      }
      res.render('squarespace',{'items':result,'title':'squarespace'});
    })
  }else{
    res.redirect('/');
  }
}


export default{
    index,
    signIn,
    siginUp,
    home,
    general,
    successes,
    failedupdates,
    veeqoItems,
    squarespaceItems,
    signuppage,
    signOut
}


