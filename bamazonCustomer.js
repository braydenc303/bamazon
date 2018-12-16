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
          console.log(`Item Number: ${item.item_id} | Item Name: ${item.product_name} | Department: ${item.department_name} | Price: $ ${item.price}`);
          //This would also be a good place to push item choices and qty into an array to check, or, I could simply save the response object for later reference.
          items.push(item.product_name);
          prices.push(item.price);
          qty.push(item.stock_qty);
      });
      currentStock = res;
    //   console.log(currentStock);
    //   console.log(items, qty);
    //   connection.end();
    order();
    });
  };

// The app should then prompt users with two messages.
function order(){
  inquirer
    .prompt([
        // The first should ask them the ID of the product they would like to buy.
        {
            name: "item",
            type: "input",
            message: "\nEnter the item number you would like to order.",
            validate: function(input){
                if(typeof parseInt(input.item) === "number") {
                    return true;
                } else {
                    return false;
                }
            }
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
            var index = inquirerRes.item - 1;
            var quant = inquirerRes.quant;

            // var item = items[inquirerRes.item];
            // console.log(index);
            if(inquirerRes.quant <= qty[index]){
                console.log(inquirerRes);
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_qty: qty[index]-inquirerRes.quant
                        },
                        {
                            item_id: inquirerRes.item
                        }
                    ]
                );
                console.log(`Thank you. your order of ${quant} ${items[index]} for a total of $${quant * prices[index]} will ship soon. We will notify you as soon as it is on it's way. Please print this page for your records.`)
            } else {
                // If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
                console.log(`\nInsufficient quantity. We only have ${qty[index]} on hand. Please place a smaller order.\n`);
                order();
            }

        });
};





