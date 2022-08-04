const inquirer = require("inquirer");
const consoleTable = require("console.table");
const mysql = require("mysql2");

// my connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nodedbsql",
});

// connection to mysql
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL Connection");
});

sqlConnect = () => {
  console.log("___________________________________");
  console.log("|               ***               |");
  console.log("|        EMPLOYEE TRACKER         |");
  console.log("|               ***               |");
  console.log("----------------------------------");
  promptUser();
};

// inquirer prompt for first action
const promptUser = () => {};
inquirer
  .prompt([
    {
      type: "list",
      name: "choices",
      message: "What would you like to do?",
      choices: [
        "View departments",
        "Add department",
        "View employees",
        "Add employee",
        "View roles",
        "Add role",
        "exit",
      ],
    },
  ])
  .then((answers) => {
    const { choices } = answers;

    if (choices === "View departments") {
      viewDepartments();
    }

    if (choices === "View roles") {
      viewRoles();
    }

    if (choices === "View employees") {
      showEmployees();
    }

    if (choices === "Add department") {
      newDepartment();
    }

    if (choices === "Add role") {
      newRole();
    }

    if (choices === "Add employee") {
      newEmployee();
    }

    if (choices === "exit") {
      updateEmployee();
    }
  });
// to show all the departments
viewDepartments = () => {
  console.log("all departments...\n");
  const sql = `SELECT department.id AS id, department.name AS department FROM department`;

  connection.promise().query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

// to show all the roles of the employee
viewRoles = () => {
  console.log("all roles...\n");

  const sql = `SELECT role.id, role.title, department.name AS department
                 FROM role
                 INNER JOIN department ON role.department_id = department.id`;

  connection.promise().query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

// to show all the employees within company
showEmployees = () => {
  console.log("Showing all employees...\n");
  const sql = `SELECT employee.id, 
                        employee.first_name, 
                        employee.last_name, 
                        role.title, 
                        department.name AS department,
                        role.salary, 
                        CONCAT (manager.first_name, " ", manager.last_name) AS manager
                 FROM employee
                        LEFT JOIN role ON employee.role_id = role.id
                        LEFT JOIN department ON role.department_id = department.id
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`;
  connection.promise().query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

// where employer can add departments
Department = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "addDept",
        message: "Enter new department name.",
        validate: (addDept) => {
          if (addDept) {
            return true;
          } else {
            console.log("Please enter a department");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const sql = `INSERT INTO department (name)
                    VALUES (?)`;
      connection.query(sql, answer.addDept, (err, result) => {
        if (err) throw err;
        console.log("Added " + answer.addDept + " to departments!");

        viewDepartments();
      });
    });
};

// roles //
newRole = () => {
  inquirer.prompt([
    {
      type: 'input', 
      name: 'role',
      message: "What role do you want to add?",
      validate: newRole => {
        if (newRole) {
            return true;
        } else {
            console.log('Please enter a role');
            return false;
        }
      }
    },
    {
      type: 'input', 
      name: 'salary',
      message: "What is the salary of this role?",
      validate: addSalary => {
        if (isNAN(addSalary)) {
            return true;
        } else {
            console.log('Please enter a salary');
            return false;
        }
      }
    }
  ])
    .then(answer => {
      const params = [answer.role, answer.salary];

      
      const role4SQL = `SELECT name, id FROM department`; 

      connection.promise().query(role4SQL, (err, data) => {
        if (err) throw err; 
    
        const dept = data.map(({ name, id }) => ({ name: name, value: id }));

        inquirer.prompt([
        {
          type: 'list', 
          name: 'dept',
          message: "What department is this role in?",
          choices: dept
        }
        ])
          .then(departChoice => {
            const dept = departChoice.dept;
            params.push(dept);

            const sql = `INSERT INTO role (title, salary, department_id)
                        VALUES (?, ?, ?)`;

            connection.query(sql, params, (err, result) => {
              if (err) throw err;
              console.log('Added' + answer.role + " to roles!"); 

              viewRoles();
       });
     });
   });
 });
};

// employees //
newEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'fistName',
      message: "Enter employee's first name?",
      validate: addFirst => {
        if (addFirst) {
            return true;
        } else {
            console.log('Please enter a first name');
            return false;
        }
      }
    },
    {
      type: 'input',
      name: 'lastName',
      message: "Enter employee's last name?",
      validate: addLast => {
        if (addLast) {
            return true;
        } else {
            console.log('Please enter a last name');
            return false;
        }
      }
    }
  ])
    .then(answer => {
    const params = [answer.fistName, answer.lastName]
// now we need to get the role of employeee //
    const role4SQL = `SELECT role.id, role.title FROM role`;
  
    connection.promise().query(role4SQL, (err, data) => {
      if (err) throw err; 
      
      const roles = data.map(({ id, title }) => ({ name: title, value: id }));

      inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: "What is the employee's role?",
              choices: roles
            }
          ])
            .then(roleChoice => {
              const role = roleChoice.role;
              params.push(role);

              const managerSql = `SELECT * FROM employee`;

              connection.promise().query(managerSql, (err, data) => {
                if (err) throw err;

                const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));

                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: managers
                  }
                ])
                  .then(managerChoice => {
                    const manager = managerChoice.manager;
                    params.push(manager);

                    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`;

                    connection.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log("Employee has been added!")

                    showEmployees();
              });
            });
          });
        });
     });
  });
};