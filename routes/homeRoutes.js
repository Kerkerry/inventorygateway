import controllers from '../controllers/controllers.js'
import express from 'express';
const Router=express.Router();

Router.get('/',controllers.index);
// Router.get('/signup',controllers.signuppage);
Router.get('/home',controllers.home)
Router.get('/general',controllers.general);
Router.get('/success',controllers.successes);
Router.get('/failedupdates',controllers.failedupdates);
Router.post('/signin',controllers.signIn);
// Router.post('/signup',controllers.siginUp);
Router.get('/signout',controllers.signOut);
Router.get('/veeqo',controllers.veeqoItems);
Router.get('/squarespace',controllers.squarespaceItems);
export default Router