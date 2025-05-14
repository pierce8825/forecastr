// Simple script to test the formula validation endpoint
import fetch from 'node-fetch';

async function testFormulaValidation() {
  const testCases = [
    {
      name: "Valid formula",
      formula: "10 + 20 * 2",
      variables: {},
      expectedValid: true
    },
    {
      name: "Invalid syntax",
      formula: "10 + * 20",
      variables: {},
      expectedValid: false
    },
    {
      name: "Division by zero",
      formula: "10 / 0",
      variables: {},
      expectedValid: false
    },
    {
      name: "Valid with variables",
      formula: "stream_1 + driver_2 * 1.5",
      variables: {
        "stream_1": 1000,
        "driver_2": 500
      },
      expectedValid: true
    },
    {
      name: "Missing variable reference",
      formula: "stream_1 + missing_var",
      variables: {
        "stream_1": 1000
      },
      expectedValid: false
    }
  ];

  console.log("Testing formula validation endpoint...\n");

  for (const test of testCases) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`Formula: ${test.formula}`);
      
      const response = await fetch('http://localhost:5000/api/calculate-formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formula: test.formula,
          variables: test.variables
        })
      });
      
      const result = await response.json();
      
      console.log(`Response code: ${response.status}`);
      console.log(`Valid: ${!!result.isValid}`);
      if (!result.isValid && result.error) {
        console.log(`Error: ${result.error.message}`);
      } else if (result.isValid) {
        console.log(`Result: ${result.result}`);
      }
      
      const testPassed = (!!result.isValid === test.expectedValid);
      console.log(`Test ${testPassed ? 'PASSED' : 'FAILED'}`);
      console.log("---------------------------\n");
      
    } catch (error) {
      console.error(`Error testing ${test.name}:`, error);
      console.log("---------------------------\n");
    }
  }
}

testFormulaValidation().catch(err => {
  console.error("Test script error:", err);
});