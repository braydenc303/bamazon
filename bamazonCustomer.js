// Challenge #1: Customer View (Minimum Requirement)
// Create a MySQL Database called bamazon.
// Then create a Table inside of that database called products.
// The products table should have each of the following columns:
// item_id (unique id for each product)
// product_name (Name of product)
// department_name
// price (cost to customer)
// stock_quantity (how much of the product is available in stores)
// Populate this database with around 10 different products. (i.e. Insert "mock" data rows into this database and table).
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
// Then create a Node application called bamazonCustomer.js. Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.

function readProducts() {
    var items = [];
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      res.forEach(function(item){
          console.log(`Item Number: ${item.item_id} | Item Name: ${item.product_name} | Department: ${item.department_name} | Price: $ ${item.price}`);
          items.push(item.product_name);
      });
      currentStock = res;
      inquirer
      .prompt([
          {
            name: "action",
            type: "list",
            message: "What would you like to do next?",
            choices: ["Place an order.", "Exit the system."]
          }
      ]).then(function(answer){
          if(answer.action === "Place an order."){
            order(items);
          } else {
              console.log("Thanks. We will see you next time.");
              connection.end();
              return false;
          }
      })
    
    });
  };

// The app should then prompt users with two messages.
function order(items){
  inquirer
    .prompt([
        // The first should ask them the ID of the product they would like to buy.
        {
            name: "item",
            type: "list",
            message: "\nChoose the item you would like to order.\n",
            choices: items,
        },
        // The second message should ask how many units of the product they would like to buy.
        {
            name: "quant",
            type: "input",
            message: "\nHow many would you like to purchase?",
            validate: function(input){
                if(typeof parseInt(input.quant) === "number") {
                    return true;
                } else {
                    return false;
                }
            }
        }
    ])
        .then (function(inquirerRes){
            // Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
            // If your store does have enough of the product, you should fulfill the customer's order.
            // This means updating the SQL database to reflect the remaining quantity.
            // Once the update goes through, show the customer the total cost of their purchase.
            connection.query(`SELECT * FROM products WHERE ?`,[{product_name: inquirerRes.item}], function(err, res){
                if (err) throw err;
                if (inquirerRes.quant <= res[0].stock_qty){
                    connection.query(`UPDATE products SET ? WHERE ?`, 
                    [{
                        stock_qty: res[0].stock_qty - inquirerRes.quant
                    },{
                        product_name: inquirerRes.item
                    }
                    ], function(err, response){
                        if (err) throw err;
                        console.log(`Thank you. Your order of ${inquirerRes.quant} ${inquirerRes.item} for a total of $${inquirerRes.quant * res[0].price} will ship soon.\nWe will notify you as soon as it is on it's way.\nPlease print this page for your records.\n`);
                        readProducts();
                    });
                } else {
                    console.log(`We are sorry. We only have ${res[0].stock_qty} on hand. Please place a smaller order.`);
                    readProducts();
                }
            })
        });
};






