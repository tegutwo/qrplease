const express = require("express");
const app = express();
var admin = require('firebase-admin');
const _ = require("lodash");

var serviceAccount = require("C:/Users/alvin/Desktop/Express\ JS/qrProject/private/qrattendance-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://qrattendance-322418-default-rtdb.firebaseio.com"
});

var db = admin.database();
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
var Id ;
app.get("/:id/:unitcode/:unitname",(req,res)=>{
    // console.log(req.params);
     Id = req.params.id;
    var unitCode = req.params.unitcode;
    var unitName = req.params.unitname;
    res.render("students",{unitcode:unitCode,unitname:unitName});
    // console.log("id: ",id,"unitcode: ",unitcode,"unitname: ", unitname);
    
})
app.post("/",(req,res)=>{
    var unitCode = req.body.class_id;
    var unitName = req.body.class_name;
    var studentName = req.body.student_name;
    var studentId = req.body.student_id;
    var ref = db.ref(`/Users/${Id}/classes/${unitCode}/`);
    var data ;
    ref.once('value', (snapshot) => {
        data= snapshot.val();
      }).then(()=>{
        if(isRegistrationOpen(data['register']) && !isStudentRegistered(data,studentId)){
          registerStudent(unitCode,studentId,studentName).then(()=>{
            if(isLinkOpen(data['status'])){
              console.log("Signing student in.....");
              signInStudent(unitCode,studentId,data['classnumber']).then(()=>{
                res.render("confirmation",{unit:unitCode,unitname:unitName,action:"Registered and Signed In", date: new Date().toLocaleDateString("en-us",{day:"numeric",month:"long",year:"numeric"})});
              });
            }
            else{
              res.render("confirmation",{unit:unitCode,unitname:unitName,action:"Signed In", date: new Date().toLocaleDateString("en-us",{day:"numeric",month:"long",year:"numeric"})});
            }
          })
        }
        else if(isStudentRegistered(data,studentId) && isLinkOpen(data['status'])){
          signInStudent(unitCode,studentId,data['classnumber']).then(()=>{
            res.render("confirmation",{unit:unitCode,unitname:unitName,action:"Signed In",date: new Date().toLocaleDateString("en-us",{day:"numeric",month:"long",year:"numeric"})});
          })
        }
      else{
        res.render("failure",{unit:unitCode,unitname:unitName,action:"Sign In ",date: new Date().toLocaleDateString("en-us",{day:"numeric",month:"long",year:"numeric"})});
      }
      }).catch((error)=>{
        console.log(error);
      })
    
})

 function isLinkOpen(status){
  return status;
}
function isStudentRegistered(data,regNumber){
  var studentID = regNumber.replace(/[^A-Z0-9]+/ig,"");
 studentID= _.upperCase(studentID);
  console.log(studentID,"<-This one");
  if(data["Students"]){
    if (data["Students"][studentID]){
      return true;
    }
    else{
      return false;
    }
  }else{
    return false;
  }
}
 function isRegistrationOpen(register){
  return register;
}
  
async function registerStudent(unitCode,student_id,student_name){
  var safe_student_id = student_id.replace(/[^A-Z0-9]+/ig,"");
  safe_student_id = _.capitalize(safe_student_id);
  console.log(safe_student_id);
  var ref = db.ref(`/Users/${Id}/classes/${unitCode}/Students/${safe_student_id}`);
  await ref.set({
    name:student_name,
    id: student_id
  },(error)=>{
    if(error){
      console.log(error,"Unable to save student Data");
    }
    else{
      console.log("Student data saved Successfully");
    }
  })

}
async function signInStudent(unitCode,studentID,classNumber){
  var safe_student_id = studentID.replace(/[^A-Z0-9]+/ig,"");
  safe_student_id = _.capitalize(safe_student_id);
  var date = new Date().toLocaleDateString("en-us",{day:"numeric",month:"long",year:"numeric"});
  var cls = "c" + classNumber + (date.replace(/[^A-Z0-9]+/ig,""));
  var obj = {};
  obj[cls] = date;
  var ref = db.ref(`/Users/${Id}/classes/${unitCode}/Students/${safe_student_id}`);
  await ref.update(
   obj
  ,(error)=>{
    if(error){
      console.log(error,"Unable to save student Data");
    }
    else{
      console.log("Student data saved Successfully");
    }
  })
}
app.listen(process.env.PORT,()=>{
    console.log("Listening on port 3000");
})