const dotenv = require('dotenv');
dotenv.config(); // Setup so that Environment variables can be used...
const express = require("express");
const fileUpload = require('express-fileupload'); // Helps in recieving files from Client form..
const mongoose = require("mongoose"); // helps in setting up connection with MongoDB server...
const ejs = require("ejs"); // View engine makes it possible for us to render variable information onto HTML on load
const https = require("https");// To enable secure talks between server and cliet so as to prevent Man-in-the middle attack
const fs = require("fs"); // Requred to read files....
const cookieParser = require('cookie-parser'); // To set and read cookies easily..
const { networkInterfaces } = require('os');
const admin_name = process.env.ADMIN_NAME; 
const admin_pass = process.env.ADMIN_PASS;
const cookieMaxAge = 10*60*1000 // 10 minutes written in milliseconds...


let DB_NAME = 'BooksDB'; // DB Name
let DB_PORT_NUMBER = '27017'; // DB Port Number
const DB_URL = 'mongodb://localhost:'+DB_PORT_NUMBER+'/'+DB_NAME;

try {
    mongoose.connect(DB_URL); // Connecting to DB through mongoose...
} catch (error) {
    handleError(error);
}

const BookSchema = new mongoose.Schema(
    {
        book_id : {
            unique : true,
            type : String,
            required : [true , "Book adding to the DB needs an id.."]
        },
        title : {
            type : String,
            required : [true , "Book adding to the DB needs a title.."]
        },
        author : {
            type : String,
            required : [true , "Book adding to the DB needs an author.."]
        },
        overview : {
            type : String,
            required : [true , "Book adding to the DB needs an overview.."]
        },
        image_path : String
    } , 
    {collection : "books"}
); // Making schema and making sure that when mongodb assigns name to this collection it ends up being "books" only due to 
   // MongoDB having a process and keeping lowercase plural names for its collections...

const books = mongoose.model("books" , BookSchema); // Making model for the schema which in turns activates our Collection..


function IsAdmnOrNot(req,res,next) {
    // Middleware to check if the user is Admin or not and displays the information in form of true or false in request object..
    if (!req.cookies && !req.cookies.admin_name && !req.cookies.admin_pass) {
        // Cookies dont exist...
        req.IsAdmnOrNot = false;
    }
    else {
        if (req.cookies.admin_name == admin_name  &&  req.cookies.admin_pass == admin_pass) {
            // Cookies have valid info in them
            req.IsAdmnOrNot = true;
        }
        else {
            // Cookies exist but have invalid info in them...
            req.IsAdmnOrNot = false;
        }
    }
    // Move on to the next middleware networkInterfaces...
    next();
}

const app = express();

app.use(cookieParser()); // helps to read and set cookies easily...
app.use(express.urlencoded({extended:false})); // Makes body object of our request object
app.use(express.json()); // Helps in transferring of JSON from client to server..
app.use(fileUpload()) // Helps in FileUpload from client to sercer
app.set("view engine" , "ejs"); // Seeting up view Engine..







app.get("/" , (req,res)=>{
    // Finding all the books and rendering them onto the /views/books.ejs file using EJS..
    books.find((err , books)=>{
        if (err) {
            console.log(err);
        }
        else if (!books) {
            console.log("no book of this id..");
        }
        res.render("books" , {books : books});

    })

});

app.get("/create" ,IsAdmnOrNot, (req,res)=>{
    // Checking if admin or not..
    if (req.IsAdmnOrNot === true) {
        // yes Admin provide access to this page..
        res.sendFile(__dirname+"/public/html/add.html");
    }else {
        res.redirect("/login");
    }
});

app.get("/login" ,IsAdmnOrNot, (req,res)=>{
    // Checking if admin or not..
    if (req.IsAdmnOrNot === true) {
        // yes Admin provide access to this page..
        res.redirect("/");
    }else {
        res.sendFile(__dirname+"/public/html/login.html");
    }
});

app.get("/update" ,IsAdmnOrNot, (req,res)=>{
    // Checking if admin or not..
    if (req.IsAdmnOrNot === true) {
        // yes Admin provide access to this page..  
        res.sendFile(__dirname+"/public/html/update.html");
    }else {
        res.redirect("/login");
    }
});

app.get("/delete" , IsAdmnOrNot, (req,res)=>{
    // Checking if admin or not..
    if (req.IsAdmnOrNot === true) {
        // yes Admin provide access to this page..  
        res.sendFile(__dirname+"/public/html/delete.html");
    }else {
        res.redirect("/login");
    }
});

