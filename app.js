const express = require('express');
const mongoose = require('mongoose');
const path = require('path');       // inbuilt library
const cookieParser = require('cookie-parser');

const Blog = require('./models/blog');
const { checkForAuthenticationCookie } = require('./middleware/authentication');
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');

require('dotenv').config();
const port = process.env.port;

const app = express();
const db = process.env.db_url;

mongoose.connect(db)
    .then((e) => console.log("Connected to mongodb"));

app.set('view engine', 'ejs')
app.set('views', path.resolve('./views'))

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'))
app.use(express.static(path.resolve("./public")));


app.get('/', async (req, res)=>{
    const allBlogs = await Blog.find({});     // this will sort according to the time(descending order)
    res.render('home', {
        user: req.user,
        blogs: allBlogs,
    });
})

app.use('/user', userRouter);
app.use('/blog', blogRouter);

app.listen(port);

// dev dependencies- run only in development env, it not run in deployment (size of project will be small) 