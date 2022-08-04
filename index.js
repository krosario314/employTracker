const inquirer = require('inquirer');
const consoleTable = require('console.table')
const mysql = require('mysql2');


// my connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodedbsql'
});



// connection to mysql
db.connect(err => {
    if(err) {
        throw err 
    }
    console.log('MySQL Connection')
});

sqlConnect = () => {
    console.log("___________________________________")
    console.log("|               ***               |")
    console.log("|        EMPLOYEE TRACKER         |")
    console.log("|               ***               |")
    console.log("----------------------------------")
    promptUser();
  };
  
  // inquirer prompt for first action
  const promptUser = () => {}
    inquirer.prompt ([
      {
        type: 'list',
        name: 'choices', 
        message: 'What would you like to do?',
        choices: ['View departments',
                  'Add department', 
                  'View employees',
                  'Add employee',
                  'View roles',
                  'Add role',
                  'exit']
      }
    ])
      .then((answers) => {
        const { choices } = answers; 
  
        if (choices === "View departments") {
          showDepartments();
        }
  
        if (choices === "View roles") {
          showRoles();
        }
  
        if (choices === "View employees") {
          showEmployees();
        }
  
        if (choices === "Add department") {
          addDepartment();
        }
  
        if (choices === "Add role") {
          addRole();
        }
  
        if (choices === "Add employee") {
          addEmployee();
        }
  
        if (choices === "exit") {
          updateEmployee();
        }});
// to show all the departments
viewDepartments = () => {
  console.log('all departments...\n');
  const sql = `SELECT department.id AS id, department.name AS department FROM department`; 

  connection.promise().query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

// to show all the roles of the employee
viewRoles = () => {
    console.log('all roles...\n');
  
    const sql = `SELECT role.id, role.title, department.name AS department
                 FROM role
                 INNER JOIN department ON role.department_id = department.id`;
    
    connection.promise().query(sql, (err, rows) => {
      if (err) throw err; 
      console.table(rows); 
      promptUser();
    })
  };