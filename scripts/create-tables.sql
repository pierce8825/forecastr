-- Create Employee table
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  employee_type TEXT NOT NULL,
  department_id INTEGER,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  salary NUMERIC(12, 2) NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  tax_withholding TEXT,
  is_international BOOLEAN DEFAULT false,
  benefits_eligible BOOLEAN DEFAULT true,
  emergency_contact TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create Payroll table
CREATE TABLE IF NOT EXISTS payrolls (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  payment_date DATE NOT NULL,
  status TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create PayrollItem table
CREATE TABLE IF NOT EXISTS payroll_items (
  id SERIAL PRIMARY KEY,
  payroll_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  hours_worked NUMERIC(8, 2),
  regular_pay NUMERIC(12, 2) NOT NULL,
  overtime_pay NUMERIC(12, 2),
  bonus_pay NUMERIC(12, 2),
  deductions NUMERIC(12, 2),
  net_pay NUMERIC(12, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);