app.get("/book/:book_id" , (req,res)=>{
    // Path for a particular book information to be accessed...
    books.findOne({book_id : req.params.book_id} ,(err , book)=>{
        if (err) {
            console.log(err);
        }
        else if (!book) {
            console.log("no book of this id..");
        }
        else {
            res.render("book_p" , {book : book});
        }
    })
});

app.get("/book_images/:name" , (req,res)=>{
    // This path is only for providing images for the books...
    let fileName = __dirname + "/public/book_images/"+req.params.name;
    res.sendFile(fileName);
});



app.post("/" ,IsAdmnOrNot, (req,res)=>{

    // Create Operation for our App where Only Admin can create a new Book into the DB...

    if (req.IsAdmnOrNot === true) {

        let re = /(?:\.([^.]+))?$/;
        let myfile = req.files.book_image;
        myfile.mv(__dirname+'/public/book_images/'+ req.body.book_id +"." + re.exec(myfile.name)[1]);
        // EX: If file name is "EWA.png" What above code is doing is taking ".png" part of the filename and 
        // attaching it to the path "/public/book_images/" with filename being "<<Book_ID>>.png"
        //
        // this makes our server not have multiple images for one book whenever images our updated...
        // Also this makes it so accessing the images becomes easier for each book...
    
        const newBook = new books({
            title : req.body.title,
            book_id : req.body.book_id,
            author : req.body.author,
            overview : req.body.overview,
            image_path : "/book_images/"+String( req.body.book_id +"." + re.exec(myfile.name)[1])
        });
        newBook.save();
        // Saved the newBook to the DB and now redirecting user to homepage..
        //
        res.redirect("/");

    }
    else {
        // Not an Admin go back to Home page thenn...
        res.redirect("/");
    }
});

app.post("/update" , IsAdmnOrNot , (req,res)=>{

    if (req.IsAdmnOrNot === true) {

        let update_temp = {};
        // This temp variable so that I can have column as set by user by selecting the input 
        // This way I wont have to make mutiple ifs and be efficient...
        if (req.body.field_name != "image_path") {

            // Nothing special required for changing of text...
            update_temp[req.body.field_name] = req.body.newValue;           
        }
        else {
            // Now file needs to be updated so first we name the new file and save it and then...
            let myfile = req.files.newValue;
            let re = /(?:\.([^.]+))?$/;
            myfile.mv(__dirname+'/public/book_images/'+ req.body.book_id+"." + re.exec(myfile.name)[1]);
            // Again same thing as when we did in path "/create" we rename the file to <<Book_ID>> + extension and 
            // then move it to the required path..
            update_temp[req.body.field_name] = '/book_images/'+ req.body.book_id+"." + re.exec(myfile.name)[1];
            // Making changes in temp variable so that upadtes can be made to the DB..
        }


        books.updateOne(
            {book_id : req.body.book_id},
            update_temp, // Updating the variable...
            (err)=>{if (err) { console.log(err);}}
        )
        res.redirect("/");

    }
    else {

        res.redirect("/");
    }
});

app.post("/delete" , IsAdmnOrNot, (req,res)=>{
    if (req.IsAdmnOrNot === true) {
        // Deleting Directory...
        books.deleteOne({book_id : req.body.book_id} , (err)=>{
            if (err) {
                console.log(err);
            }
        });
        res.redirect("/");
    }
    else {
        res.redirect("/");
    }
});

app.post("/login" , (req,res)=>{


    // Here once someone reaches here I simply put their credentials in their cookie through CookiParser package and 
    // that cookie will automatically expire after 10 minutes...
    // Validation part is actually done by "IsAdmnOrNot" function acting as middleware..

    res.cookie("admin_name" , req.body.username , {
        maxAge: cookieMaxAge,// 10min
        secure: true,
        httpOnly: true,
        sameSite: 'lax'
    });
    res.cookie("admin_pass" , req.body.password ,{
        maxAge: cookieMaxAge,// 10min
        secure: true,
        httpOnly: true,
        sameSite: 'lax'
    });
    res.redirect("/");
});






const SSLserver = https.createServer({
    key : fs.readFileSync(__dirname+"/cert/key.pem"), // Private key to be keft safe and not shared with public
    cert : fs.readFileSync(__dirname+"/cert/cert.pem") // Certificate (Made with Public key and Certificate Authority's Private key) shared with client to validate ourselves to them..
} , app);

// Starting the server on https://localhost:5000
SSLserver.listen(5000 , ()=>{
    console.log("Secure server started at port 3443.");
});