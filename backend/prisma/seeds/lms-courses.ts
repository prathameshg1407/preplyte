import { DifficultyLevel } from "@prisma/client";
import { devopsCourse, devopsCourseTest } from "./lms-devops-course";

// Type definitions for seed data
interface TopicSeedData {
  id: string;
  title: string;
  description: string;
  order: number;
  theoryContent: string;
  videoUrl?: string;
  videoDuration?: number; // in seconds
  estimatedMinutes: number;
  resources?: {
    title: string;
    url: string;
    type: "pdf" | "link" | "video" | "github";
  }[];
  isActive: boolean;
}

interface TestOptionSeedData {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface TestQuestionSeedData {
  id: string;
  questionText: string;
  explanation?: string;
  order: number;
  points: number;
  isActive: boolean;
  options: TestOptionSeedData[];
}

interface ModuleTestSeedData {
  id: string;
  title: string;
  instructions: string;
  totalQuestions: number;
  passingScore: number; // percentage
  timeLimitMinutes: number;
  maxAttempts: number;
  pointsPerQuestion: number;
  totalPoints: number;
  isActive: boolean;
  questions: TestQuestionSeedData[];
}

interface ModuleSeedData {
  id: string;
  title: string;
  shortDescription: string;
  description?: string;
  order: number;
  points: number;
  estimatedMinutes: number;
  isActive: boolean;
  topics: TopicSeedData[];
  moduleTest?: ModuleTestSeedData;
}

interface FinalTestSeedData {
  id: string;
  title: string;
  instructions: string;
  totalQuestions: number;
  passingScore: number;
  timeLimitMinutes: number;
  maxAttempts: number;
  pointsPerQuestion: number;
  totalPoints: number;
  isActive: boolean;
  questions: TestQuestionSeedData[];
}

interface CourseSeedData {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  price: number;
  discountPrice?: number;
  currency: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isActive: boolean;
  certificateEnabled: boolean;
  passingPercentage: number;
  tags: string[];
  difficulty: DifficultyLevel;
  instructor?: string;
  language: string;
  modules: ModuleSeedData[];
  finalTest?: FinalTestSeedData;
}

// Example: Complete JavaScript Course
export const javascriptCourse: CourseSeedData = {
  id: "course_javascript_fundamentals",
  categoryId: "cat_programming",
  title: "JavaScript Fundamentals",
  slug: "javascript-fundamentals",
  shortDescription:
    "Master JavaScript from basics to advanced concepts with hands-on projects",
  description: `
# JavaScript Fundamentals

This comprehensive course will take you from JavaScript beginner to confident developer.

## What You'll Learn
- Variables, data types, and operators
- Control flow and loops
- Functions and scope
- Arrays and objects
- DOM manipulation
- Asynchronous JavaScript (Promises, async/await)
- ES6+ features

## Prerequisites
- Basic understanding of HTML and CSS
- A computer with a code editor installed
- Enthusiasm to learn!

## Who Is This Course For?
- Beginners wanting to learn programming
- Web developers looking to strengthen their JS skills
- Students preparing for technical interviews
  `,
  thumbnailUrl: "https://cdn.example.com/courses/javascript-fundamentals.jpg",
  previewVideoUrl: "https://cdn.example.com/videos/js-intro-preview.mp4",
  price: 1999,
  discountPrice: 999,
  currency: "INR",
  status: "PUBLISHED",
  isActive: true,
  certificateEnabled: true,
  passingPercentage: 60,
  tags: ["javascript", "programming", "web development", "frontend", "es6"],
  difficulty: "EASY",
  instructor: "John Doe",
  language: "English",

  modules: [
    // MODULE 1: Introduction
    {
      id: "mod_js_intro",
      title: "Introduction to JavaScript",
      shortDescription:
        "Get started with JavaScript and understand its role in web development",
      description:
        "This module introduces you to JavaScript, its history, and how it powers the modern web.",
      order: 1,
      points: 100,
      estimatedMinutes: 45,
      isActive: true,

      topics: [
        {
          id: "topic_js_what_is",
          title: "What is JavaScript?",
          description:
            "Understanding JavaScript and its importance in web development",
          order: 1,
          theoryContent: `
# What is JavaScript?

JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web.

## History
- Created by Brendan Eich in 1995
- Originally named "Mocha", then "LiveScript"
- Renamed to JavaScript for marketing purposes

## Key Characteristics
1. **Interpreted Language**: No compilation needed
2. **Dynamic Typing**: Variables can hold any type
3. **First-class Functions**: Functions are treated as values
4. **Prototype-based**: Object-oriented without classes (ES5)

## Where JavaScript Runs
- **Browser**: Client-side scripting
- **Server**: Node.js runtime
- **Mobile**: React Native, Ionic
- **Desktop**: Electron

\`\`\`javascript
// Your first JavaScript code
console.log("Hello, World!");
\`\`\`

## Why Learn JavaScript?
- Most popular programming language
- Essential for web development
- Huge ecosystem and community
- Versatile (frontend, backend, mobile, desktop)
          `,
          videoUrl: "https://cdn.example.com/videos/js-what-is.mp4",
          videoDuration: 600, // 10 minutes
          estimatedMinutes: 15,
          resources: [
            {
              title: "MDN JavaScript Guide",
              url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
              type: "link",
            },
            {
              title: "JavaScript History PDF",
              url: "https://cdn.example.com/resources/js-history.pdf",
              type: "pdf",
            },
          ],
          isActive: true,
        },
        {
          id: "topic_js_setup",
          title: "Setting Up Your Development Environment",
          description: "Install and configure tools needed for JavaScript development",
          order: 2,
          theoryContent: `
# Setting Up Your Development Environment

## Required Tools

### 1. Code Editor
We recommend **Visual Studio Code** (VS Code):
- Free and open-source
- Excellent JavaScript support
- Rich extension ecosystem

**Download**: [code.visualstudio.com](https://code.visualstudio.com)

### 2. Web Browser
Use a modern browser with good developer tools:
- **Google Chrome** (recommended)
- Firefox Developer Edition
- Microsoft Edge

### 3. Node.js (Optional but Recommended)
For running JavaScript outside the browser:
- Download from [nodejs.org](https://nodejs.org)
- Choose the LTS version

## VS Code Extensions for JavaScript
\`\`\`
1. ESLint - Code linting
2. Prettier - Code formatting
3. JavaScript (ES6) code snippets
4. Live Server - Local development server
\`\`\`

## Your First JavaScript File

1. Create a new folder for your project
2. Open it in VS Code
3. Create \`index.html\`:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>My First JS</title>
</head>
<body>
    <h1>Hello JavaScript!</h1>
    <script src="script.js"></script>
</body>
</html>
\`\`\`

4. Create \`script.js\`:

\`\`\`javascript
console.log("JavaScript is working!");
alert("Welcome to JavaScript!");
\`\`\`
          `,
          videoUrl: "https://cdn.example.com/videos/js-setup.mp4",
          videoDuration: 900, // 15 minutes
          estimatedMinutes: 20,
          resources: [
            {
              title: "VS Code Download",
              url: "https://code.visualstudio.com",
              type: "link",
            },
            {
              title: "Node.js Download",
              url: "https://nodejs.org",
              type: "link",
            },
          ],
          isActive: true,
        },
        {
          id: "topic_js_console",
          title: "Using the Browser Console",
          description: "Learn to use browser developer tools for JavaScript debugging",
          order: 3,
          theoryContent: `
# Using the Browser Console

The browser console is your best friend for learning and debugging JavaScript.

## Opening the Console

### Chrome / Edge
- Press \`F12\` or \`Ctrl+Shift+I\` (Windows/Linux)
- Press \`Cmd+Option+I\` (Mac)
- Right-click → "Inspect" → "Console" tab

### Firefox
- Press \`F12\` or \`Ctrl+Shift+K\`

## Console Methods

\`\`\`javascript
// Basic logging
console.log("Hello World");

// Warning message
console.warn("This is a warning");

// Error message
console.error("This is an error");

// Informational message
console.info("This is info");

// Table format for arrays/objects
console.table([1, 2, 3, 4, 5]);

// Timing operations
console.time("loop");
for(let i = 0; i < 1000; i++) {}
console.timeEnd("loop");

// Grouping logs
console.group("User Details");
console.log("Name: John");
console.log("Age: 25");
console.groupEnd();

// Clear console
console.clear();
\`\`\`

## Try It Yourself
Open your browser console and type:
\`\`\`javascript
let name = "Student";
console.log("Hello, " + name + "!");
\`\`\`
          `,
          videoUrl: "https://cdn.example.com/videos/js-console.mp4",
          videoDuration: 480, // 8 minutes
          estimatedMinutes: 10,
          resources: [
            {
              title: "Chrome DevTools Documentation",
              url: "https://developer.chrome.com/docs/devtools/",
              type: "link",
            },
          ],
          isActive: true,
        },
      ],

      // Module Test
      moduleTest: {
        id: "test_js_intro",
        title: "Introduction to JavaScript - Module Test",
        instructions: `
This test covers the basics of JavaScript introduction.

**Instructions:**
- You have 15 minutes to complete this test
- There are 5 questions worth 20 points each
- You need 60% to pass
- You have 3 attempts
        `,
        totalQuestions: 5,
        passingScore: 60,
        timeLimitMinutes: 15,
        maxAttempts: 3,
        pointsPerQuestion: 20,
        totalPoints: 100,
        isActive: true,

        questions: [
          {
            id: "q_js_intro_1",
            questionText: "Who created JavaScript?",
            explanation:
              "JavaScript was created by Brendan Eich in 1995 while he was working at Netscape.",
            order: 1,
            points: 20,
            isActive: true,
            options: [
              { id: "opt_1_a", text: "Tim Berners-Lee", isCorrect: false, order: 1 },
              { id: "opt_1_b", text: "Brendan Eich", isCorrect: true, order: 2 },
              { id: "opt_1_c", text: "James Gosling", isCorrect: false, order: 3 },
              { id: "opt_1_d", text: "Guido van Rossum", isCorrect: false, order: 4 },
            ],
          },
          {
            id: "q_js_intro_2",
            questionText: "What was JavaScript originally called?",
            explanation:
              "JavaScript was originally named 'Mocha', then renamed to 'LiveScript', and finally to 'JavaScript'.",
            order: 2,
            points: 20,
            isActive: true,
            options: [
              { id: "opt_2_a", text: "ECMAScript", isCorrect: false, order: 1 },
              { id: "opt_2_b", text: "JScript", isCorrect: false, order: 2 },
              { id: "opt_2_c", text: "Mocha", isCorrect: true, order: 3 },
              { id: "opt_2_d", text: "CoffeeScript", isCorrect: false, order: 4 },
            ],
          },
          {
            id: "q_js_intro_3",
            questionText: "Which of the following is NOT a characteristic of JavaScript?",
            explanation:
              "JavaScript is dynamically typed, not statically typed. Variables can change types at runtime.",
            order: 3,
            points: 20,
            isActive: true,
            options: [
              { id: "opt_3_a", text: "Interpreted Language", isCorrect: false, order: 1 },
              { id: "opt_3_b", text: "Static Typing", isCorrect: true, order: 2 },
              { id: "opt_3_c", text: "First-class Functions", isCorrect: false, order: 3 },
              { id: "opt_3_d", text: "Prototype-based", isCorrect: false, order: 4 },
            ],
          },
          {
            id: "q_js_intro_4",
            questionText: "Which console method is used to display a warning message?",
            explanation:
              "console.warn() is used to display warning messages in the browser console.",
            order: 4,
            points: 20,
            isActive: true,
            options: [
              { id: "opt_4_a", text: "console.log()", isCorrect: false, order: 1 },
              { id: "opt_4_b", text: "console.error()", isCorrect: false, order: 2 },
              { id: "opt_4_c", text: "console.warn()", isCorrect: true, order: 3 },
              { id: "opt_4_d", text: "console.alert()", isCorrect: false, order: 4 },
            ],
          },
          {
            id: "q_js_intro_5",
            questionText:
              "Which runtime allows JavaScript to run outside the browser?",
            explanation:
              "Node.js is a JavaScript runtime that allows JavaScript to run on servers and outside the browser.",
            order: 5,
            points: 20,
            isActive: true,
            options: [
              { id: "opt_5_a", text: "React", isCorrect: false, order: 1 },
              { id: "opt_5_b", text: "Angular", isCorrect: false, order: 2 },
              { id: "opt_5_c", text: "Node.js", isCorrect: true, order: 3 },
              { id: "opt_5_d", text: "jQuery", isCorrect: false, order: 4 },
            ],
          },
        ],
      },
    },

    // MODULE 2: Variables and Data Types
    {
      id: "mod_js_variables",
      title: "Variables and Data Types",
      shortDescription: "Learn about variables, data types, and type coercion in JavaScript",
      description:
        "Master the fundamentals of storing and manipulating data in JavaScript.",
      order: 2,
      points: 150,
      estimatedMinutes: 60,
      isActive: true,

      topics: [
        {
          id: "topic_js_variables",
          title: "Declaring Variables",
          description: "Understanding var, let, and const",
          order: 1,
          theoryContent: `
# Declaring Variables in JavaScript

Variables are containers for storing data values. JavaScript has three ways to declare variables.

## var (Legacy)
\`\`\`javascript
var name = "John";
var age = 25;
var isStudent = true;

// var is function-scoped
// Can be redeclared
// Can be updated
// Hoisted (initialized as undefined)
\`\`\`

## let (Modern - ES6)
\`\`\`javascript
let city = "New York";
let temperature = 72;

// let is block-scoped
// Cannot be redeclared in same scope
// Can be updated
// Hoisted but not initialized (TDZ)
\`\`\`

## const (Constants - ES6)
\`\`\`javascript
const PI = 3.14159;
const API_URL = "https://api.example.com";

// const is block-scoped
// Cannot be redeclared
// Cannot be reassigned
// Must be initialized at declaration
\`\`\`

## Best Practices
1. **Use const by default**
2. **Use let when you need to reassign**
3. **Avoid var in modern code**

## Naming Conventions
\`\`\`javascript
// camelCase for variables
let firstName = "John";
let totalAmount = 100;

// UPPER_SNAKE_CASE for constants
const MAX_SIZE = 100;
const API_KEY = "abc123";

// Meaningful names
let userAge = 25;        // Good
let x = 25;              // Bad
\`\`\`
          `,
          videoUrl: "https://cdn.example.com/videos/js-variables.mp4",
          videoDuration: 720,
          estimatedMinutes: 15,
          resources: [
            {
              title: "MDN - let",
              url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let",
              type: "link",
            },
          ],
          isActive: true,
        },
        {
          id: "topic_js_datatypes",
          title: "Data Types",
          description: "Primitive and reference data types in JavaScript",
          order: 2,
          theoryContent: `
# JavaScript Data Types

JavaScript has 8 data types, divided into primitive and reference types.

## Primitive Types (7)

### 1. String
\`\`\`javascript
let name = "John";
let greeting = 'Hello';
let template = \`Hello, \${name}!\`;  // Template literal
\`\`\`

### 2. Number
\`\`\`javascript
let integer = 42;
let float = 3.14;
let negative = -10;
let infinity = Infinity;
let notANumber = NaN;
\`\`\`

### 3. BigInt
\`\`\`javascript
let bigNumber = 9007199254740991n;
let anotherBig = BigInt("123456789012345678901234567890");
\`\`\`

### 4. Boolean
\`\`\`javascript
let isActive = true;
let isComplete = false;
\`\`\`

### 5. Undefined
\`\`\`javascript
let notAssigned;
console.log(notAssigned);  // undefined
\`\`\`

### 6. Null
\`\`\`javascript
let emptyValue = null;
\`\`\`

### 7. Symbol
\`\`\`javascript
let sym1 = Symbol("description");
let sym2 = Symbol("description");
console.log(sym1 === sym2);  // false
\`\`\`

## Reference Type (1)

### Object
\`\`\`javascript
// Object literal
let person = {
    name: "John",
    age: 25
};

// Array (special object)
let numbers = [1, 2, 3, 4, 5];

// Function (special object)
function greet() {
    return "Hello!";
}
\`\`\`

## typeof Operator
\`\`\`javascript
console.log(typeof "Hello");     // "string"
console.log(typeof 42);          // "number"
console.log(typeof true);        // "boolean"
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object" (historical bug)
console.log(typeof {});          // "object"
console.log(typeof []);          // "object"
console.log(typeof function(){}); // "function"
\`\`\`
          `,
          videoUrl: "https://cdn.example.com/videos/js-datatypes.mp4",
          videoDuration: 900,
          estimatedMinutes: 20,
          resources: [],
          isActive: true,
        },
        {
          id: "topic_js_type_coercion",
          title: "Type Coercion",
          description: "Understanding implicit and explicit type conversion",
          order: 3,
          theoryContent: `
# Type Coercion in JavaScript

Type coercion is the automatic or implicit conversion of values from one data type to another.

## Implicit Coercion (Automatic)

### String Coercion
\`\`\`javascript
let result = "5" + 3;      // "53" (number to string)
let result2 = "Hello" + 5; // "Hello5"
\`\`\`

### Number Coercion
\`\`\`javascript
let result = "5" - 3;      // 2 (string to number)
let result2 = "5" * "2";   // 10
let result3 = "10" / 2;    // 5
\`\`\`

### Boolean Coercion
\`\`\`javascript
// Falsy values: false, 0, "", null, undefined, NaN
// Everything else is truthy

if ("hello") {
    console.log("Truthy!");  // This runs
}

if (0) {
    console.log("This won't run");
}
\`\`\`

## Explicit Coercion (Manual)

### To String
\`\`\`javascript
String(123);        // "123"
(123).toString();   // "123"
\`\`\`

### To Number
\`\`\`javascript
Number("123");      // 123
parseInt("123");    // 123
parseFloat("12.5"); // 12.5
+"123";             // 123 (unary plus)
\`\`\`

### To Boolean
\`\`\`javascript
Boolean(1);         // true
Boolean(0);         // false
Boolean("hello");   // true
Boolean("");        // false
!!value;            // Convert to boolean
\`\`\`

## Equality Comparison
\`\`\`javascript
// == (loose equality - with coercion)
"5" == 5;           // true
0 == false;         // true
null == undefined;  // true

// === (strict equality - no coercion)
"5" === 5;          // false
0 === false;        // false
null === undefined; // false
\`\`\`

## Best Practice
**Always use === for comparisons to avoid unexpected coercion!**
          `,
          videoUrl: "https://cdn.example.com/videos/js-coercion.mp4",
          videoDuration: 840,
          estimatedMinutes: 18,
          resources: [],
          isActive: true,
        },
      ],

      moduleTest: {
        id: "test_js_variables",
        title: "Variables and Data Types - Module Test",
        instructions: "Test your understanding of JavaScript variables and data types.",
        totalQuestions: 5,
        passingScore: 60,
        timeLimitMinutes: 15,
        maxAttempts: 3,
        pointsPerQuestion: 30,
        totalPoints: 150,
        isActive: true,

        questions: [
          {
            id: "q_js_var_1",
            questionText: "Which keyword should you use to declare a variable that won't be reassigned?",
            explanation:
              "const is used for variables that won't be reassigned. It provides immutability for primitive values.",
            order: 1,
            points: 30,
            isActive: true,
            options: [
              { id: "opt_var_1_a", text: "var", isCorrect: false, order: 1 },
              { id: "opt_var_1_b", text: "let", isCorrect: false, order: 2 },
              { id: "opt_var_1_c", text: "const", isCorrect: true, order: 3 },
              { id: "opt_var_1_d", text: "static", isCorrect: false, order: 4 },
            ],
          },
          {
            id: "q_js_var_2",
            questionText: "What is the result of typeof null?",
            explanation:
              "typeof null returns 'object' due to a historical bug in JavaScript that has been kept for backward compatibility.",
            order: 2,
            points: 30,
            isActive: true,
            options: [
              { id: "opt_var_2_a", text: '"null"', isCorrect: false, order: 1 },
              { id: "opt_var_2_b", text: '"undefined"', isCorrect: false, order: 2 },
              { id: "opt_var_2_c", text: '"object"', isCorrect: true, order: 3 },
              { id: "opt_var_2_d", text: '"boolean"', isCorrect: false, order: 4 },
            ],
          },
          {
            id: "q_js_var_3",
            questionText: 'What is the result of "5" + 3 in JavaScript?',
            explanation:
              "When using + with a string, JavaScript converts the number to a string and concatenates them.",
            order: 3,
            points: 30,
            isActive: true,
            options: [
              { id: "opt_var_3_a", text: "8", isCorrect: false, order: 1 },
              { id: "opt_var_3_b", text: '"53"', isCorrect: true, order: 2 },
              { id: "opt_var_3_c", text: '"8"', isCorrect: false, order: 3 },
              { id: "opt_var_3_d", text: "NaN", isCorrect: false, order: 4 },
            ],
          },
          {
            id: "q_js_var_4",
            questionText: "Which of the following is a falsy value in JavaScript?",
            explanation:
              "Falsy values in JavaScript are: false, 0, '', null, undefined, and NaN. Empty string '' is falsy.",
            order: 4,
            points: 30,
            isActive: true,
            options: [
              { id: "opt_var_4_a", text: '"false"', isCorrect: false, order: 1 },
              { id: "opt_var_4_b", text: '""', isCorrect: true, order: 2 },
              { id: "opt_var_4_c", text: "[]", isCorrect: false, order: 3 },
              { id: "opt_var_4_d", text: "{}", isCorrect: false, order: 4 },
            ],
          },
          {
            id: "q_js_var_5",
            questionText: 'What is the result of "5" === 5?',
            explanation:
              "Strict equality (===) does not perform type coercion, so a string is never equal to a number.",
            order: 5,
            points: 30,
            isActive: true,
            options: [
              { id: "opt_var_5_a", text: "true", isCorrect: false, order: 1 },
              { id: "opt_var_5_b", text: "false", isCorrect: true, order: 2 },
              { id: "opt_var_5_c", text: "undefined", isCorrect: false, order: 3 },
              { id: "opt_var_5_d", text: "Error", isCorrect: false, order: 4 },
            ],
          },
        ],
      },
    },

    // MODULE 3: Operators (abbreviated for brevity)
    {
      id: "mod_js_operators",
      title: "Operators",
      shortDescription: "Learn arithmetic, comparison, logical, and assignment operators",
      description: "Master all JavaScript operators for effective programming.",
      order: 3,
      points: 100,
      estimatedMinutes: 45,
      isActive: true,
      topics: [
        {
          id: "topic_js_arithmetic",
          title: "Arithmetic Operators",
          description: "Addition, subtraction, multiplication, division, and more",
          order: 1,
          theoryContent: `
# Arithmetic Operators

JavaScript provides standard arithmetic operators for mathematical operations.

## Basic Operators
\`\`\`javascript
let a = 10, b = 3;

console.log(a + b);   // 13 (Addition)
console.log(a - b);   // 7  (Subtraction)
console.log(a * b);   // 30 (Multiplication)
console.log(a / b);   // 3.333... (Division)
console.log(a % b);   // 1  (Modulus/Remainder)
console.log(a ** b);  // 1000 (Exponentiation)
\`\`\`

## Increment and Decrement
\`\`\`javascript
let x = 5;
x++;  // x is now 6 (post-increment)
++x;  // x is now 7 (pre-increment)
x--;  // x is now 6 (post-decrement)
--x;  // x is now 5 (pre-decrement)
\`\`\`
          `,
          videoUrl: "https://cdn.example.com/videos/js-arithmetic.mp4",
          videoDuration: 600,
          estimatedMinutes: 15,
          resources: [],
          isActive: true,
        },
      ],
      moduleTest: {
        id: "test_js_operators",
        title: "Operators - Module Test",
        instructions: "Test your understanding of JavaScript operators.",
        totalQuestions: 5,
        passingScore: 60,
        timeLimitMinutes: 10,
        maxAttempts: 3,
        pointsPerQuestion: 20,
        totalPoints: 100,
        isActive: true,
        questions: [
          {
            id: "q_js_op_1",
            questionText: "What is the result of 10 % 3?",
            explanation: "The modulus operator returns the remainder of division. 10 / 3 = 3 remainder 1.",
            order: 1,
            points: 20,
            isActive: true,
            options: [
              { id: "opt_op_1_a", text: "3", isCorrect: false, order: 1 },
              { id: "opt_op_1_b", text: "1", isCorrect: true, order: 2 },
              { id: "opt_op_1_c", text: "0", isCorrect: false, order: 3 },
              { id: "opt_op_1_d", text: "3.33", isCorrect: false, order: 4 },
            ],
          },
        ],
      },
    },
  ],

  // Final Test for the entire course
  finalTest: {
    id: "final_test_js",
    title: "JavaScript Fundamentals - Final Assessment",
    instructions: `
# Final Assessment

This comprehensive test covers all modules in the JavaScript Fundamentals course.

**Important:**
- Duration: 60 minutes
- Total Questions: 25
- Passing Score: 60%
- Only 1 attempt allowed
- Certificate will be issued upon passing

Good luck!
    `,
    totalQuestions: 25,
    passingScore: 60,
    timeLimitMinutes: 60,
    maxAttempts: 1,
    pointsPerQuestion: 20,
    totalPoints: 500,
    isActive: true,

    questions: [
      {
        id: "final_q_1",
        questionText: "What year was JavaScript created?",
        explanation: "JavaScript was created in 1995 by Brendan Eich at Netscape.",
        order: 1,
        points: 20,
        isActive: true,
        options: [
          { id: "final_opt_1_a", text: "1991", isCorrect: false, order: 1 },
          { id: "final_opt_1_b", text: "1995", isCorrect: true, order: 2 },
          { id: "final_opt_1_c", text: "1999", isCorrect: false, order: 3 },
          { id: "final_opt_1_d", text: "2005", isCorrect: false, order: 4 },
        ],
      },
      {
        id: "final_q_2",
        questionText: "Which statement about const is TRUE?",
        explanation: "const variables cannot be reassigned after initialization.",
        order: 2,
        points: 20,
        isActive: true,
        options: [
          { id: "final_opt_2_a", text: "const variables can be reassigned", isCorrect: false, order: 1 },
          { id: "final_opt_2_b", text: "const variables must be initialized", isCorrect: true, order: 2 },
          { id: "final_opt_2_c", text: "const is function-scoped", isCorrect: false, order: 3 },
          { id: "final_opt_2_d", text: "const was introduced in ES5", isCorrect: false, order: 4 },
        ],
      },
      // ... more questions would follow
    ],
  },
};

// Export all courses
export const lmsCourses: CourseSeedData[] = [
  javascriptCourse,
  devopsCourse as any,
];