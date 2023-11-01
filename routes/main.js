
module.exports = function(app, shopData) {
    const { check, validationResult } = require('express-validator');
    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
          res.redirect('./login')
        } else { next (); }
    }

    const bcrypt = require('bcrypt');
    
    
    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });

    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    })

    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData);                                                                     
    });  


    app.post('/loggedin', function (req,res) {
        const bcrypt = require('bcrypt');
        let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?";
        let user = [req.body.username]
        // Save user session here, when login is successful
        req.session.userId = req.body.username;

        // console.log("111111111")

        db.query(sqlquery, user, ( err, result)=>{
            
        // console.log("222222")
            if(err){
                
        // console.log("33333")
                console.error(err);
                
                res.status(500).send('Internal Server Error');
            }else{
                
        // console.log("111111111")
                console.log(result);
                hashedPassword = result;
                console.log(hashedPassword);

                bcrypt.compare(req.body.password, result[0].hashedPassword, function(err, result) {        
                    if (err) {
                      // TODO: Handle error
                      console.error(err.message + "A");
                    }
                    else if (result == true) {
                    //   // TODO: Send message
                    //   res.render("list.ejs",shopData);
                      res.send('You have an account! <a href='+'./list'+'>List Book</a>')
                    }
                    else {
                      // TODO: Send message
                      res.send("Incorrect Password!")
                    }
                  });
              
            }
        })                                                                              
    }); 

    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);

        let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });        
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });                                                                                                 
    app.post('/registered',[check('email').isEmail()], check('password').isLength({ min: 8 }), function (req,res) {
        const saltRounds = 10;
        const plainPassword = req.body.password;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./register'); }
        else { 
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            // Store hashed password in your database.
            let sqlquery = "INSERT INTO users (username, firstname, lastname, email, hashedpassword) VALUES (?,?,?,?,?)";
            //EXECUTE SQL QUERY
            let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];

            db.query(sqlquery, newrecord, (err,result)=>{
                if(err){
                    return console.error(err.message);
                }
                else{
                }

            })
        
          })
          
          res.render("index.ejs",shopData);
        // saving data in database
        // res.send(' Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email);                                 
        }                                             
    }); 

    app.get('/list', redirectLogin, function(req, res) {
        let sqlquery = "SELECT * FROM books"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });
    });

    app.get('/listusers', function(req, res) {
        let sqlquery = "SELECT * from users"; 
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {users:result});
            console.log(newData)
            res.render("listusers.ejs", newData)
         });
    });

    app.get('/deleteuser', function (req, res) {
        res.render('deleteuser.ejs', shopData);     
    });
    app.post('/deleteuser1', function (req,res) {
        //searching in the database
        let query = "DELETE FROM users WHERE username LIKE '%" + req.body.keyword + "%'";
        // execute delete query
        console.log("1")
        db.query(query, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }else {
                console.log("2")
                res.redirect('./listusers'); 
            }
        });                                                                 
    });

    app.get('/addbook', function (req, res) {
        res.render('addbook.ejs', shopData);
     });
 
     app.post('/bookadded', function (req,res) {
           // saving data in database
           let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
           // execute sql query
           let newrecord = [req.body.name, req.body.price];
           db.query(sqlquery, newrecord, (err, result) => {
             if (err) {
               return console.error(err.message);
             }
             else
             res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price);
             });
       });    

       app.get('/bargainbooks', function(req, res) {
        let sqlquery = "SELECT * FROM books WHERE price < 20";
        db.query(sqlquery, (err, result) => {
          if (err) {
             res.redirect('./');
          }
          let newData = Object.assign({}, shopData, {availableBooks:result});
          console.log(newData)
          res.render("bargains.ejs", newData)
        });
    });       

}
