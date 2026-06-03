-- Cloud Nexus HR Management Platform Database Schema
-- MySQL 8.0+

-- Create database (use cloudnexushr to match ECS environment variable)
CREATE DATABASE IF NOT EXISTS cloudnexushr
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cloudnexushr;

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  joining_date DATE NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_department (department),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  status ENUM('OPEN', 'CLOSED', 'FILLED') DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applicants Table
CREATE TABLE IF NOT EXISTS applicants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  resume_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  applicant_id INT NOT NULL,
  job_id INT NOT NULL,
  status ENUM('PENDING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED', 'ACCEPTED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  UNIQUE KEY unique_application (applicant_id, job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('EMPLOYEE', 'HR_ADMIN', 'ADMIN') DEFAULT 'EMPLOYEE',
  employee_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Data

-- Sample Employees
INSERT INTO employees (name, email, department, designation, phone, joining_date, status) VALUES
('Priya Sharma', 'priya.sharma@cloudnexus.com', 'HR', 'HR Manager', '+1-234-567-8901', '2022-01-15', 'ACTIVE'),
('Divya Krishnan', 'divya.krishnan@cloudnexus.com', 'HR', 'Recruitment Specialist', '+1-234-567-8902', '2022-06-01', 'ACTIVE'),
('Neha Singh', 'neha.singh@cloudnexus.com', 'HR', 'HR Consultant', '+1-234-567-8903', '2023-01-10', 'ACTIVE'),
('Rajesh Kumar', 'rajesh.kumar@cloudnexus.com', 'Engineering', 'Senior Software Engineer', '+1-234-567-8904', '2021-03-20', 'ACTIVE'),
('Arjun Patel', 'arjun.patel@cloudnexus.com', 'Engineering', 'Junior Developer', '+1-234-567-8905', '2023-07-01', 'ACTIVE'),
('Sanjana Verma', 'sanjana.verma@cloudnexus.com', 'Sales', 'Sales Manager', '+1-234-567-8906', '2022-02-14', 'ACTIVE'),
('Vikram Singh', 'vikram.singh@cloudnexus.com', 'Sales', 'Sales Executive', '+1-234-567-8907', '2023-04-15', 'ACTIVE'),
('Anjali Desai', 'anjali.desai@cloudnexus.com', 'Finance', 'Finance Manager', '+1-234-567-8908', '2021-11-01', 'ACTIVE'),
('Karan Malhotra', 'karan.malhotra@cloudnexus.com', 'Engineering', 'DevOps Engineer', '+1-234-567-8909', '2022-09-10', 'ACTIVE'),
('Meera Nair', 'meera.nair@cloudnexus.com', 'Marketing', 'Marketing Manager', '+1-234-567-8910', '2022-05-20', 'ACTIVE');

-- Sample Jobs
INSERT INTO jobs (title, department, location, description, status) VALUES
('Senior Full Stack Developer', 'Engineering', 'New York, NY', 'Looking for experienced full-stack developers with 5+ years experience', 'OPEN'),
('Cloud Architect', 'Engineering', 'San Francisco, CA', 'Design and implement cloud solutions on AWS/Azure', 'OPEN'),
('HR Business Partner', 'HR', 'Remote', 'Support HR initiatives and employee development', 'OPEN'),
('Sales Director', 'Sales', 'Chicago, IL', 'Lead sales team and drive revenue growth', 'OPEN'),
('Data Analyst', 'Engineering', 'Boston, MA', 'Analyze data and create insights for business decisions', 'OPEN'),
('Content Marketing Specialist', 'Marketing', 'Los Angeles, CA', 'Create engaging content for digital channels', 'OPEN'),
('Financial Analyst', 'Finance', 'Denver, CO', 'Analyze financial data and support budgeting', 'OPEN'),
('Customer Success Manager', 'Sales', 'Remote', 'Manage customer relationships and ensure satisfaction', 'OPEN');

-- Sample Applicants
INSERT INTO applicants (name, email, phone, resume_url) VALUES
('John Doe', 'john.doe@email.com', '+1-555-1001', '/resumes/john_doe.pdf'),
('Jane Smith', 'jane.smith@email.com', '+1-555-1002', '/resumes/jane_smith.pdf'),
('Michael Johnson', 'michael.j@email.com', '+1-555-1003', '/resumes/michael_johnson.pdf'),
('Sarah Williams', 'sarah.w@email.com', '+1-555-1004', '/resumes/sarah_williams.pdf'),
('David Brown', 'david.b@email.com', '+1-555-1005', '/resumes/david_brown.pdf'),
('Emily Davis', 'emily.d@email.com', '+1-555-1006', '/resumes/emily_davis.pdf'),
('Robert Miller', 'robert.m@email.com', '+1-555-1007', '/resumes/robert_miller.pdf'),
('Lisa Anderson', 'lisa.a@email.com', '+1-555-1008', '/resumes/lisa_anderson.pdf');

-- Sample Applications
INSERT INTO applications (applicant_id, job_id, status) VALUES
(1, 1, 'SHORTLISTED'),
(2, 1, 'PENDING'),
(3, 2, 'INTERVIEW'),
(4, 3, 'PENDING'),
(5, 4, 'OFFER'),
(6, 5, 'SHORTLISTED'),
(7, 6, 'REJECTED'),
(8, 7, 'ACCEPTED');

-- Sample Leave Requests
INSERT INTO leave_requests (employee_id, start_date, end_date, reason, status) VALUES
(1, '2026-06-10', '2026-06-15', 'Vacation', 'APPROVED'),
(2, '2026-06-20', '2026-06-22', 'Medical', 'PENDING'),
(3, '2026-07-01', '2026-07-07', 'Annual vacation', 'APPROVED'),
(4, '2026-06-15', '2026-06-16', 'Personal', 'PENDING'),
(5, '2026-08-01', '2026-08-10', 'Summer vacation', 'APPROVED');

-- Sample Support Tickets
INSERT INTO support_tickets (employee_id, subject, description, status, priority) VALUES
(1, 'System Access Issue', 'Unable to access HR portal', 'OPEN', 'HIGH'),
(2, 'Password Reset Request', 'Need to reset my password', 'RESOLVED', 'LOW'),
(3, 'Leave Balance Query', 'Need to check my leave balance', 'CLOSED', 'MEDIUM'),
(4, 'Payroll Discrepancy', 'Noticed an error in my salary', 'IN_PROGRESS', 'CRITICAL'),
(5, 'Benefits Enrollment', 'Help with benefits enrollment process', 'OPEN', 'MEDIUM');

-- Sample Users
INSERT INTO users (employee_id, username, email, password_hash, role) VALUES
(1, 'priya', 'priya.sharma@cloudnexus.com', '$2b$10$hashedpassword1', 'HR_ADMIN'),
(4, 'rajesh', 'rajesh.kumar@cloudnexus.com', '$2b$10$hashedpassword2', 'EMPLOYEE'),
(6, 'sanjana', 'sanjana.verma@cloudnexus.com', '$2b$10$hashedpassword3', 'EMPLOYEE'),
(NULL, 'admin', 'admin@cloudnexus.com', '$2b$10$hashedpassword4', 'ADMIN');
