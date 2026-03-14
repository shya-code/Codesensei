// content/puzzles/puzzles.ts
export interface Puzzle {
  id: string;
  code: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const PUZZLES: Record<string, Puzzle[]> = {
  "variables": [
    {id:"v1", code:"x = 5\ny = 3\nprint(x + y)", question:"What does this print?", options:["5","3","8","53"], correct:2, explanation:"x+y adds the numbers 5 and 3 giving 8."},
    {id:"v2", code:"name = 'Alex'\nname = 'Sam'\nprint(name)", question:"What does this print?", options:["Alex","Sam","AlexSam","Error"], correct:1, explanation:"Variables can be reassigned — the last value wins."},
    {id:"v3", code:"a = 10\nb = a\na = 20\nprint(b)", question:"What does this print?", options:["20","10","30","Error"], correct:1, explanation:"b copied a's value at that moment — changing a later doesn't change b."},
    {id:"v4", code:"x = 4\nx = x + 1\nprint(x)", question:"What does this print?", options:["4","5","x+1","Error"], correct:1, explanation:"x+1 is evaluated first giving 5, then stored back into x."},
    {id:"v5", code:"a = 3\nb = 4\nc = a * b\nprint(c)", question:"What does this print?", options:["7","34","12","43"], correct:2, explanation:"3 multiplied by 4 equals 12."}
  ],

  "loops": [
    {id:"l1", code:"for i in range(3):\n    print(i)", question:"What does this print?", options:["1 2 3","0 1 2","0 1 2 3","1 2"], correct:1, explanation:"range(3) gives 0,1,2 — it starts at 0 and stops before 3."},
    {id:"l2", code:"total = 0\nfor i in range(4):\n    total += i\nprint(total)", question:"What does this print?", options:["4","6","10","0"], correct:1, explanation:"0+1+2+3 equals 6."},
    {id:"l3", code:"for i in range(2, 5):\n    print(i)", question:"What does this print?", options:["2 3 4 5","2 3 4","1 2 3 4","3 4 5"], correct:1, explanation:"range(2,5) starts at 2 and stops before 5."},
    {id:"l4", code:"items = ['a','b','c']\nfor x in items:\n    print(x)", question:"What does this print?", options:["a b c on one line","a then b then c each line","['a','b','c']","Error"], correct:1, explanation:"Each loop iteration prints one item on its own line."},
    {id:"l5", code:"count = 0\nfor i in range(5):\n    count += 1\nprint(count)", question:"What does this print?", options:["0","4","5","6"], correct:2, explanation:"The loop runs 5 times so count becomes 5."}
  ],

  "functions": [
    {id:"f1", code:"def greet(name):\n    return 'Hi ' + name\nprint(greet('Alex'))", question:"What does this print?", options:["greet('Alex')","Hi name","Hi Alex","Error"], correct:2, explanation:"The function joins 'Hi ' with the argument 'Alex'."},
    {id:"f2", code:"def double(n):\n    return n * 2\nx = double(3)\nprint(x)", question:"What does this print?", options:["3","n*2","double(3)","6"], correct:3, explanation:"double(3) returns 3*2 which is 6, stored in x."},
    {id:"f3", code:"def add(a, b):\n    return a + b\nprint(add(2, add(3, 4)))", question:"What does this print?", options:["9","7","5","Error"], correct:0, explanation:"add(3,4)=7 first, then add(2,7)=9."},
    {id:"f4", code:"def say():\n    print('hello')\nsay()\nsay()", question:"How many times is hello printed?", options:["0","1","2","3"], correct:2, explanation:"The function is called twice so hello prints twice."},
    {id:"f5", code:"def f(x):\n    return x + 1\nprint(f(f(2)))", question:"What does this print?", options:["2","3","4","f(2)"], correct:2, explanation:"f(2)=3 first, then f(3)=4."}
  ],

  "lists": [
    {id:"li1", code:"nums = [10,20,30]\nprint(nums[1])", question:"What does this print?", options:["10","20","30","Error"], correct:1, explanation:"Index 1 is the second item which is 20."},
    {id:"li2", code:"items = [1,2,3]\nitems.append(4)\nprint(len(items))", question:"What does this print?", options:["3","4","5","Error"], correct:1, explanation:"append adds one item making the length 4."},
    {id:"li3", code:"a = [5,3,8,1]\nprint(a[-1])", question:"What does this print?", options:["5","1","8","Error"], correct:1, explanation:"Index -1 always gives the last item."},
    {id:"li4", code:"x = [1,2,3]\ny = x\ny.append(4)\nprint(len(x))", question:"What does this print?", options:["3","4","1","Error"], correct:1, explanation:"x and y point to the same list so x also has 4 items."},
    {id:"li5", code:"nums = [2,4,6,8]\nprint(nums[1:3])", question:"What does this print?", options:["[2,4]","[4,6]","[4,6,8]","[2,4,6]"], correct:1, explanation:"Slice 1:3 takes index 1 and 2 giving [4,6]."}
  ],

  "string_indexing": [
    {id:"s1", code:"word = 'Python'\nprint(word[0])", question:"What does this print?", options:["P","y","Python","Error"], correct:0, explanation:"Index 0 is always the first character."},
    {id:"s2", code:"s = 'hello'\nprint(s[-1])", question:"What does this print?", options:["h","e","o","Error"], correct:2, explanation:"Index -1 gives the last character which is o."},
    {id:"s3", code:"s = 'abcdef'\nprint(s[2:5])", question:"What does this print?", options:["abc","cde","bcd","cdef"], correct:1, explanation:"Slice 2:5 takes characters at index 2,3,4 giving cde."},
    {id:"s4", code:"s = 'Hello'\nprint(len(s))", question:"What does this print?", options:["4","5","6","Error"], correct:1, explanation:"Hello has 5 characters."},
    {id:"s5", code:"s = 'Python'\nprint(s[1:4])", question:"What does this print?", options:["Pyt","yth","ytho","ython"], correct:1, explanation:"Index 1,2,3 gives y,t,h so the result is yth."}
  ],

  "dictionaries": [
    {id:"d1", code:"d = {'a':1,'b':2}\nprint(d['b'])", question:"What does this print?", options:["1","2","b","Error"], correct:1, explanation:"Key 'b' maps to value 2."},
    {id:"d2", code:"d = {'x':10}\nd['y'] = 20\nprint(len(d))", question:"What does this print?", options:["1","2","3","Error"], correct:1, explanation:"Adding key 'y' makes the dict have 2 items."},
    {id:"d3", code:"d = {'a':1,'b':2,'c':3}\nprint('b' in d)", question:"What does this print?", options:["True","False","1","Error"], correct:0, explanation:"'b' is a key in the dict so in returns True."},
    {id:"d4", code:"d = {'k':5}\nd['k'] = 10\nprint(d['k'])", question:"What does this print?", options:["5","10","15","Error"], correct:1, explanation:"Assigning to an existing key overwrites the old value."},
    {id:"d5", code:"d = {'a':1,'b':2}\nkeys = list(d.keys())\nprint(keys[0])", question:"What does this print?", options:["a","b","1","2"], correct:0, explanation:"keys() preserves insertion order so the first key is 'a'."}
  ],

  "recursion": [
    {id:"r1", code:"def f(n):\n    if n == 0: return 0\n    return n + f(n-1)\nprint(f(3))", question:"What does this print?", options:["3","6","0","Error"], correct:1, explanation:"3+2+1+0 equals 6."},
    {id:"r2", code:"def count(n):\n    if n == 0: return\n    print(n)\n    count(n-1)\ncount(3)", question:"What prints first?", options:["0","1","2","3"], correct:3, explanation:"count(3) prints 3 first before calling count(2)."},
    {id:"r3", code:"def f(n):\n    if n <= 1: return 1\n    return 2 * f(n-1)\nprint(f(4))", question:"What does this print?", options:["4","8","16","32"], correct:2, explanation:"2*2*2*1 = 8 wait — f(1)=1,f(2)=2,f(3)=4,f(4)=8."},
    {id:"r4", code:"def f(n):\n    if n == 0: return 0\n    return 1 + f(n-1)\nprint(f(5))", question:"What does this print?", options:["0","4","5","6"], correct:2, explanation:"The function counts down from 5 adding 1 each time giving 5."},
    {id:"r5", code:"def f(s):\n    if len(s) == 0: return ''\n    return f(s[1:]) + s[0]\nprint(f('abc'))", question:"What does this print?", options:["abc","cba","bca","Error"], correct:1, explanation:"This recursively reverses the string giving cba."}
  ],

  "sorting": [
    {id:"so1", code:"nums = [3,1,4,1,5]\nprint(sorted(nums)[0])", question:"What does this print?", options:["3","1","5","4"], correct:1, explanation:"sorted gives [1,1,3,4,5] so index 0 is 1."},
    {id:"so2", code:"a = [5,2,8]\na.sort()\nprint(a)", question:"What does this print?", options:["[5,2,8]","[2,5,8]","[8,5,2]","Error"], correct:1, explanation:"sort() modifies the list in place in ascending order."},
    {id:"so3", code:"a = [1,2,3]\nb = sorted(a, reverse=True)\nprint(b[0])", question:"What does this print?", options:["1","2","3","Error"], correct:2, explanation:"reverse=True sorts descending so the first item is 3."},
    {id:"so4", code:"words = ['banana','apple','cherry']\nprint(sorted(words)[0])", question:"What does this print?", options:["banana","apple","cherry","Error"], correct:1, explanation:"Alphabetically apple comes first."},
    {id:"so5", code:"a = [3,1,2]\na.sort()\nprint(a[1])", question:"What does this print?", options:["1","2","3","Error"], correct:1, explanation:"After sorting a is [1,2,3] so index 1 is 2."}
  ],

  "nested_loops": [
    {id:"n1", code:"for i in range(2):\n    for j in range(2):\n        print(i,j)", question:"How many lines print?", options:["2","4","6","8"], correct:1, explanation:"2 outer iterations times 2 inner iterations equals 4 lines."},
    {id:"n2", code:"count = 0\nfor i in range(3):\n    for j in range(3):\n        count += 1\nprint(count)", question:"What does this print?", options:["3","6","9","12"], correct:2, explanation:"3 times 3 equals 9 total iterations."},
    {id:"n3", code:"for i in range(1,3):\n    for j in range(1,3):\n        print(i*j, end=' ')", question:"What does this print?", options:["1 2 2 4","1 2 3 4","2 4 6 8","1 4 9 16"], correct:0, explanation:"1*1=1, 1*2=2, 2*1=2, 2*2=4."},
    {id:"n4", code:"for i in range(3):\n    print('*' * (i+1))", question:"What does this print?", options:["* ** ***","*** ** *","* * *","** ** **"], correct:0, explanation:"i goes 0,1,2 so prints 1,2,3 stars on each line."},
    {id:"n5", code:"total = 0\nfor i in range(2):\n    for j in range(3):\n        total += j\nprint(total)", question:"What does this print?", options:["3","6","9","12"], correct:1, explanation:"j goes 0+1+2=3 twice giving 6."}
  ],

  "comprehensions": [
    {id:"c1", code:"x = [i*2 for i in range(4)]\nprint(x)", question:"What does this print?", options:["[0,2,4,6]","[2,4,6,8]","[0,1,2,3]","[1,2,3,4]"], correct:0, explanation:"range(4) is 0,1,2,3 doubled gives 0,2,4,6."},
    {id:"c2", code:"x = [i for i in range(10) if i%2==0]\nprint(len(x))", question:"What does this print?", options:["4","5","6","10"], correct:1, explanation:"Even numbers 0-9 are 0,2,4,6,8 — five of them."},
    {id:"c3", code:"words = ['hi','hello','hey']\nx = [w for w in words if len(w) > 2]\nprint(x)", question:"What does this print?", options:["['hi','hello','hey']","['hello','hey']","['hello']","['hi']"], correct:1, explanation:"Only words longer than 2 chars are hello and hey."},
    {id:"c4", code:"x = [i**2 for i in range(1,4)]\nprint(x[2])", question:"What does this print?", options:["4","9","16","1"], correct:1, explanation:"The list is [1,4,9] so index 2 is 9."},
    {id:"c5", code:"x = [i for i in range(5) if i != 3]\nprint(len(x))", question:"What does this print?", options:["3","4","5","6"], correct:1, explanation:"range(5) has 5 items, removing 3 leaves 4 items."}
  ],

  "array_boundaries": [
    {id:"ab1", code:"a = [10,20,30,40]\nprint(a[len(a)-1])", question:"What does this print?", options:["10","30","40","Error"], correct:2, explanation:"len(a)-1 is 3 which is the last valid index giving 40."},
    {id:"ab2", code:"a = [1,2,3]\ntry:\n    print(a[5])\nexcept:\n    print('error')", question:"What does this print?", options:["1","3","None","error"], correct:3, explanation:"Index 5 is out of bounds so the except block runs."},
    {id:"ab3", code:"a = [1,2,3,4,5]\nprint(a[1:-1])", question:"What does this print?", options:["[1,2,3,4,5]","[2,3,4]","[1,2,3,4]","[2,3,4,5]"], correct:1, explanation:"1:-1 takes from index 1 up to but not including the last."},
    {id:"ab4", code:"a = ['x','y','z']\nfor i in range(len(a)):\n    print(a[i])", question:"How many lines print?", options:["1","2","3","4"], correct:2, explanation:"range(len(a)) is range(3) giving 3 iterations."},
    {id:"ab5", code:"a = [10,20,30]\nprint(a[-2])", question:"What does this print?", options:["10","20","30","Error"], correct:1, explanation:"Index -2 counts 2 from the end giving 20."}
  ]
};
