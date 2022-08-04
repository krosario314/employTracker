/* including wanted commands */
INSERT INTO department (departmentName)
VALUES
('Engineer'),
('Finance'),
('Legal'),
('Sales');

INSERT INTO role (title, salary, departmentID)
VALUES
('Accountant', 130000, 1),
('Account Manager', 98000, 1),
('Sales Lead', 80000, 2),
('Salesperson', 120000, 2),
('Lead Engineer',160000, 3),
('Software Engineer', 150000, 3),
('Legal Team', 90000, 4),
('Lawyer',200000, 4);
/* not sure if tagged right ^ */

INSERT INTO employee (firstName, lastName, roleID, managerID)
VALUES 
('Jane', 'Doe', 1, ''),
('Colson', 'Baker', 1, 1),
('Machela', 'Rivera', 2, ''),
('Jayda', 'Linn', 2, 2),
('Michelle', 'Castro', 3, ''),
('John', 'Doe', 3, 3),
('Jackson', 'Avery', 4, ''),
('Kevin', 'Rogers', 4, 4);