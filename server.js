const express = require('express')
var waterfall = require('async-waterfall');
const app = express()
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var path = require('path');
var cors = require('cors')
app.use(cors())
app.use(bodyParser.json({limit: '50mb'})); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true,limit: '50mb' })); // support encoded bodies
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://admin:admin@ds229450.mlab.com:29450/heroku_njnj8d2d";
var dbo;
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  dbo = db.db("mydb");
});



var storage = multer.diskStorage({ //multers disk storage settings
destination: function (req, file, cb) {
  cb(null, './uploads/')
       },
       filename: function (req, file, cb) {
           var datetimestamp = Date.now();
           cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
       }
   });
   var upload = multer({ //multer settings
                   storage: storage,
                   fileFilter : function(req, file, callback) { //file filter
                       if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                           return callback(new Error('Wrong extension type'));
                       }
                       callback(null, true);
                   }
               }).single('file');
               app.post('/upload', function(req, res) {
       var exceltojson;
       upload(req,res,function(err){
           if(err){
                res.json({error_code:1,err_desc:err});
                return;
           }
           /** Multer gives us file info in req.file object */
           if(!req.file){
               res.json({error_code:1,err_desc:"No file passed"});
               return;
           }
           /** Check the extension of the incoming file and
            *  use the appropriate module
            */
           if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
               exceltojson = xlsxtojson;
           } else {
               exceltojson = xlstojson;
           }
           try {
               exceltojson({
                   input: req.file.path,
                   output: null, //since we don't need output.json
                   lowerCaseHeaders:true
               }, function(err,result){
                   if(err) {
                       return res.json({error_code:1,err_desc:err, data: null});
                   }
                   dbo.collection('result').insert(result,function (err, data) {

                     res.json({error_code:0,err_desc:null, data: "insert successfully"});
                   })
               });
           } catch (e){
               res.json({error_code:1,err_desc:"Corupted excel file"});
           }
       })
   });
   app.post('/getEmail', function(req, res) {
     var body=req.body;
     console.log("body==>",body);

     var emailList=body.emailList;
     console.log("emailList==>",emailList);
     // emailList=JSON.parse(emailList);
     var searchQ={email:{$in: emailList}}
     var matcharr=[];
     var unmatcharr=[];
    // console.log('query==>',searchQ);
    dbo.collection('result').find(searchQ).toArray( function(err, result){
      if(err){
        console.log(err);
        res.send({success: false,data: err});
      }else if (true){
        // console.log((result.length > 0));

        for (var i = 0; i < emailList.length; i++) {
          found=false;
          for (var j = 0; j < result.length; j++) {
            // console.log(emailList[i],i);
            // console.log(result[j].email,j);
            if(emailList[i]==result[j].email){
              found=true;
              break;
            }
          }if(!found){
            unmatcharr.push(emailList[i])
          }else{
            // unmatcharr.push(result[i])
          }
        }
        res.send({success: true,data: {matcharr:result,unmatcharr:unmatcharr}});
      } else {
        res.send({success: false,data: "no result"});
      }
   });
 });
  // var Database = require('./database')()
  // Database.loadDB(function(maindb){
  //
  // })


app.use(express.static(path.join(__dirname, 'EmailApp')));
app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'))
