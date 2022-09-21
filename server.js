const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const app = express();
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '50mb',
    extended: true
  }));

app.use(express.static('public'));  
app.use(session({
    secret: "This is a secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://mitaksh_:admin123@cluster0.bmzzbuv.mongodb.net/usersDB");

const userSchema = new mongoose.Schema({
    userId: String,
    password: String,
    value: Array
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req, res)=>{
    res.render('home');
})

app.get("/home",(req,res)=>{
    if(req.isAuthenticated()){
        const userN = req.user.username;
        const userId = req.user.id;
        var customVal;
        if(req.query.searchId){
            const searchId = req.query.searchId;
            User.findById(searchId,(err,result)=>{
                if(err){
                    console.log(err);
                } else {
                    customVal = result.value[0];
                    res.render('main',{val:customVal, userN:userN,userId:userId});
                }
            })
        } else {
            customVal = req.user.value[0];
            res.render('main',{val:customVal, userN:userN,userId:userId});
        }
    } else {
        res.redirect("/");
    }
})

app.get("/register",(req,res)=>{
res.render('register');
})

app.post("/register",(req, res)=>{    
    User.register({username: req.body.username},req.body.password, (err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/home");
            })
        }
    })
})

app.get("/login",(req,res)=>{
res.render('login');
})

app.post("/login",(req, res)=>{
    const user  = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (err)=>{
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/home")
            })
        }
    })

})

app.post("/save",(req, res)=>{
    const val = req.body.value;
    const newVal = [];
    newVal.push(val);
    console.log(newVal);
    // console.log(val);
    // console.log(req.body.value);
    const id = req.user.id;
    
    User.findById(id,(err,result)=>{
        if(err){
            console.log(err);
            console.log("here");
        } else {
            if(result){
                result.value = val;
                result.save(()=>{
                    console.log("saved successful!")
                    res.redirect("/home");
                });
            }
        }
    })
})

app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            console.log(err);
        } else {
            res.redirect("/login") 
        }
    });
})

app.listen(PORT,(req, res)=>{
    console.log(`Server is running on port ${PORT}`)
})
