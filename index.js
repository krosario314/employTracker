const mysql = require("mysql2");
const inquirer = require("inquirer");

const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: "flower",
    database: "employee_tracker_db",
  },
  console.log(`Connected to the employee_tracker_db database.`)
);

const { Console } = require("console");
const { Transform } = require("stream");
function table(input) {
  const ts = new Transform({
    transform(chunk, enc, cb) {
      cb(null, chunk);
    },
  });
  const logger = new Console({ stdout: ts });
  logger.table(input);
  const table = (ts.read() || "").toString();
  let result = "";
  for (let row of table.split(/[\r\n]+/)) {
    let r = row.replace(/[^┬]*┬/, "┌");
    r = r.replace(/^├─*┼/, "├");
    r = r.replace(/│[^│]*/, "");
    r = r.replace(/^└─*┴/, "└");
    r = r.replace(/'/g, " ");
    result += `${r}\n`;
  }
  console.log(result);
}

function viewAllEmployees() {
  db.query(
    `SELECT A.id AS ID, A.first_name AS First_Name, A.last_name AS Last_Name, role.title AS Title, 
    department.name AS Department, role.salary AS Salary, B.first_name AS Manager_First_Name, B.last_name AS Manager_Last_Name 
    FROM employee A 
    LEFT JOIN role ON A.role_id=role.id 
    LEFT JOIN department ON role.department_id=department.id 
    LEFT JOIN employee B ON A.manager_id=B.id`,
    3,
    (err, res) => {
      if (err) {
        console.log(err);
      }
      table(res);
      wwyltd();
    }
  );
}

function viewAllDepartments() {
  db.query(
    `SELECT id AS ID, name AS Department FROM department`,
    3,
    (err, res) => {
      if (err) {
        console.log(err);
      }
      table(res);
      wwyltd();
    }
  );
}

function viewAllRoles() {
  db.query(
    `SELECT role.id AS ID, role.title AS Title, department.name AS Department, role.salary as Salary FROM role JOIN department ON role.department_id=department.id`,
    3,
    (err, res) => {
      if (err) {
        console.log(err);
      }
      table(res);
      wwyltd();
    }
  );
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department?",
        name: "depName",
      },
    ])
    .then((res) => {
      db.query(`INSERT INTO department(name) VALUES ('${res.depName}')`);
      console.log(`Added ${res.depName} to the database.`);
      wwyltd();
    });
}

function addRole() {
  let departmentsArray = [];
  db.query(`SELECT name FROM department`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => departmentsArray.push(e.name));
  });
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the role?",
        name: "roleName",
      },
      {
        type: "input",
        message: "What is the salary of the role?",
        name: "roleSal",
      },
      {
        type: "list",
        message: "Which department does the role belong to?",
        name: "roleDep",
        choices: departmentsArray,
      },
    ])
    .then((res) => {
      db.query(`INSERT INTO role(title,salary,department_id)
        VALUES ("${res.roleName}", ${res.roleSal}, ${
        departmentsArray.indexOf(res.roleDep) + 1
      })`);
      console.log(`Added ${res.roleName} to the database`);
      wwyltd();
    });
}

function addEmployee() {
  let rolesArray = [];
  let managerArray = ["None"];
  db.query(`SELECT title FROM role`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => rolesArray.push(e.title));
  });
  db.query(`SELECT first_name, last_name FROM employee`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => managerArray.push(e.first_name + " " + e.last_name));
  });
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the first name of the employee?",
        name: "first",
      },
      {
        type: "input",
        message: "What is the last name of the employee?",
        name: "last",
      },

      {
        type: "list",
        message: "What is the employee's role?",
        name: "empRole",
        choices: rolesArray,
      },
      {
        type: "list",
        message: "Who is the employee's manager?",
        name: "empManager",
        choices: managerArray,
      },
    ])
    .then((res) => {
      if (res.empManager === "None") {
        db.query(`INSERT INTO employee(first_name,last_name,role_id,manager_id)
      VALUES ("${res.first}", "${res.last}", ${
          rolesArray.indexOf(res.empRole) + 1
        }, NULL)`);
      } else {
        db.query(`INSERT INTO employee(first_name,last_name,role_id,manager_id)
      VALUES ("${res.first}", "${res.last}", ${
          rolesArray.indexOf(res.empRole) + 1
        }, ${managerArray.indexOf(res.empManager)})`);
      }

      console.log(`Added ${res.first} ${res.last} to the database`);
      wwyltd();
    });
}

