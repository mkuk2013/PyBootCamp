/**
 * Full curriculum seed — turns PyBootCamp into a complete
 * Beginner → Advanced Python course (~24 modules, 70+ tasks).
 *
 * Run with:  npm run db:seed-full
 *
 * SAFE TO RE-RUN: it wipes existing levels/modules/tasks (cascades)
 * and reseeds, but preserves users + their submissions are removed
 * because tasks are recreated.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { users, levels, modules, tasks } from "../lib/db/schema";

type TaskSeed = {
  question: string;
  starterCode?: string;
  expectedOutput: string;
  testCases?: string; // optional JSON
  difficulty: "easy" | "medium" | "hard";
};

type ModuleSeed = {
  title: string;
  content: string; // markdown
  tasks: TaskSeed[];
};

type LevelSeed = {
  title: string;
  description: string;
  order: number;
  modules: ModuleSeed[];
};

/* ========================================================================
   BEGINNER
   ======================================================================== */
const BEGINNER: LevelSeed = {
  title: "Beginner",
  description:
    "Start your Python journey — variables, types, control flow, and your first programs.",
  order: 1,
  modules: [
    {
      title: "Hello, Python!",
      content: `# Hello, Python! 🐍

Welcome to your first Python module. Python is one of the most popular
programming languages in the world — it's used for web apps, data science,
AI, automation, and more.

## The \`print()\` function
\`print()\` displays text on the screen.

\`\`\`python
print("Hello, World!")
\`\`\`

## Comments
Anything after \`#\` is a comment — Python ignores it.

\`\`\`python
# This is a comment
print("Code runs")  # this also runs
\`\`\`

## Multiple values
You can pass multiple values separated by commas:

\`\`\`python
print("Python", "is", "fun")
# Output: Python is fun
\`\`\`
`,
      tasks: [
        {
          question: "Print exactly: `Hello, World!`",
          starterCode: "# Write your code below\n",
          expectedOutput: "Hello, World!",
          difficulty: "easy",
        },
        {
          question: "Print your favourite language: `Python`",
          starterCode: "",
          expectedOutput: "Python",
          difficulty: "easy",
        },
        {
          question:
            "Print three lines:\n```\nLine 1\nLine 2\nLine 3\n```",
          starterCode: "",
          expectedOutput: "Line 1\nLine 2\nLine 3",
          difficulty: "easy",
        },
      ],
    },

    {
      title: "Variables & Types",
      content: `# Variables & Data Types

A **variable** stores a value. Python figures out the type automatically.

\`\`\`python
name = "Ali"        # str
age = 21            # int
price = 9.99        # float
is_student = True   # bool
\`\`\`

## Common types
| Type   | Example        |
|--------|----------------|
| \`int\`   | \`42\`           |
| \`float\` | \`3.14\`         |
| \`str\`   | \`"hello"\`      |
| \`bool\`  | \`True / False\` |

## type() function
\`\`\`python
print(type(42))      # <class 'int'>
print(type("hi"))    # <class 'str'>
\`\`\`
`,
      tasks: [
        {
          question:
            "Create variable \`name = \"Alice\"\` and print it.",
          starterCode: "",
          expectedOutput: "Alice",
          difficulty: "easy",
        },
        {
          question:
            "Create \`a = 5\` and \`b = 3\`. Print their sum.",
          starterCode: "",
          expectedOutput: "8",
          difficulty: "easy",
        },
        {
          question:
            "Print the type of `3.14` (should print `<class 'float'>`).",
          expectedOutput: "<class 'float'>",
          difficulty: "easy",
        },
        {
          question:
            "Create a string `s = \"Python\"` and print its length using `len(s)`.",
          expectedOutput: "6",
          difficulty: "easy",
        },
      ],
    },

    {
      title: "Strings",
      content: `# Strings

Strings hold text. They can be single or double quoted.

## Concatenation
\`\`\`python
greeting = "Hello, " + "World"
print(greeting)
\`\`\`

## Repetition
\`\`\`python
print("ha" * 3)   # hahaha
\`\`\`

## Indexing & Slicing
\`\`\`python
word = "Python"
print(word[0])    # P  (first char)
print(word[-1])   # n  (last char)
print(word[0:3])  # Pyt
\`\`\`

## Useful methods
\`\`\`python
"hello".upper()      # 'HELLO'
"HELLO".lower()      # 'hello'
"  hi  ".strip()     # 'hi'
"a,b,c".split(",")   # ['a', 'b', 'c']
\`\`\`
`,
      tasks: [
        {
          question: "Print `\"hello\".upper()`.",
          expectedOutput: "HELLO",
          difficulty: "easy",
        },
        {
          question:
            "Concatenate `\"Py\" + \"thon\"` and print the result.",
          expectedOutput: "Python",
          difficulty: "easy",
        },
        {
          question:
            "From `s = \"Programming\"`, print first 4 characters.",
          starterCode: "s = \"Programming\"\n",
          expectedOutput: "Prog",
          difficulty: "easy",
        },
        {
          question:
            "Reverse the string `\"Python\"` and print it (hint: `s[::-1]`).",
          expectedOutput: "nohtyP",
          difficulty: "medium",
        },
        {
          question:
            "From `\"hello world\"` print every word capitalized: `Hello World` (hint: `.title()`).",
          expectedOutput: "Hello World",
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Numbers & Math",
      content: `# Numbers & Arithmetic

Python supports integers and floats with familiar operators.

| Op  | Meaning              | Example        |
|-----|----------------------|----------------|
| \`+\`  | add                  | \`2 + 3 = 5\`    |
| \`-\`  | subtract             | \`5 - 2 = 3\`    |
| \`*\`  | multiply             | \`4 * 3 = 12\`   |
| \`/\`  | divide (float)       | \`7 / 2 = 3.5\`  |
| \`//\` | integer divide       | \`7 // 2 = 3\`   |
| \`%\`  | modulo (remainder)   | \`7 % 2 = 1\`    |
| \`**\` | power                | \`2 ** 3 = 8\`   |

## Built-in functions
\`\`\`python
abs(-5)        # 5
round(3.7)     # 4
max(1, 5, 3)   # 5
min(1, 5, 3)   # 1
\`\`\`
`,
      tasks: [
        {
          question: "Print `2 ** 10` (2 to the power 10).",
          expectedOutput: "1024",
          difficulty: "easy",
        },
        {
          question: "Print `17 % 5` (remainder).",
          expectedOutput: "2",
          difficulty: "easy",
        },
        {
          question:
            "Compute area of a circle with radius 5 (use π = 3.14). Print result rounded to 2 decimals.",
          starterCode: "pi = 3.14\nradius = 5\n",
          expectedOutput: "78.5",
          difficulty: "medium",
        },
        {
          question:
            "Given `a = 10, b = 3`, print `a // b` then `a % b` on separate lines.",
          starterCode: "a = 10\nb = 3\n",
          expectedOutput: "3\n1",
          difficulty: "easy",
        },
      ],
    },

    {
      title: "Booleans & Comparisons",
      content: `# Booleans

Two values: \`True\` and \`False\`.

## Comparison operators
| Op  | Meaning           |
|-----|-------------------|
| \`==\` | equal             |
| \`!=\` | not equal         |
| \`<\`  | less than         |
| \`>\`  | greater than      |
| \`<=\` | less or equal     |
| \`>=\` | greater or equal  |

## Logical operators
\`\`\`python
True and False   # False
True or False    # True
not True         # False
\`\`\`
`,
      tasks: [
        {
          question: "Print whether `10 > 5` (should print `True`).",
          expectedOutput: "True",
          difficulty: "easy",
        },
        {
          question: "Print `not (5 == 5)`.",
          expectedOutput: "False",
          difficulty: "easy",
        },
        {
          question: "Print `True and False or True`.",
          expectedOutput: "True",
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Input & Output",
      content: `# Input & Output

\`input()\` reads a line of text from the user.

\`\`\`python
name = input("Your name: ")
print("Hello,", name)
\`\`\`

⚠️ \`input()\` always returns a **string**. Convert with \`int()\` or \`float()\` if needed.

\`\`\`python
age = int(input("Age: "))
print(age + 1)
\`\`\`
`,
      tasks: [
        {
          question:
            "Read a name from input and print `Hello, NAME!`.",
          starterCode: "name = input()\n",
          expectedOutput: "Hello, Alice!",
          testCases: JSON.stringify([
            { input: "Alice\n", expected: "Hello, Alice!" },
            { input: "Bob\n", expected: "Hello, Bob!" },
          ]),
          difficulty: "easy",
        },
        {
          question:
            "Read two integers, print their sum.",
          starterCode: "a = int(input())\nb = int(input())\n",
          expectedOutput: "30",
          testCases: JSON.stringify([
            { input: "10\n20\n", expected: "30" },
            { input: "5\n7\n", expected: "12" },
          ]),
          difficulty: "easy",
        },
        {
          question:
            "Read a number `n` and print its square.",
          starterCode: "n = int(input())\n",
          expectedOutput: "25",
          testCases: JSON.stringify([
            { input: "5\n", expected: "25" },
            { input: "9\n", expected: "81" },
          ]),
          difficulty: "easy",
        },
      ],
    },

    {
      title: "If / Else",
      content: `# Conditional Statements

\`\`\`python
age = 18
if age >= 18:
    print("Adult")
elif age >= 13:
    print("Teen")
else:
    print("Child")
\`\`\`

> **Indentation matters!** Python uses 4 spaces (or 1 tab consistently)
> to mark code blocks — no curly braces.
`,
      tasks: [
        {
          question:
            "Read an integer. Print `Positive` if > 0, `Negative` if < 0, else `Zero`.",
          starterCode: "n = int(input())\n",
          expectedOutput: "Positive",
          testCases: JSON.stringify([
            { input: "5\n", expected: "Positive" },
            { input: "-3\n", expected: "Negative" },
            { input: "0\n", expected: "Zero" },
          ]),
          difficulty: "easy",
        },
        {
          question:
            "Read an integer. Print `Even` or `Odd`.",
          starterCode: "n = int(input())\n",
          expectedOutput: "Even",
          testCases: JSON.stringify([
            { input: "4\n", expected: "Even" },
            { input: "7\n", expected: "Odd" },
          ]),
          difficulty: "easy",
        },
        {
          question:
            "Read 3 numbers, print the largest.",
          starterCode:
            "a = int(input())\nb = int(input())\nc = int(input())\n",
          expectedOutput: "9",
          testCases: JSON.stringify([
            { input: "3\n9\n5\n", expected: "9" },
            { input: "10\n2\n7\n", expected: "10" },
          ]),
          difficulty: "medium",
        },
        {
          question:
            "Read a year. Print `Leap` if it's a leap year, else `Not Leap`. (Leap = divisible by 4 AND (not divisible by 100 OR divisible by 400)).",
          starterCode: "y = int(input())\n",
          expectedOutput: "Leap",
          testCases: JSON.stringify([
            { input: "2024\n", expected: "Leap" },
            { input: "2023\n", expected: "Not Leap" },
            { input: "2000\n", expected: "Leap" },
            { input: "1900\n", expected: "Not Leap" },
          ]),
          difficulty: "hard",
        },
      ],
    },

    {
      title: "Loops",
      content: `# Loops

## for loop
\`\`\`python
for i in range(5):       # 0, 1, 2, 3, 4
    print(i)
\`\`\`

\`range(start, stop, step)\` — \`stop\` is exclusive.

\`\`\`python
for i in range(1, 6):    # 1..5
    print(i)
\`\`\`

## while loop
\`\`\`python
n = 5
while n > 0:
    print(n)
    n -= 1
\`\`\`

## break / continue
\`break\` exits the loop, \`continue\` skips to next iteration.
`,
      tasks: [
        {
          question:
            "Print numbers 1 to 5, each on a new line.",
          expectedOutput: "1\n2\n3\n4\n5",
          difficulty: "easy",
        },
        {
          question:
            "Print the sum of integers from 1 to 100 (single number).",
          expectedOutput: "5050",
          difficulty: "easy",
        },
        {
          question:
            "Read N. Print N! (factorial).",
          starterCode: "n = int(input())\n",
          expectedOutput: "120",
          testCases: JSON.stringify([
            { input: "5\n", expected: "120" },
            { input: "1\n", expected: "1" },
            { input: "7\n", expected: "5040" },
          ]),
          difficulty: "medium",
        },
        {
          question:
            "Read N. Print Fibonacci numbers up to (and including) N-th term, space-separated. F(1)=0, F(2)=1.",
          starterCode: "n = int(input())\n",
          expectedOutput: "0 1 1 2 3 5 8",
          testCases: JSON.stringify([
            { input: "7\n", expected: "0 1 1 2 3 5 8" },
            { input: "5\n", expected: "0 1 1 2 3" },
          ]),
          difficulty: "hard",
        },
        {
          question:
            "Print the multiplication table for 7 (1 to 10), format `7 x 1 = 7`.",
          expectedOutput:
            "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70",
          difficulty: "medium",
        },
      ],
    },
  ],
};

/* ========================================================================
   INTERMEDIATE
   ======================================================================== */
const INTERMEDIATE: LevelSeed = {
  title: "Intermediate",
  description:
    "Master Python's collections, functions, and error handling — write reusable, robust code.",
  order: 2,
  modules: [
    {
      title: "Lists",
      content: `# Lists

A **list** holds an ordered collection of items.

\`\`\`python
fruits = ["apple", "banana", "cherry"]
print(fruits[0])         # apple
print(len(fruits))       # 3

fruits.append("date")    # add at end
fruits.remove("banana")  # remove by value
fruits.sort()            # in-place sort
\`\`\`

## List comprehension
\`\`\`python
squares = [x*x for x in range(5)]   # [0, 1, 4, 9, 16]
evens = [x for x in range(10) if x % 2 == 0]
\`\`\`
`,
      tasks: [
        {
          question:
            "Create `nums = [3, 1, 4, 1, 5, 9, 2, 6]`. Print its length.",
          expectedOutput: "8",
          difficulty: "easy",
        },
        {
          question:
            "Print the sum of `[10, 20, 30, 40]`.",
          expectedOutput: "100",
          difficulty: "easy",
        },
        {
          question:
            "Print the maximum of `[3, 7, 2, 9, 5]`.",
          expectedOutput: "9",
          difficulty: "easy",
        },
        {
          question:
            "Use a list comprehension to print squares 1²..5² space-separated: `1 4 9 16 25`.",
          expectedOutput: "1 4 9 16 25",
          difficulty: "medium",
        },
        {
          question:
            "Read a line of space-separated integers. Print them sorted in descending order, space-separated.",
          starterCode: "nums = list(map(int, input().split()))\n",
          expectedOutput: "9 5 3 2 1",
          testCases: JSON.stringify([
            { input: "3 1 9 2 5\n", expected: "9 5 3 2 1" },
            { input: "10 20 5\n", expected: "20 10 5" },
          ]),
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Tuples & Sets",
      content: `# Tuples & Sets

## Tuples — immutable lists
\`\`\`python
point = (3, 4)
print(point[0])       # 3
# point[0] = 5        ❌ tuples can't be changed
\`\`\`

## Sets — unique unordered values
\`\`\`python
colors = {"red", "green", "blue"}
colors.add("red")     # ignored — already present
colors.add("yellow")
print(len(colors))    # 4
\`\`\`

## Set operations
\`\`\`python
a = {1, 2, 3}
b = {2, 3, 4}
print(a | b)   # union   {1,2,3,4}
print(a & b)   # inter   {2,3}
print(a - b)   # diff    {1}
\`\`\`
`,
      tasks: [
        {
          question:
            "Print the number of unique items in list `[1, 2, 2, 3, 3, 3, 4]`.",
          expectedOutput: "4",
          difficulty: "easy",
        },
        {
          question:
            "Given two sets `a = {1, 2, 3}` and `b = {3, 4, 5}`, print their intersection (sorted ascending, space-separated).",
          starterCode: "a = {1, 2, 3}\nb = {3, 4, 5}\n",
          expectedOutput: "3",
          difficulty: "medium",
        },
        {
          question:
            "Read a string. Print the number of distinct characters.",
          starterCode: "s = input()\n",
          expectedOutput: "5",
          testCases: JSON.stringify([
            { input: "hello\n", expected: "4" },
            { input: "abcde\n", expected: "5" },
            { input: "aaaa\n", expected: "1" },
          ]),
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Dictionaries",
      content: `# Dictionaries

Key → value mappings.

\`\`\`python
person = {
    "name": "Ali",
    "age": 25,
    "city": "Lahore"
}

print(person["name"])     # Ali
person["email"] = "a@x"   # add new key
del person["age"]         # delete

# Iterate
for key, value in person.items():
    print(key, value)
\`\`\`

## Useful methods
\`\`\`python
d.get("missing", "default")   # safe lookup
d.keys()                      # all keys
d.values()                    # all values
\`\`\`
`,
      tasks: [
        {
          question:
            "Create dict `d = {\"a\": 1, \"b\": 2, \"c\": 3}` and print sum of values.",
          expectedOutput: "6",
          difficulty: "easy",
        },
        {
          question:
            "Read N then N words. Print each word with its frequency, sorted alphabetically.\nFormat: `word count` per line.",
          starterCode:
            "n = int(input())\nwords = [input().strip() for _ in range(n)]\n",
          expectedOutput: "apple 2\nbanana 1\ncherry 1",
          testCases: JSON.stringify([
            {
              input: "4\napple\nbanana\napple\ncherry\n",
              expected: "apple 2\nbanana 1\ncherry 1",
            },
          ]),
          difficulty: "hard",
        },
        {
          question:
            "Given `prices = {\"apple\": 50, \"bread\": 80, \"milk\": 60}`, print the most expensive item's name.",
          starterCode:
            'prices = {"apple": 50, "bread": 80, "milk": 60}\n',
          expectedOutput: "bread",
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Functions",
      content: `# Functions

Reusable blocks of code.

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("Ali"))
\`\`\`

## Default parameters
\`\`\`python
def power(base, exp=2):
    return base ** exp

print(power(5))      # 25
print(power(2, 10))  # 1024
\`\`\`

## *args, **kwargs
\`\`\`python
def total(*nums):
    return sum(nums)

print(total(1, 2, 3, 4))   # 10
\`\`\`
`,
      tasks: [
        {
          question:
            "Define function `square(n)` that returns n*n. Call it with 7 and print result.",
          expectedOutput: "49",
          difficulty: "easy",
        },
        {
          question:
            "Write function `is_prime(n)` returning True/False. Read n from input, print result.",
          starterCode: "n = int(input())\n",
          expectedOutput: "True",
          testCases: JSON.stringify([
            { input: "7\n", expected: "True" },
            { input: "10\n", expected: "False" },
            { input: "2\n", expected: "True" },
            { input: "1\n", expected: "False" },
          ]),
          difficulty: "medium",
        },
        {
          question:
            "Write `reverse_string(s)` that returns reversed s. Read string from input, print reversed.",
          starterCode: "s = input()\n",
          expectedOutput: "olleh",
          testCases: JSON.stringify([
            { input: "hello\n", expected: "olleh" },
            { input: "Python\n", expected: "nohtyP" },
          ]),
          difficulty: "easy",
        },
        {
          question:
            "Write recursive function `factorial(n)`. Read n, print factorial.",
          starterCode: "n = int(input())\n",
          expectedOutput: "120",
          testCases: JSON.stringify([
            { input: "5\n", expected: "120" },
            { input: "0\n", expected: "1" },
            { input: "6\n", expected: "720" },
          ]),
          difficulty: "medium",
        },
      ],
    },

    {
      title: "String Formatting",
      content: `# String Formatting

## f-strings (recommended, Python 3.6+)
\`\`\`python
name = "Ali"; age = 21
print(f"{name} is {age} years old")
\`\`\`

## Format specifiers
\`\`\`python
pi = 3.14159
print(f"{pi:.2f}")        # 3.14
print(f"{42:05d}")        # 00042
print(f"{0.85:.0%}")      # 85%
\`\`\`

## .format() method (older)
\`\`\`python
"{0} + {1} = {2}".format(1, 2, 3)
\`\`\`
`,
      tasks: [
        {
          question:
            "Read name and age. Print: `NAME is AGE years old.`",
          starterCode: "name = input()\nage = int(input())\n",
          expectedOutput: "Ali is 21 years old.",
          testCases: JSON.stringify([
            { input: "Ali\n21\n", expected: "Ali is 21 years old." },
            { input: "Sara\n30\n", expected: "Sara is 30 years old." },
          ]),
          difficulty: "easy",
        },
        {
          question:
            "Print π = 3.14159265 rounded to 4 decimals using f-string. Output: `3.1416`",
          starterCode: "pi = 3.14159265\n",
          expectedOutput: "3.1416",
          difficulty: "easy",
        },
        {
          question:
            "Read a number. Print it left-padded with zeros to width 6 (e.g., `42` → `000042`).",
          starterCode: "n = int(input())\n",
          expectedOutput: "000042",
          testCases: JSON.stringify([
            { input: "42\n", expected: "000042" },
            { input: "7\n", expected: "000007" },
          ]),
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Error Handling",
      content: `# try / except

Catch errors instead of crashing.

\`\`\`python
try:
    x = int(input())
    print(10 / x)
except ZeroDivisionError:
    print("Cannot divide by zero")
except ValueError:
    print("Not a valid number")
\`\`\`

## finally
Always runs.

\`\`\`python
try:
    f = open("file.txt")
finally:
    f.close()
\`\`\`

## raise
Raise your own error:
\`\`\`python
if age < 0:
    raise ValueError("Age must be positive")
\`\`\`
`,
      tasks: [
        {
          question:
            "Read an integer x. Print `100 / x`. If x is 0, print `Error: division by zero`.",
          starterCode: "x = int(input())\n",
          expectedOutput: "20.0",
          testCases: JSON.stringify([
            { input: "5\n", expected: "20.0" },
            { input: "0\n", expected: "Error: division by zero" },
            { input: "4\n", expected: "25.0" },
          ]),
          difficulty: "medium",
        },
        {
          question:
            "Read a string. Try converting to int and print it. On ValueError print `Invalid input`.",
          starterCode: "s = input()\n",
          expectedOutput: "42",
          testCases: JSON.stringify([
            { input: "42\n", expected: "42" },
            { input: "abc\n", expected: "Invalid input" },
          ]),
          difficulty: "medium",
        },
      ],
    },

    {
      title: "File I/O",
      content: `# Reading & Writing Files

> ℹ️ In this online sandbox you can simulate file I/O with strings,
> but the syntax is exactly the same as on your machine.

## Write a file
\`\`\`python
with open("data.txt", "w") as f:
    f.write("Hello\\nWorld")
\`\`\`

## Read a file
\`\`\`python
with open("data.txt") as f:
    content = f.read()
    print(content)
\`\`\`

## Read line by line
\`\`\`python
with open("data.txt") as f:
    for line in f:
        print(line.strip())
\`\`\`

The \`with\` statement auto-closes the file when done.
`,
      tasks: [
        {
          question:
            "Read N lines from input. Print them with line numbers, format: `1: text`.",
          starterCode:
            "n = int(input())\nfor i in range(1, n + 1):\n    line = input()\n    # print here\n",
          expectedOutput: "1: hello\n2: world",
          testCases: JSON.stringify([
            { input: "2\nhello\nworld\n", expected: "1: hello\n2: world" },
            {
              input: "3\nfoo\nbar\nbaz\n",
              expected: "1: foo\n2: bar\n3: baz",
            },
          ]),
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Modules & Imports",
      content: `# Modules

Reuse code from Python's standard library.

\`\`\`python
import math
print(math.sqrt(16))     # 4.0
print(math.pi)           # 3.14159...

from random import randint
print(randint(1, 10))    # random 1..10

import datetime
now = datetime.datetime.now()
\`\`\`

## Aliases
\`\`\`python
import numpy as np         # convention
\`\`\`
`,
      tasks: [
        {
          question:
            "Use `math.sqrt` to print the square root of 144.",
          starterCode: "import math\n",
          expectedOutput: "12.0",
          difficulty: "easy",
        },
        {
          question:
            "Read a number n. Use `math.factorial` to print n!.",
          starterCode: "import math\nn = int(input())\n",
          expectedOutput: "120",
          testCases: JSON.stringify([
            { input: "5\n", expected: "120" },
            { input: "0\n", expected: "1" },
            { input: "8\n", expected: "40320" },
          ]),
          difficulty: "easy",
        },
        {
          question:
            "Use `math.gcd` to print GCD of two numbers from input.",
          starterCode:
            "import math\na = int(input())\nb = int(input())\n",
          expectedOutput: "6",
          testCases: JSON.stringify([
            { input: "12\n18\n", expected: "6" },
            { input: "100\n75\n", expected: "25" },
          ]),
          difficulty: "medium",
        },
      ],
    },
  ],
};

/* ========================================================================
   ADVANCED
   ======================================================================== */
const ADVANCED: LevelSeed = {
  title: "Advanced",
  description:
    "Object-oriented programming, decorators, generators, and Python expert techniques.",
  order: 3,
  modules: [
    {
      title: "Classes & Objects",
      content: `# Object-Oriented Programming

A **class** is a blueprint; an **object** is an instance.

\`\`\`python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        return f"{self.name} says Woof!"

d = Dog("Rex", 3)
print(d.bark())
print(d.age)
\`\`\`

## \`__init__\`
Special method called when creating an object.

## \`self\`
Refers to the current instance — like \`this\` in other languages.
`,
      tasks: [
        {
          question:
            "Define class `Rectangle(width, height)` with method `area()`. Create rectangle 5x3 and print its area.",
          expectedOutput: "15",
          difficulty: "medium",
        },
        {
          question:
            "Define class `Counter` with method `increment()` and attribute `count` (starts at 0). Increment 5 times and print count.",
          expectedOutput: "5",
          difficulty: "medium",
        },
        {
          question:
            "Define class `Person(name, age)` with `__str__` returning `Name (age)`. Print a Person object.",
          expectedOutput: "Ali (21)",
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Inheritance & Polymorphism",
      content: `# Inheritance

A child class inherits from a parent class.

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "Some sound"

class Dog(Animal):
    def speak(self):
        return f"{self.name}: Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name}: Meow!"

for a in [Dog("Rex"), Cat("Whiskers")]:
    print(a.speak())
\`\`\`

## super()
Call parent method:

\`\`\`python
class Puppy(Dog):
    def __init__(self, name, owner):
        super().__init__(name)
        self.owner = owner
\`\`\`
`,
      tasks: [
        {
          question:
            "Create class `Shape` with method `area()` returning 0. Create `Square(side)` extending Shape, override area. Print area of Square(4).",
          expectedOutput: "16",
          difficulty: "medium",
        },
        {
          question:
            "Class `Vehicle` has method `info()` returning `Vehicle`. Class `Car(Vehicle)` overrides it to return `Car`. Class `SportsCar(Car)` overrides to return `SportsCar`. Print info() of a SportsCar.",
          expectedOutput: "SportsCar",
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Decorators",
      content: `# Decorators

Functions that modify other functions.

\`\`\`python
def loud(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result.upper()
    return wrapper

@loud
def greet(name):
    return f"hello {name}"

print(greet("ali"))   # HELLO ALI
\`\`\`

## Common built-in decorators
- \`@staticmethod\`
- \`@classmethod\`
- \`@property\`
`,
      tasks: [
        {
          question:
            "Write decorator `double` that doubles the return value of any function. Apply to `def add(a, b): return a + b`. Print `add(3, 4)`.",
          expectedOutput: "14",
          difficulty: "hard",
        },
        {
          question:
            "Write decorator `shout` that uppercases the string returned by a function. Use on `def hi(): return \"hello\"`. Print result.",
          expectedOutput: "HELLO",
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Generators & Iterators",
      content: `# Generators

Functions that \`yield\` values lazily.

\`\`\`python
def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1

for x in count_up_to(3):
    print(x)
# 1 2 3
\`\`\`

Generators are memory-efficient for large sequences.

## Generator expression
\`\`\`python
squares = (x*x for x in range(1_000_000))
\`\`\`
`,
      tasks: [
        {
          question:
            "Write a generator `evens(n)` yielding the first n even numbers (starting from 2). Print first 5 space-separated: `2 4 6 8 10`.",
          expectedOutput: "2 4 6 8 10",
          difficulty: "medium",
        },
        {
          question:
            "Write a generator that yields Fibonacci numbers. Print the first 8 space-separated: `0 1 1 2 3 5 8 13`.",
          expectedOutput: "0 1 1 2 3 5 8 13",
          difficulty: "hard",
        },
      ],
    },

    {
      title: "Lambda & Higher-Order Functions",
      content: `# Lambda & HOF

## Lambda — anonymous one-line functions
\`\`\`python
square = lambda x: x*x
print(square(5))    # 25
\`\`\`

## map / filter / reduce
\`\`\`python
nums = [1, 2, 3, 4, 5]

squared = list(map(lambda x: x*x, nums))
evens = list(filter(lambda x: x%2 == 0, nums))

from functools import reduce
total = reduce(lambda a, b: a+b, nums)
\`\`\`

## sorted with key
\`\`\`python
words = ["banana", "apple", "cherry"]
sorted(words, key=len)   # ['apple','banana','cherry']
\`\`\`
`,
      tasks: [
        {
          question:
            "Use `map` and a lambda to print the cubes of 1..5 space-separated: `1 8 27 64 125`.",
          expectedOutput: "1 8 27 64 125",
          difficulty: "medium",
        },
        {
          question:
            "Use `filter` to keep only even numbers from `[1,2,3,4,5,6,7,8,9,10]`. Print them space-separated.",
          expectedOutput: "2 4 6 8 10",
          difficulty: "medium",
        },
        {
          question:
            "Use `sorted` with `key=len` to sort `[\"banana\", \"apple\", \"kiwi\"]` by length and print space-separated.",
          expectedOutput: "kiwi apple banana",
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Regular Expressions",
      content: `# Regular Expressions (\`re\` module)

\`\`\`python
import re

text = "My phone is 555-1234"
m = re.search(r"\\d{3}-\\d{4}", text)
if m:
    print(m.group())     # 555-1234

# Find all
re.findall(r"\\w+", "Hello, World!")   # ['Hello', 'World']

# Replace
re.sub(r"\\s+", "-", "hello world py")   # 'hello-world-py'
\`\`\`

## Common patterns
| Pattern | Matches              |
|---------|----------------------|
| \`\\d\`  | digit                |
| \`\\w\`  | word char            |
| \`\\s\`  | whitespace           |
| \`+\`    | one or more          |
| \`*\`    | zero or more         |
| \`?\`    | optional             |
| \`^\`    | start                |
| \`$\`    | end                  |
`,
      tasks: [
        {
          question:
            "Read a line. Use regex to print all numbers found in it, space-separated. If none, print `none`.",
          starterCode: "import re\ns = input()\n",
          expectedOutput: "42 7",
          testCases: JSON.stringify([
            {
              input: "I have 42 apples and 7 oranges\n",
              expected: "42 7",
            },
            { input: "no digits here\n", expected: "none" },
          ]),
          difficulty: "medium",
        },
        {
          question:
            "Read an email. Print `valid` if it matches `something@something.something`, else `invalid`.",
          starterCode: "import re\nemail = input().strip()\n",
          expectedOutput: "valid",
          testCases: JSON.stringify([
            { input: "ali@test.com\n", expected: "valid" },
            { input: "bad-email\n", expected: "invalid" },
            { input: "x@y.z\n", expected: "valid" },
          ]),
          difficulty: "hard",
        },
      ],
    },

    {
      title: "Working with JSON",
      content: `# JSON

JavaScript Object Notation — universal data format.

\`\`\`python
import json

# Python → JSON string
data = {"name": "Ali", "scores": [10, 20, 30]}
text = json.dumps(data)
print(text)

# JSON string → Python
back = json.loads(text)
print(back["name"])

# Pretty print
print(json.dumps(data, indent=2))
\`\`\`
`,
      tasks: [
        {
          question:
            "Given dict `{\"a\": 1, \"b\": 2}`, print it as JSON string (with double quotes).",
          expectedOutput: '{"a": 1, "b": 2}',
          difficulty: "easy",
        },
        {
          question:
            "Read a JSON object from input. Print the value of key `name`.",
          starterCode: "import json\ns = input()\nd = json.loads(s)\n",
          expectedOutput: "Ali",
          testCases: JSON.stringify([
            { input: '{"name": "Ali", "age": 21}\n', expected: "Ali" },
            { input: '{"name": "Sara"}\n', expected: "Sara" },
          ]),
          difficulty: "medium",
        },
      ],
    },

    {
      title: "Algorithms & Problem Solving",
      content: `# Common Algorithms

Now you're ready for classic interview-style problems.

## Tips
- Read carefully — what are inputs/outputs?
- Think of edge cases (empty, 1 element, all same)
- Optimize **after** correctness

## Built-ins to remember
\`sum\`, \`max\`, \`min\`, \`sorted\`, \`reversed\`, \`enumerate\`, \`zip\`,
\`any\`, \`all\`, list/dict/set comprehensions.
`,
      tasks: [
        {
          question:
            "Read N then N integers (one per line). Print the second largest.",
          starterCode:
            "n = int(input())\nnums = [int(input()) for _ in range(n)]\n",
          expectedOutput: "8",
          testCases: JSON.stringify([
            { input: "5\n3\n1\n8\n9\n2\n", expected: "8" },
            { input: "4\n10\n10\n5\n3\n", expected: "5" },
          ]),
          difficulty: "medium",
        },
        {
          question:
            "Read a string. Print `Yes` if it's a palindrome (case-insensitive, ignore spaces), else `No`.",
          starterCode: "s = input()\n",
          expectedOutput: "Yes",
          testCases: JSON.stringify([
            { input: "racecar\n", expected: "Yes" },
            { input: "Hello\n", expected: "No" },
            { input: "A man a plan a canal Panama\n", expected: "Yes" },
          ]),
          difficulty: "hard",
        },
        {
          question:
            "Read N then a line of N integers. Print the longest streak of consecutive equal numbers.",
          starterCode:
            "n = int(input())\nnums = list(map(int, input().split()))\n",
          expectedOutput: "3",
          testCases: JSON.stringify([
            { input: "8\n1 1 2 2 2 3 3 1\n", expected: "3" },
            { input: "5\n5 5 5 5 5\n", expected: "5" },
            { input: "4\n1 2 3 4\n", expected: "1" },
          ]),
          difficulty: "hard",
        },
        {
          question:
            "FizzBuzz: print numbers 1..15. For multiples of 3 print `Fizz`, of 5 print `Buzz`, of both print `FizzBuzz`.",
          expectedOutput:
            "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
          difficulty: "medium",
        },
        {
          question:
            "Read a sentence. Print word counts (sorted by count desc, then alphabetical) — one per line: `word count`.",
          starterCode: "s = input()\n",
          expectedOutput: "the 2\nbrown 1\nfox 1\nlazy 1",
          testCases: JSON.stringify([
            {
              input: "the brown fox the lazy\n",
              expected: "the 2\nbrown 1\nfox 1\nlazy 1",
            },
          ]),
          difficulty: "hard",
        },
      ],
    },
  ],
};

const CURRICULUM: LevelSeed[] = [BEGINNER, INTERMEDIATE, ADVANCED];

/* ========================================================================
   SEED RUNNER
   ======================================================================== */
async function main() {
  console.log("🌱  Seeding FULL Python curriculum...\n");

  /* 1) Admin user (create if missing) */
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@pybootcamp.com";
  const adminPass = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminName = process.env.ADMIN_NAME ?? "Super Admin";

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .get();

  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPass, 10);
    await db.insert(users).values({
      name: adminName,
      email: adminEmail,
      password: hash,
      role: "admin",
      approved: true,
    });
    console.log(`✅  Admin created → ${adminEmail}`);
  } else {
    console.log(`ℹ️   Admin already exists → ${adminEmail}`);
  }

  /* 2) Wipe existing curriculum (cascades through modules/tasks/submissions) */
  await db.delete(levels);
  console.log("🧹  Cleared existing levels (cascaded modules/tasks/submissions)\n");

  /* 3) Insert curriculum */
  let totalModules = 0;
  let totalTasks = 0;

  for (const lv of CURRICULUM) {
    const [insertedLevel] = await db
      .insert(levels)
      .values({
        title: lv.title,
        description: lv.description,
        order: lv.order,
      })
      .returning();

    console.log(`📘  Level: ${lv.title}`);

    for (let mIdx = 0; mIdx < lv.modules.length; mIdx++) {
      const m = lv.modules[mIdx];
      const [insertedModule] = await db
        .insert(modules)
        .values({
          levelId: insertedLevel.id,
          title: m.title,
          content: m.content,
          order: mIdx + 1,
        })
        .returning();

      totalModules++;
      console.log(`   📖  ${m.title} (${m.tasks.length} tasks)`);

      for (let tIdx = 0; tIdx < m.tasks.length; tIdx++) {
        const t = m.tasks[tIdx];
        await db.insert(tasks).values({
          moduleId: insertedModule.id,
          question: t.question,
          starterCode: t.starterCode ?? "",
          expectedOutput: t.expectedOutput,
          testCases: t.testCases ?? null,
          difficulty: t.difficulty,
          order: tIdx + 1,
        });
        totalTasks++;
      }
    }
  }

  console.log(
    `\n🎉  Seeded ${CURRICULUM.length} levels · ${totalModules} modules · ${totalTasks} tasks.`
  );
  console.log(`   Login as ${adminEmail} (password from .env.local).\n`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
