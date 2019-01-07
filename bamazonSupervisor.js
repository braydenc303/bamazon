var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table3");

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
    startSupervisor();
  });

function viewSales() {
    // console.log(" department_id  department_name over_head_costs product_sales   total_profit");
    // console.log("-----------------------------------------------------------------------------");
    // ON departments.department_name = products.department_name
    connection.query(`	
    SELECT
     *,
     SUM(product_sales) product_sales,
     (SUM(product_sales) - over_head_costs) total_profit
    FROM
     departments
    LEFT JOIN products ON departments.department_name = products.department_name
    GROUP BY
     departments.department_name
    ORDER BY
     department_id`, function(err, res){
        if (err) throw err;
        var table = new Table({
            head: ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit'],
            colWidth: [100, 100, 100, 100, 100]
        });
        res.forEach(function(department){
            console.log(res);
            table.push(
                [department.department_id, department.department_name, department.over_head_costs, department.product_sales, department.total_profit]
            );
            // console.log(`       ${department.department_id}        ${department.department_name}    $${department.over_head_costs} ${department.product_sales}   ${department.total_profit}`);
            // console.log(department.total_profit);
        });
        console.log(table.toString());
        startSupervisor();
    });
};  

function startSupervisor() {
    inquirer
        .prompt ([
            {
                name: "options",
                type: "list",
                message: "What would you like to do?",
                choices: ["View Product Sales by Department", "Create New Department", "Exit"]
            }
        ]) .then(function(userRes){
            switch(userRes.options){
                case "View Product Sales by Department":
                viewSales();
                break;
                case "Create New Department":
                newDepartment();
                break;
                case "Exit":
                connection.end();
                return false;
            };
        });
};



function newDepartment() {
    inquirer
        .prompt ([
            {
                name: "department_name",
                type: "input",
                message: "Enter the new department name."
            },
            {
                name: "over_head_costs",
                type: "input",
                message: "Enter overhead costs if any.",
                default: 5000,
                validate: function(input){
                    if(typeof parseInt(input.over_head_costs) === "number") {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        ]) .then(function(answers){
                connection.query(`INSERT INTO departments VALUES (?,?,?)`, [null, answers.department_name, answers.over_head_costs], function(err, res){
                    if (err) throw err;
                    viewSales();
                });
            });
};