function updateEmployeeRole() {
  let employeeArray = [];
  let rolesArray = [];
  db.query(`SELECT first_name, last_name FROM employee`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => employeeArray.push(e.first_name + " " + e.last_name));
  });
  db.query(`SELECT title FROM role`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => rolesArray.push(e.title));
  });
  setTimeout(() => {
    inquirer
      .prompt([
        {
          type: "list",
          message: "What employee would you like to update?",
          name: "emp",
          choices: employeeArray,
        },
        {
          type: "list",
          message: "What role do you want to employee to have?",
          name: "rol",
          choices: rolesArray,
        },
      ])
      .then((promptRes) => {
        db.query(
          `UPDATE employee SET role_id=${
            rolesArray.indexOf(promptRes.rol) + 1
          } WHERE id=${employeeArray.indexOf(promptRes.emp) + 1}`,
          3,
          (err, res) => {
            if (err) {
              console.log(err);
            }
            wwyltd();
          }
        );
      });
  }, 200);
}

function updateEmployeeManager() {
  let employeeArray = [];
  let managerArray = ["None"];
  db.query(`SELECT first_name, last_name FROM employee`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => {
      employeeArray.push(e.first_name + " " + e.last_name);
      managerArray.push(e.first_name + " " + e.last_name);
    });
  });
  setTimeout(() => {
    inquirer
      .prompt([
        {
          type: "list",
          message: "What employee would you like to update?",
          name: "emp",
          choices: employeeArray,
        },
        {
          type: "list",
          message: "What new manager do you want to employee to have?",
          name: "newMan",
          choices: managerArray,
        },
      ])
      .then((promptRes) => {
        if (promptRes.newMan === "None") {
          db.query(
            `UPDATE employee SET manager_id=NULL WHERE id=${
              employeeArray.indexOf(promptRes.emp) + 1
            }`,
            3,
            (err, res) => {
              if (err) {
                console.log(err);
              }
              wwyltd();
            }
          );
        } else {
          db.query(
            `UPDATE employee SET manager_id=${managerArray.indexOf(
              promptRes.newMan
            )} WHERE id=${employeeArray.indexOf(promptRes.emp) + 1}`,
            3,
            (err, res) => {
              if (err) {
                console.log(err);
              }
              wwyltd();
            }
          );
        }
      });
  }, 200);
}

function viewByManager() {
  let employeeArray = [];
  let empArrayIndex = [];
  db.query(`SELECT id, first_name, last_name FROM employee`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => {
      employeeArray.push(e.first_name + " " + e.last_name);
      empArrayIndex.push(e.id);
    });
  });
  setTimeout(() => {
    inquirer
      .prompt([
        {
          type: "list",
          message: "What manager's employees would you like to see?",
          name: "man",
          choices: employeeArray,
        },
      ])
      .then((promptRes) => {
        let index = empArrayIndex[employeeArray.indexOf(promptRes.man)];
        db.query(
          `SELECT first_name as First_Name, last_name as Last_Name FROM employee WHERE manager_id=${index}`,
          3,
          (err, res) => {
            if (err) {
              console.log(err);
            }
            table(res);
            wwyltd();
          }
        );
      });
  }, 200);
}

function viewByDepartment() {
  let depArray = [];
  let depArrayIndex = [];
  db.query(`SELECT id,name FROM department`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => {
      depArray.push(e.name);
      depArrayIndex.push(e.id);
    });
  });
  setTimeout(() => {
    inquirer
      .prompt([
        {
          type: "list",
          message: "What department's employees would you like to see?",
          name: "dep",
          choices: depArray,
        },
      ])
      .then((promptRes) => {
        let index = depArrayIndex[depArray.indexOf(promptRes.dep)];
        db.query(
          `SELECT employee.first_name as First_Name, employee.last_name as Last_Name, role.title as Title FROM employee 
          JOIN role ON employee.role_id=role.id JOIN department ON role.department_id=department.id WHERE department.id=${index}`,

          (err, res) => {
            if (err) {
              console.log(err);
            }
            table(res);
            wwyltd();
          }
        );
      });
  }, 200);
}

function deleteADepartment() {
  let depArray = [];
  let depArrayIndex = [];
  db.query(`SELECT id, name FROM department`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => {
      depArray.push(e.name);
      depArrayIndex.push(e.id);
    });
  });
  setTimeout(() => {
    inquirer
      .prompt([
        {
          type: "list",
          message: "What department do you want to delete?",
          name: "dep",
          choices: depArray,
        },
      ])
      .then((promptRes) => {
        let index = depArrayIndex[depArray.indexOf(promptRes.dep)];
        db.query(
          `DELETE FROM department WHERE id=${index}`,

          (err, res) => {
            if (err) {
              console.log(err);
            }
            wwyltd();
          }
        );
      });
  }, 200);
}

