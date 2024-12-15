const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.set("view engine","ejs");
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, (match) => {
      const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return escapeMap[match];
    });
  }
const db = new sqlite3.Database("./database.db" , (err) => {
    if (err){console.log(err);}
    else{console.log("Connection with database made");}
});
app.listen(80 , () => {
    console.log('Application running on localhost port 80');
});
app.use("/public",express.static(`${__dirname}/public`));

app.use(express.urlencoded());

app.get("/",(req,res) => {
    db.all("SELECT * FROM opininons",(err,rows) => {
        res.render("index",{data: rows});
    });
    
});
app.get("/create",(req,res) => {
    res.render("form",{backend: ""});
});
app.post("/create",(req,res) => {
    db.all("SELECT * FROM opininons WHERE title=?",[escapeHTML(req.body.title)],(err,rows) => {
        if (rows.length > 0){res.render("form",{backend: "Opinion with this title already existis"});}
        else{
        db.run("INSERT INTO opininons VALUES (?,?,?,?)",[escapeHTML(req.body.title),escapeHTML(req.body.content),0,0]);
        res.redirect("/");}
    })
    
});
app.get("/read/:id",(req,res) =>{
    db.all("SELECT * FROM opininons WHERE title=?",[req.params.id], (err,rows) => {
        if (rows.length == 0){res.redirect(`/extinct_post/${req.params.id}`);}
        else{
            res.render("reading",{data: rows[0] , id: req.params.id});
        }
    } );
});

app.get("/like/:id",(req,res) => {
    db.all("SELECT likes FROM opininons WHERE title=?",[req.params.id],(err,rows) => {
        db.run(`UPDATE opininons SET likes=${rows[0].likes+1} WHERE title=?`,[req.params.id]);
    });
    res.redirect(`/read/${req.params.id}`);
});

app.get("/dislike/:id",(req,res) => {
    db.all("SELECT comments FROM opininons WHERE title=?",[req.params.id],(err,rows) => {
        db.run(`UPDATE opininons SET comments=${rows[0].comments+1} WHERE title=?`,[req.params.id]);
    });
    res.redirect(`/read/${req.params.id}`);
});
//404
app.use((req,res) => {
    res.status(404).render("404");
});