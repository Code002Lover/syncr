import http from 'http';
import https from 'https';
import crypto from "crypto";
import express, { Router } from "express";
import bodyParser from "body-parser";
import { createPool } from 'mysql';
import { readFileSync } from 'fs';

import "unsafe_encrypt"

const router = Router();
const app = express();

const config = JSON.parse(readFileSync("config.json"))

const con = createPool({
    connectionLimit : config.mysql.connections,
    host: config.mysql.host,
    user: config.mysql.user,
    password: readFileSync(config.mysql.password_file).toString()
});



app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

router.all(function(req,res,next) {
    console.log(req.protocol + '://' + req.get('host') + req.originalUrl)

    next()
})

router.post("/check",function(req,res) {
    console.log(req.body)

    res.json({"status":"success"})
})

router.post("/sync",function(req,res){

    console.log(req.body)

    res.json({"status":"success"})
})

router.get("/stats",function(req,res) {
    let sql = `select * from syncr.stats;`
    con.query(sql, [], function (err, result) {
        if (err) throw err;
        if(result[0]) {
            res.json(result)
        } else {
            res.json({"error":"no stats"})
        }
    });
})




app.use(router)

const httpServer = http.createServer(app);
httpServer.listen(config["ports"]["http"],function(){
  console.log(5,"HTTP Server is listening")
});

const privateKey = readFileSync(config["ssl"]["privateKey"]).toString()
const certificate = readFileSync(config["ssl"]["certificate"]).toString()

const credentials = {key: privateKey, cert: certificate};

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(config["ports"]["https"],function(){
    console.log(5,"HTTPS Server is listening")
});