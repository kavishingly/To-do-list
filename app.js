//dummy commit
const express = require("express");
const Mongoose = require("mongoose");
const _=require("lodash")

const app = express();
Mongoose.connect("mongodb://localhost:27017/todolistDB")

//schema for each item for any list
const itemsSchema={
    listName: String,
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

//schema for a list 
const listSchema = {
    name: String, //name of list eg work
    items: [itemsSchema] //array storing items of that list
}
const List=Mongoose.model("List", listSchema);


app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); //to serve static files
app.set('view engine', 'ejs');
//dummy
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

app.get("/:customListName",(req,res)=>{
    const customListName=_.capitalize(req.params.customListName); //entered by user in url
    // console.log(customListName);
    List.findOne({name: customListName},(err,results)=>{ //finding a list in lists collections with name: customListName
        if(!err){
            if(!results){ 
                //create new list if no list found
                const list =new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/"+customListName)
            }else{
                //show existing list
                res.render("list",{title:customListName,newListItems: results.items})
            }
        }
    })
    
    // Item.find({listName: listNameNew},(err,result)=>{

    //     // res.redirect("/")
        
    //     res.render("list",{title:listNameNew,newListItems:result}) //---important: rendering foundItems array from db
        
    // })
})


//-----------------inserting element-----------------------------
app.post('/', (req, res) => {
    
    const itemName = req.body.newItem //itemName is name entered by user in text input
    const newItemEntered=new Item({ //creating new row
        name:itemName
    })
    const listName=req.body.listType //listType tells which list is this
    if(listName=="Today"){ 
        newItemEntered.save(); //saving this row to our db and redirectiong to home route
        res.redirect("/")

    }else{ //if list is other than default list
        List.findOne({name:listName},(err,foundList)=>{ //find the list with name:listname
            foundList.items.push(newItemEntered); //push newitem name in items[] of foundlist
            foundList.save();
            res.redirect("/"+listName)
        })
    }
    
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
    const listName=req.body.listName; //to get the listname to which item, to be deleted, belongs
    if(listName=="Today"){
        Item.findByIdAndRemove(deletedId,(err)=>{
            if(err){
                console.log(err);
            }else{
                console.log("Deleted successfully");
            }
        })
        res.redirect("/")
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items:{_id:deletedId}}},(err,foundList)=>{ 
            //-------------IMPORTANT-----------
            if(!err){
                res.redirect("/"+listName)
            }
        });
    }


    
    // res.redirect("/")
    
})

app.listen(3000, () => {
    console.log("server running at port 3000...");
})