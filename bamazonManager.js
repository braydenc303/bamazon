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

//   var items = [];
//   var prices = [];
//   var qty = [];
//   var currentStock = [];

function readProducts() {
    //The items variable will need to passed around as an argument between functions in order to ensure that the choices are available to inquirer when needed.
    var items = [];
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      res.forEach(function(item){
          console.log(`Item Number: ${item.item_id} | Item Name: ${item.product_name} | Department: ${item.department_name} | Price: $ ${item.price} | Qty: ${item.stock_qty}\n`);
          items.push(item.product_name);
      });
      currentStock = res;
      managerOptions(items);
    });
};

function readLow(items){
    connection.query("SELECT * FROM products WHERE stock_qty < 5", function(err, res){
        if (err) throw err;
        res.forEach(function(item){
            console.log(`Item Number: ${item.item_id} | Item Name: ${item.product_name} | Department: ${item.department_name} | Price: $ ${item.price} | Qty: ${item.stock_qty}\n`);
        });
        managerOptions(items);
    });
};

function addInv(items){
    inquirer
        .prompt([
            {
                name: "item",
                type: "list",
                message: "Choose the item you would like to update.",
                choices: items
            },
            {
                name: "qty",
                type: "input",
                message: "Enter the quantity to add.",
                validate: function(input){
                    if(typeof parseInt(input.qty) === "number") {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        ]) .then(function(answers){
            connection.query(`SELECT * FROM products WHERE ?`, [{product_name: answers.item}], function(err, res){
                console.log(`\nAdding ${answers.qty} to stock of ${answers.item}.\n`);
                connection.query(`UPDATE products SET ? WHERE ?`, [
                    {
                        stock_qty: parseInt(res[0].stock_qty) + parseInt(answers.qty)
                    },
                    {
                        product_name: answers.item
                    }
                ], function(err, res){
                    if (err) throw err;
                    console.log("Item Updated");
                    readProducts(items);
                });
            })
        
        });
};

function addNew(items){
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
                message:"Enter the retail price for the item.",
                validate: function(input){
                    if(typeof parseInt(input.price) === "number") {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            {
                name:"stock_qty",
                type:"input",
                message:"Enter the qty on hand if any.",
                validate: function(input){
                    if(typeof parseInt(input.stock_qty) === "number") {
                        return true;
                    } else {
                        return false;
                    }
                },
                default: 0
            }
        ]) .then(function(answers){
            console.log(answers);
            connection.query(`INSERT INTO products VALUES (?, ?, ?, ?, ?)`, [null, answers.product_name, answers.department_name, answers.price, answers.stock_qty], function(err, res){
                if (err) throw err;
                console.log("Adding records:");
                readProducts(items);
            })
        })
}

function managerOptions(items){
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
                readLow(items);
                break;
                case "Add to Inventory":
                addInv(items);
                break;
                case "Add New Product":
                addNew(items);
                break;
                case "Exit":
                connection.end();
                return false;
            }
        })
}