function deleteARole() {
  let roleArray = [];
  let roleArrayIndex = [];
  db.query(`SELECT id, title FROM role`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => {
      roleArray.push(e.title);
      roleArrayIndex.push(e.id);
    });
  });
  setTimeout(() => {
    inquirer
      .prompt([
        {
          type: "list",
          message: "What role do you want to delete?",
          name: "rol",
          choices: roleArray,
        },
      ])
      .then((promptRes) => {
        let index = roleArrayIndex[roleArray.indexOf(promptRes.rol)];
        db.query(
          `DELETE FROM role WHERE id=${index}`,

          (err, res) => {
            if (err) {
              console.log(err);
            }
            wwyltd();
          }
        );
      });
  }, 200);
}

function deleteAnEmployee() {
  let empArray = [];
  let empArrayIndex = [];
  db.query(`SELECT id,first_name, last_name FROM employee`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => {
      empArray.push(e.first_name + " " + e.last_name);
      empArrayIndex.push(e.id);
    });
  });
  setTimeout(() => {
    inquirer
      .prompt([
        {
          type: "list",
          message: "What employee do you want to delete?",
          name: "emp",
          choices: empArray,
        },
      ])
      .then((promptRes) => {
        let index = empArrayIndex[empArray.indexOf(promptRes.emp)];
        db.query(
          `DELETE FROM employee WHERE id=${index}`,

          (err, res) => {
            if (err) {
              console.log(err);
            }
            wwyltd();
          }
        );
      });
  }, 200);
}

function budget() {
  let depArray = [];
  let depArrayIndex = [];
  db.query(`SELECT id, name FROM department`, 3, (err, res) => {
    if (err) {
      console.log(err);
    }
    res.forEach((e) => {
      depArray.push(e.name);
      depArrayIndex.push(e.id);
    });
  });
  setTimeout(() => {
    inquirer
      .prompt([
        {
          type: "list",
          message: "What department's budget would you like to see?",
          name: "dep",
          choices: depArray,
        },
      ])
      .then((promptRes) => {
        let index = depArrayIndex[depArray.indexOf(promptRes.dep)];
        db.query(
          `SELECT SUM(salary) AS Utilized_Budget FROM role 
          JOIN employee ON employee.role_id=role.id 
          JOIN department ON role.department_id=department.id 
          WHERE department.id=${index}`,

          (err, res) => {
            if (err) {
              console.log(err);
            }
            table(res);
            wwyltd();
          }
        );
      });
  }, 200);
}

//what would you like to do?
function wwyltd() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "choice",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee Role",
          "View All Roles",
          "Add Role",
          "View All Departments",
          "Add Department",
          "Update Employee Manager",
          "View Employees by Manager",
          "View Employees by Department",
          "Delete a Department",
          "Delete a Role",
          "Delete an Employee",
          "View Total Utilized Budget of a Department",
          "Quit",
        ],
      },
    ])
    .then((res) => {
      if (res.choice === "View All Employees") {
        viewAllEmployees();
      }
      if (res.choice === "Add Employee") {
        addEmployee();
      }
      if (res.choice === "Update Employee Role") {
        updateEmployeeRole();
      }
      if (res.choice === "View All Roles") {
        viewAllRoles();
      }
      if (res.choice === "Add Role") {
        addRole();
      }
      if (res.choice === "View All Departments") {
        viewAllDepartments();
      }
      if (res.choice === "Add Department") {
        addDepartment();
      }
      if (res.choice === "Update Employee Manager") {
        updateEmployeeManager();
      }
      if (res.choice === "View Employees by Manager") {
        viewByManager();
      }
      if (res.choice === "View Employees by Department") {
        viewByDepartment();
      }
      if (res.choice === "Delete a Department") {
        deleteADepartment();
      }
      if (res.choice === "Delete a Role") {
        deleteARole();
      }
      if (res.choice === "Delete an Employee") {
        deleteAnEmployee();
      }
      if (res.choice === "View Total Utilized Budget of a Department") {
        budget();
      }
      if (res.choice === "Quit") {
        console.log("Quitting program, Thank you for using Employee Manager");
        process.exit(0);
      }
    });
}

function init() {
  console.log(` ---------------------------
  Employee Tracker
  ---------------------------`);
  wwyltd();
}

init();