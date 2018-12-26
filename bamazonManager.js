var inquirer = require("inquirer");
var mysql = require("mysql");
var fs = require("fs");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_DB"
  });
  
  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    readProducts();
  });

  var items = [];
  var prices = [];
  var qty = [];
  var currentStock = [];

function readProducts() {
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      res.forEach(function(item){
          console.log(`Item Number: ${item.item_id} | Item Name: ${item.product_name} | Department: ${item.department_name} | Price: $ ${item.price} | Qty: ${item.stock_qty}\n`);
          //This would also be a good place to push item choices and qty into an array to check, or, I could simply save the response object for later reference.
          items.push(item.product_name);
          prices.push(item.price);
          qty.push(item.stock_qty);
      });
      currentStock = res;
    //   console.log(items);
      managerOptions();
    //   console.log(currentStock);
    //   console.log(items, qty);
    //   connection.end();
    });
};

function readLow(){
    connection.query("SELECT * FROM products WHERE stock_qty < 5", function(err, res){
        if (err) throw err;
        res.forEach(function(item){
            console.log(`Item Number: ${item.item_id} | Item Name: ${item.product_name} | Department: ${item.department_name} | Price: $ ${item.price} | Qty: ${item.stock_qty}\n`);
        });
        managerOptions();
    });
};

function addInv(){
    inquirer
        .prompt([
            {
                name: "item",
                type: "list",
                message: "Choose the time number you would like to update.",
                choices: items
            },
            {
                name: "qty",
                type: "input",
                message: "Enter the quantity to add."
            }
        ]) .then(function(answers){
            console.log(`\nAdding ${answers.qty} to stock of ${answers.item}.\n`);
            connection.query(`UPDATE products SET stock_qty = stock_qty + ${answers.qty} WHERE product_name = "${answers.item}"`, function(err, res){
                if (err) throw err;
                console.log("Item Updated");
                readProducts();
            });
        });
};

function addNew(){
    inquirer
        .prompt([
            {
                name:"product_name",
                type:"input",
                message:"Enter the name of the item as you would like it to appear."
            },
            {
                name:"department_name",
                type:"list",
                message: "Choose the item's department.",
                choices: ["Cutlery", "Kitchen Tools", "Apparel"]
            },
            {
                name:"price",
                type:"input",
                message:"Enter the retail price for the item."
            },
            {
                name:"stock_qty",
                type:"input",
                message:"Enter the qty on hand if any.",
                default: 0
            }
        ]) .then(function(answers){
            console.log(answers);
            connection.query(`INSERT INTO products VALUES (NULL, '${answers.product_name}', '${answers.department_name}', ${answers.price}, ${answers.stock_qty})`, function(err, res){
                if (err) throw err;
                console.log("Adding records:");
                readProducts();
            })
        })
}

function managerOptions(){
    inquirer
        .prompt([
            {
                name: "options",
                type: "list",
                message: "What would you like to do?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
            }
        ]) .then(function(answer){
            switch(answer.options){
                case "View Products for Sale":
                readProducts();
                break;
                case "View Low Inventory":
                readLow();
                break;
                case "Add to Inventory":
                addInv();
                break;
                case "Add New Product":
                addNew();
                break;
                case "Exit":
                connection.end();
                return false;
            }
        })
}