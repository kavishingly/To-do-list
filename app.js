const express = require("express")
const bodyParser = require("body-parser")
const app = express();
const items=["Buy food","Eat food","Sleep"]; //array of items
const workItems=["Meeting at 4pm","Study","Sleep"]; //array of work-items
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); //to serve static files
app.set('view engine', 'ejs'); 

app.get("/", (req, res) => { //1. server will give home page as response to get request by browser

    var today = new Date();
    var currentDay = today.getDay();
    var option = { //to format the date --long means september
        weekday: "long",
        month: "long",
        day: "numeric"
    }
    var day = today.toLocaleDateString("en-US", option);
    res.render('list', 
    { title: day,
        items: items
     }); //this will load the list.ejs and pass params title and items array
     
});
app.get("/work",(req,res)=>{
    
    res.render("list",{title:"Work list",items:workItems})
    //when get request to work route is made, it renders list.ejs with above params
})
app.post('/',(req,res)=>{ //2. when submit btn is hit, form POST the data at home route
    const item= req.body.newItem 
    /*here newItem is value name attribute in input tag
    console.log(req.body); it returns an object eg { newItem: 'input text', listType: 'Work' }
    now when submit btn is hit, if the page was Day then listType='thursday',
        and if page was Work list then listType="Work" */
    if(req.body.listType==="Work"){
        workItems.push(item);
        res.redirect("/work"); //listType="Work" then push item to work array and load work route
    }else{
        items.push(item)
        res.redirect("/"); //else push item to items array and load home route
    
    }
})

app.listen(3000, () => {
    console.log("server running at port 3000...");
})