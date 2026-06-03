-- Sample Data for Cloud Nexus HR Platform

-- Insert Sample Employees
INSERT INTO employees (name, email, department, designation, phone, joining_date, status) VALUES
('Rajesh Kumar', 'rajesh.kumar@cloudnexus.com', 'Engineering', 'Senior Engineer', '+91-9876543210', '2022-01-15', 'ACTIVE'),
('Priya Sharma', 'priya.sharma@cloudnexus.com', 'HR', 'HR Manager', '+91-9876543211', '2021-06-01', 'ACTIVE'),
('Amit Patel', 'amit.patel@cloudnexus.com', 'Sales', 'Sales Executive', '+91-9876543212', '2022-03-20', 'ACTIVE'),
('Neha Singh', 'neha.singh@cloudnexus.com', 'Marketing', 'Marketing Manager', '+91-9876543213', '2021-11-10', 'ACTIVE'),
('Vikram Desai', 'vikram.desai@cloudnexus.com', 'Engineering', 'DevOps Engineer', '+91-9876543214', '2023-02-28', 'ACTIVE'),
('Anjali Gupta', 'anjali.gupta@cloudnexus.com', 'Finance', 'Financial Analyst', '+91-9876543215', '2022-09-05', 'ACTIVE'),
('Ravi Menon', 'ravi.menon@cloudnexus.com', 'Engineering', 'QA Engineer', '+91-9876543216', '2023-01-10', 'ACTIVE'),
('Divya Krishnan', 'divya.krishnan@cloudnexus.com', 'HR', 'Recruitment Specialist', '+91-9876543217', '2022-07-15', 'ACTIVE'),
('Suresh Iyer', 'suresh.iyer@cloudnexus.com', 'Operations', 'Operations Manager', '+91-9876543218', '2021-04-20', 'ON_LEAVE'),
('Maya Verma', 'maya.verma@cloudnexus.com', 'Marketing', 'Content Strategist', '+91-9876543219', '2023-05-12', 'ACTIVE');

-- Insert Sample Jobs
INSERT INTO jobs (title, department, location, description, status) VALUES
('Senior Full Stack Engineer', 'Engineering', 'Bangalore', 'We are looking for an experienced Full Stack Engineer with expertise in React and Node.js', 'OPEN'),
('Cloud Solutions Architect', 'Engineering', 'Delhi', 'Design and implement cloud solutions for our enterprise clients', 'OPEN'),
('HR Business Partner', 'HR', 'Mumbai', 'Strategic HR role focusing on employee development and organizational growth', 'OPEN'),
('Data Scientist', 'Engineering', 'Bangalore', 'Analyze complex datasets and build predictive models using ML/AI', 'OPEN'),
('Sales Manager', 'Sales', 'Bangalore', 'Lead sales team and drive revenue growth in the enterprise segment', 'CLOSED'),
('UX/UI Designer', 'Engineering', 'Bangalore', 'Design intuitive interfaces for our cloud platforms', 'OPEN'),
('DevOps Engineer', 'Engineering', 'Hyderabad', 'Manage infrastructure and implement CI/CD pipelines on AWS', 'OPEN'),
('Business Analyst', 'Operations', 'Mumbai', 'Gather requirements and analyze business processes', 'DRAFT');

-- Insert Sample Applicants
INSERT INTO applicants (name, email, phone, resume_url) VALUES
('Arun Kumar', 'arun.kumar@example.com', '+91-9876543220', '/uploads/arun_resume.pdf'),
('Deepika Rao', 'deepika.rao@example.com', '+91-9876543221', '/uploads/deepika_resume.pdf'),
('Rohan Singh', 'rohan.singh@example.com', '+91-9876543222', '/uploads/rohan_resume.pdf'),
('Pooja Nair', 'pooja.nair@example.com', '+91-9876543223', '/uploads/pooja_resume.pdf'),
('Sanjay Reddy', 'sanjay.reddy@example.com', '+91-9876543224', '/uploads/sanjay_resume.pdf'),
('Priya Jain', 'priya.jain@example.com', '+91-9876543225', '/uploads/priya_resume.pdf'),
('Karan Malik', 'karan.malik@example.com', '+91-9876543226', '/uploads/karan_resume.pdf'),
('Sneha Chatterjee', 'sneha.chatterjee@example.com', '+91-9876543227', '/uploads/sneha_resume.pdf');

-- Insert Sample Applications
INSERT INTO applications (applicant_id, job_id, status) VALUES
(1, 1, 'SHORTLISTED'),
(2, 1, 'INTERVIEW'),
(3, 2, 'PENDING'),
(4, 3, 'OFFER'),
(5, 4, 'PENDING'),
(6, 6, 'SHORTLISTED'),
(7, 7, 'PENDING'),
(8, 6, 'REJECTED');

-- Insert Sample Leave Requests
INSERT INTO leave_requests (employee_id, start_date, end_date, reason, status) VALUES
(1, '2026-06-10', '2026-06-15', 'Annual vacation', 'APPROVED'),
(2, '2026-06-20', '2026-06-22', 'Medical leave', 'PENDING'),
(3, '2026-07-01', '2026-07-07', 'Summer vacation', 'APPROVED'),
(4, '2026-06-15', '2026-06-17', 'Personal work', 'REJECTED'),
(5, '2026-06-25', '2026-06-26', 'Casual leave', 'PENDING');

-- Insert Sample Support Tickets
INSERT INTO support_tickets (employee_id, subject, description, status) VALUES
(1, 'System Access Issue', 'Unable to access project management tool', 'RESOLVED'),
(2, 'Document Request', 'Need experience certificate for visa application', 'OPEN'),
(3, 'Payroll Discrepancy', 'Salary amount mismatch in June statement', 'IN_PROGRESS'),
(4, 'Work Laptop Issue', 'Laptop keyboard not working properly', 'OPEN'),
(5, 'Leave Policy Query', 'Questions regarding maternity leave eligibility', 'RESOLVED');

-- Insert Sample Users (for authentication)
INSERT INTO users (employee_id, username, email, password_hash, role) VALUES
(1, 'rajesh', 'rajesh.kumar@cloudnexus.com', '$2b$10$hashedpassword1', 'EMPLOYEE'),
(2, 'priya', 'priya.sharma@cloudnexus.com', '$2b$10$hashedpassword2', 'HR_ADMIN'),
(3, 'amit', 'amit.patel@cloudnexus.com', '$2b$10$hashedpassword3', 'EMPLOYEE'),
(NULL, 'admin', 'admin@cloudnexus.com', '$2b$10$hashedpassword4', 'ADMIN');
