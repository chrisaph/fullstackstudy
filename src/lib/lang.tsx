import { createContext, useContext } from 'react'

export type Lang = 'python' | 'csharp'
export const LangContext = createContext<{ lang: Lang; t: (s: string) => string }>({ lang: 'python', t: (s) => s })
export const useLang = () => useContext(LangContext)

// Ordered: specific phrases first.
const CS: [RegExp, string][] = [
  [/a Django REST API/g, 'an ASP.NET Core Web API'],
  [/Django REST Framework/g, 'ASP.NET Core Web API'],
  [/Django\/DRF/g, 'ASP.NET Core Web API'],
  [/Django & DRF/g, 'ASP.NET Core & Web API'],
  [/\bDRF\b/g, 'Web API'],
  [/Django/g, 'ASP.NET Core'],
  [/gunicorn\/uvicorn/g, 'Kestrel'],
  [/WSGI\/ASGI/g, 'the ASP.NET Core pipeline'],
  [/select_related \/ prefetch_related/g, 'Include / ThenInclude'],
  [/select_related|prefetch_related/g, 'Include'],
  [/QuerySet/g, 'IQueryable'],
  [/serializers/g, 'DTOs'],
  [/viewsets/g, 'controllers'],
  [/[Ss]erializer/g, 'DTO'],
  [/comprehensions/g, 'LINQ'],
  [/venvs/g, 'NuGet packages'],
  [/```python/g, '```csharp'],
  [/Python only/g, 'C# only'],
  [/Python \+ /g, 'C# + '],
  [/Python/g, 'C#'],
  [/python/g, 'csharp'],
  [/manage\.py/g, 'Program.cs'],
  [/urls\.py/g, 'route mappings'],
  [/wsgi\.py/g, 'Startup'],
  [/package\.json scripts/g, 'package.json scripts'],
]
export const toCsharp = (s: string) => CS.reduce((a, [r, v]) => a.replace(r, v), s)

export type Group = { title: string; topics: string[] }
const g = (title: string, topics: string): Group => ({ title, topics: topics.split('|') })

export const PY_GROUPS: Group[] = [
  g('Python Tutorial', 'Python HOME|Python Intro|Python Get Started|Python Syntax|Python Output|Python Comments|Python Variables|Python Data Types|Python Numbers|Python Casting|Python Strings|Python Booleans|Python Operators|Python Lists|Python Tuples|Python Sets|Python Dictionaries|Python If...Else|Python Match|Python While Loops|Python For Loops|Python Functions|Python Range|Python Arrays|Python Iterators|Python Modules|Python Dates|Python Math|Python JSON|Python RegEx|Python PIP|Python Try...Except|Python String Formatting|Python None|Python User Input|Python VirtualEnv'),
  g('Python Classes', 'Python OOP|Python Classes/Objects|Python __init__ Method|Python self Parameter|Python Class Properties|Python Class Methods|Python Magic Methods|Python Inheritance|Python Polymorphism|Python Encapsulation|Python Inner Classes'),
  g('File Handling', 'Python File Handling|Python Read Files|Python Write/Create Files|Python Delete Files'),
  g('Python Modules', 'NumPy Tutorial|Pandas Tutorial|SciPy Tutorial|Django Tutorial|Playwright Tutorial'),
  g('Python Turtle', 'Turtle Intro|Turtle Move and Turn|Turtle Pen|Turtle Position|Turtle Colors|Turtle Shapes|Turtle Fill|Turtle Text|Turtle Events|Turtle Animation|Turtle Projects'),
  g('Python Tkinter', 'Tkinter Intro|Tkinter Label|Tkinter Button|Tkinter Entry|Tkinter Layout|Tkinter Events|Tkinter Check and Radio|Tkinter Messagebox|Tkinter Listbox|Tkinter Text|Tkinter Canvas|Tkinter ttk|Tkinter Menu|Tkinter Timers|Tkinter Project|Tkinter To-Do List'),
  g('Python Matplotlib', 'Matplotlib Intro|Matplotlib Get Started|Matplotlib Pyplot|Matplotlib Plotting|Matplotlib Markers|Matplotlib Line|Matplotlib Labels|Matplotlib Grid|Matplotlib Subplot|Matplotlib Scatter|Matplotlib Bars|Matplotlib Histograms|Matplotlib Pie Charts'),
  g('Machine Learning', 'Getting Started|Mean Median Mode|Standard Deviation|Percentile|Data Distribution|Normal Data Distribution|Scatter Plot|Linear Regression|Polynomial Regression|Multiple Regression|Scale|Train/Test|Decision Tree|Confusion Matrix|Hierarchical Clustering|Logistic Regression|Grid Search|Categorical Data|K-means|Bootstrap Aggregation|Cross Validation|AUC - ROC Curve|K-nearest neighbors'),
  g('Python DSA', 'Python DSA|Lists and Arrays|Stacks|Queues|Linked Lists|Hash Tables|Trees|Binary Trees|Binary Search Trees|AVL Trees|Graphs|Linear Search|Binary Search|Bubble Sort|Selection Sort|Insertion Sort|Quick Sort|Counting Sort|Radix Sort|Merge Sort'),
  g('Python MySQL', 'MySQL Get Started|MySQL Create Database|MySQL Create Table|MySQL Insert|MySQL Select|MySQL Where|MySQL Order By|MySQL Delete|MySQL Drop Table|MySQL Update|MySQL Limit|MySQL Join'),
  g('Python MongoDB', 'MongoDB Get Started|MongoDB Create DB|MongoDB Collection|MongoDB Insert|MongoDB Find|MongoDB Query|MongoDB Sort|MongoDB Delete|MongoDB Drop Collection|MongoDB Update|MongoDB Limit'),
  g('Python Cert', 'Python Certificate'),
  g('Python How To', 'Remove List Duplicates|Reverse a String|Add Two Numbers'),
  g('Python Examples', 'Python Examples|Python Videos|Python Compiler|Python Exercises|Python Quiz|Python Challenges|Python Practice Problems|Python Server|Python Syllabus|Python Study Plan|Python Interview Q&A|Python Training'),
  g('Python Reference', 'Python Overview|Python Built-in Functions|Python String Methods|Python List Methods|Python Dictionary Methods|Python Tuple Methods|Python Set Methods|Python File Methods|Python Keywords|Python Exceptions|Python Glossary'),
  g('Module Reference', 'Built-in Modules|Random Module|Requests Module|Statistics Module|Math Module|cMath Module'),
]
export const CS_GROUPS: Group[] = [
  g('C# Tutorial', 'C# HOME|C# Intro|C# Get Started|C# Syntax|C# Output|C# Comments|C# Variables|C# Data Types|C# Type Casting|C# User Input|C# Operators|C# Math|C# Strings|C# Booleans|C# If...Else|C# Switch|C# While Loop|C# For Loop|C# Break/Continue|C# Arrays'),
  g('C# Methods', 'C# Methods|C# Method Parameters|C# Method Overloading'),
  g('C# Classes', 'C# OOP|C# Classes/Objects|C# Class Members|C# Constructors|C# Access Modifiers|C# Properties|C# Inheritance|C# Polymorphism|C# Abstraction|C# Interface|C# Enums|C# Files|C# Exceptions'),
  g('C# Cert', 'C# Certificate'),
  g('C# How To', 'Add Two Numbers'),
  g('C# Examples', 'C# Examples|C# Compiler|C# Exercises|C# Quiz|C# Practice Problems|C# Server|C# Syllabus|C# Study Plan'),
]

export type Lesson = { text: string; code: string }
export const PY_NOTES: Record<string, Lesson> = {
  'Python Syntax': { text: 'Python uses indentation (4 spaces) to define blocks. There are no braces or semicolons. Wrong indentation is a syntax error.', code: 'if 5 > 2:\n    print("Five is greater")  # indented block' },
  'Python Output': { text: 'print() writes to the console. Separate values with commas; control the ending with end=.', code: 'print("Hello", "World")\nprint("a", end=" ")\nprint("b")' },
  'Python Comments': { text: 'Start a comment with #. Triple-quoted strings are often used for docstrings.', code: '# a comment\ndef f():\n    """Docstring explaining f."""' },
  'Python Variables': { text: 'Variables are created on assignment; no declaration or type needed. Names are case-sensitive, snake_case by convention.', code: 'x = 5\nname = "Ana"\nx, y = 1, 2' },
  'Python Data Types': { text: 'Built-ins: str, int, float, bool, list, tuple, set, dict, NoneType. type() reveals the type.', code: 'print(type(5), type("a"), type([1]), type({"k": 1}))' },
  'Python Casting': { text: 'Convert with int(), float(), str(). Invalid conversions raise ValueError.', code: 'int("42")      # 42\nfloat(3)       # 3.0\nstr(7)         # "7"' },
  'Python Strings': { text: 'Strings are immutable sequences. Slice with [start:stop], use methods like upper(), split(), strip().', code: 's = "Hello, World"\nprint(s[0:5], s.upper(), s.split(", "))' },
  'Python Lists': { text: 'Ordered, mutable, allow duplicates. Core methods: append, pop, sort, remove, plus comprehensions.', code: 'nums = [3, 1, 2]\nnums.append(4)\nsquares = [n * n for n in nums if n > 1]' },
  'Python Tuples': { text: 'Ordered and immutable. Good for fixed groups of values and as dict keys.', code: 'point = (3, 4)\nx, y = point' },
  'Python Sets': { text: 'Unordered, unique items. Fast membership tests and set math.', code: 'a = {1, 2, 3}\nb = {3, 4}\nprint(a & b, a | b, 2 in a)' },
  'Python Dictionaries': { text: 'Key to value mapping, insertion-ordered. Use get() to avoid KeyError.', code: 'user = {"name": "Ana", "age": 30}\nuser["city"] = "Manila"\nprint(user.get("zip", "n/a"))' },
  'Python If...Else': { text: 'if / elif / else with boolean conditions. Combine with and, or, not.', code: 'n = 7\nif n < 0:\n    print("neg")\nelif n == 0:\n    print("zero")\nelse:\n    print("pos")' },
  'Python Match': { text: 'Structural pattern matching (3.10+), like a switch with patterns.', code: 'match status:\n    case 200: print("OK")\n    case 404: print("Not found")\n    case _: print("Other")' },
  'Python While Loops': { text: 'Repeats while a condition is true. break exits, continue skips to the next iteration.', code: 'i = 0\nwhile i < 3:\n    print(i)\n    i += 1' },
  'Python For Loops': { text: 'Iterates over any iterable. Use enumerate() for index+value and range() for counts.', code: 'for i, ch in enumerate("abc"):\n    print(i, ch)' },
  'Python Functions': { text: 'Defined with def. Support default args, *args, **kwargs and return values.', code: 'def greet(name, greeting="Hi"):\n    return f"{greeting}, {name}"\nprint(greet("Ana"))' },
  'Python Try...Except': { text: 'Handle errors with try/except/else/finally. Catch specific exceptions.', code: 'try:\n    int("x")\nexcept ValueError as e:\n    print("bad", e)\nfinally:\n    print("done")' },
  'Python User Input': { text: 'input() returns a string; cast it to the type you need.', code: 'age = int(input("Age: "))' },
  'Python Modules': { text: 'A module is a .py file you import. Use the standard library freely.', code: 'import math\nfrom random import randint\nprint(math.sqrt(16), randint(1, 6))' },
  'Python PIP': { text: 'pip installs packages from PyPI. Pin versions in requirements.txt.', code: 'pip install requests\npip freeze > requirements.txt' },
  'Python VirtualEnv': { text: 'Isolate dependencies per project so versions never clash.', code: 'python -m venv .venv\nsource .venv/bin/activate\npip install django' },
  'Python JSON': { text: 'The json module converts between dicts and JSON text.', code: 'import json\ns = json.dumps({"a": 1})\nd = json.loads(s)' },
  'Python OOP': { text: 'Classes bundle data and behaviour. Objects are instances of classes.', code: 'class Dog:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f"{self.name} says woof"' },
  'Python Inheritance': { text: 'A child class reuses and overrides a parent class. super() calls the parent.', code: 'class Puppy(Dog):\n    def speak(self):\n        return super().speak() + "!"' },
  'Python File Handling': { text: 'Use open() in a with block so files always close. Modes: r, w, a.', code: 'with open("notes.txt", "w") as f:\n    f.write("hello")\nwith open("notes.txt") as f:\n    print(f.read())' },
}
export const CS_NOTES: Record<string, Lesson> = {
  'C# Syntax': { text: 'Statements end with ;. Blocks use { }. Code lives in classes; modern top-level statements allow a single-file Program.cs.', code: 'using System;\nConsole.WriteLine("Hello World");' },
  'C# Output': { text: 'Console.WriteLine adds a newline; Console.Write does not. Use string interpolation with $"".', code: 'int n = 5;\nConsole.WriteLine($"n is {n}");' },
  'C# Comments': { text: '// single line, /* multi-line */, and /// XML doc comments.', code: '// a comment\n/// <summary>Adds numbers</summary>' },
  'C# Variables': { text: 'Statically typed. Declare with a type or var (inferred). const for compile-time constants.', code: 'int age = 30;\nvar name = "Ana";\nconst double Pi = 3.14;' },
  'C# Data Types': { text: 'Value types: int, double, bool, char, struct. Reference types: string, arrays, classes.', code: 'int i = 1; double d = 2.5; bool ok = true; char c = \'A\'; string s = "hi";' },
  'C# Type Casting': { text: 'Implicit for widening, explicit (type) for narrowing; Convert and Parse for strings.', code: 'double d = 9.78;\nint i = (int)d;          // 9\nint n = int.Parse("42");' },
  'C# User Input': { text: 'Console.ReadLine returns a string; parse it. Use TryParse to avoid exceptions.', code: 'if (int.TryParse(Console.ReadLine(), out int age))\n    Console.WriteLine(age);' },
  'C# Strings': { text: 'Immutable. Use interpolation, Substring, Split, Trim, ToUpper.', code: 'string s = "Hello, World";\nConsole.WriteLine(s.ToUpper() + s.Length);' },
  'C# If...Else': { text: 'if / else if / else, with && || ! operators.', code: 'if (n < 0) Console.WriteLine("neg");\nelse if (n == 0) Console.WriteLine("zero");\nelse Console.WriteLine("pos");' },
  'C# Switch': { text: 'switch statements and modern switch expressions.', code: 'string label = code switch {\n    200 => "OK",\n    404 => "Not found",\n    _ => "Other"\n};' },
  'C# While Loop': { text: 'while checks first; do/while runs at least once.', code: 'int i = 0;\nwhile (i < 3) { Console.WriteLine(i); i++; }' },
  'C# For Loop': { text: 'for (init; condition; step) and foreach over collections.', code: 'foreach (var x in new[] {1, 2, 3})\n    Console.WriteLine(x);' },
  'C# Arrays': { text: 'Fixed-size, typed, zero-indexed. Use List<T> for resizable collections.', code: 'int[] a = {3, 1, 2};\nArray.Sort(a);\nvar list = new List<int> { 1, 2 };\nlist.Add(3);' },
  'C# Methods': { text: 'Declare return type, name and parameters. void returns nothing.', code: 'static int Add(int a, int b) => a + b;' },
  'C# Method Overloading': { text: 'Several methods share a name but differ in parameters.', code: 'static int Add(int a, int b) => a + b;\nstatic double Add(double a, double b) => a + b;' },
  'C# Classes/Objects': { text: 'A class is a blueprint; new creates an object.', code: 'class Car { public string Color = "red"; }\nvar c = new Car();' },
  'C# Constructors': { text: 'Special method that runs on new. Use it to set required state.', code: 'class Car {\n    public string Model;\n    public Car(string model) { Model = model; }\n}' },
  'C# Properties': { text: 'Encapsulate fields with get/set. Auto-properties are the default.', code: 'class User {\n    public string Name { get; set; }\n    public int Id { get; init; }\n}' },
  'C# Inheritance': { text: 'A derived class uses : BaseClass. override changes virtual methods.', code: 'class Animal { public virtual string Sound() => "..."; }\nclass Dog : Animal { public override string Sound() => "woof"; }' },
  'C# Interface': { text: 'Defines a contract that classes implement.', code: 'interface IRepo { void Save(string x); }\nclass SqlRepo : IRepo { public void Save(string x) { } }' },
  'C# Enums': { text: 'Named constants of an integral type.', code: 'enum Level { Low, Medium, High }\nvar l = Level.High;' },
  'C# Exceptions': { text: 'try / catch / finally; throw to signal errors.', code: 'try { int.Parse("x"); }\ncatch (FormatException e) { Console.WriteLine(e.Message); }\nfinally { Console.WriteLine("done"); }' },
  'C# Files': { text: 'System.IO offers File.ReadAllText, WriteAllText and more.', code: 'File.WriteAllText("a.txt", "hi");\nstring s = File.ReadAllText("a.txt");' },
}
export const W3 = { python: 'https://www.w3schools.com/python/', csharp: 'https://www.w3schools.com/cs/' }
