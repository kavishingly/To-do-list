//dummy commit
const express = require("express");
const Mongoose = require("mongoose");

const app = express();
Mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema={
    
    name: String
};

const Item=Mongoose.model("Item",itemsSchema); 
//Item means collection named as "items"
//const <model name>=Mongoose.model(<collection name>,<schema name>)

const item1=new Item({
    name: "welcome to to-do-list"
})

const item2=new Item({
    name: "welcome again to to-do-list"
})

const item3=new Item({
    name: "welcome again to to-do-list"
})
const defaultItems=[item1,item2,item3];

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); //to serve static files
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    Item.find({},(err,foundItems)=>{
        //  console.log("Length is "+foundItems.length);
        if(foundItems.length ==0){
            Item.insertMany(defaultItems,(err)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("Added items successfully");
                }
            })
            res.redirect("/")
        }else{
        res.render("list",{title:"Today",newListItems:foundItems}) //---important: rendering foundItems array from db
        }
    })  
    
});


//-----------------inserting element-----------------------------
app.post('/', (req, res) => {
    
    const itemName = req.body.newItem //itemName is name entered by user in text input
    const newItemEntered=new Item({ //creating new row
        name:itemName
    })
    newItemEntered.save(); //saving this row to our db and redirectiong to home route
    res.redirect("/")
    // deleting work route to simplifiy things as of now
})

//-----------------deleting element-----------------------------
/*steps:
-wrap the checkbox and item div inside form tag which post at route /delete
-submit form when checkbox is clicked using onChange attribute in checkbox
-each row in db has a unique id,access this _id by adding it in value attribute 
-now delete the item which has above _id using findByIdAndRemove() function in mongoose
*/
app.post("/delete",(req,res)=>{
    // console.log(req.body.checkBox);
    const deletedId=req.body.checkBox;

    Item.findByIdAndRemove(deletedId,(err)=>{
        if(err){
            console.log(err);
        }else{
            console.log("Deleted successfully");
        }
    })
    res.redirect("/")
    
})

app.listen(3000, () => {
    console.log("server running at port 3000...");
})