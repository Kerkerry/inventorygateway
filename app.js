import express from 'express';
import session from 'express-session';
import HomeRoutes from './routes/homeRoutes.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import expressMySQLSession from 'express-mysql-session';
dotenv.config({path:"credentials.env"});

const app=express();

// Session
const MySQLStore = expressMySQLSession(session);
const options = {
	host: 'localhost',
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: 'inventory'
};
const store =new MySQLStore(options);
app.use(cookieParser());
app.use(
  session({
    secret: 'inventorygateway user', 
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 1
    }
  })
);

app.use((req,res,next)=>{
  store.onReady().then(() => {
    // MySQL session store ready for use.
    console.log('MySQLStore ready');
  }).catch(error => {
    // Something went wrong.
    console.error(error);
  });
  next();
})


app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.set('view engine','ejs')
app.listen(process.env.PORT,()=>{
    console.log(`Listening on ${process.env.PORT}`); 
})
app.use(HomeRoutes);




