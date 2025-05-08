// Auto-approve drizzle schema push
import { exec } from 'child_process';
import { createInterface } from 'readline';

const childProcess = exec('npx drizzle-kit push');

// Pipe stdout and stderr
childProcess.stdout.pipe(process.stdout);
childProcess.stderr.pipe(process.stderr);

// Create readline interface to respond to prompts
const rl = createInterface({
  input: childProcess.stdout,
  output: process.stdout
});

// Listen for prompts and automatically respond
rl.on('line', (line) => {
  if (line.includes('Is') && line.includes('table created or renamed from another table?')) {
    // Send the '+' choice (create table)
    childProcess.stdin.write('\r\n');
  } else if (line.includes('Do you want to apply this migration?')) {
    // Confirm yes
    childProcess.stdin.write('y\r\n');
  }
});

// Handle process completion
childProcess.on('close', (code) => {
  rl.close();
  process.exit(code);
});