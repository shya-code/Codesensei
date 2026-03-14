# Nested Loops

In [Python programming language](https://www.geeksforgeeks.org/python/python-programming-language-tutorial/) there are two types of loops which are [for loop](https://www.geeksforgeeks.org/python/python-for-loops/) and [while loop](https://www.geeksforgeeks.org/python/python-while-loop/). Using these loops we can create nested loops in Python. Nested loops mean loops inside a loop. For example, while loop inside the for loop, for loop inside the for loop, etc.

![Python Nested Loops](https://media.geeksforgeeks.org/wp-content/uploads/20220801153940/Nestedloop.png)

Python Nested Loops

## ****Python Nested Loops Syntax:****

> Outer\_loop Expression:
>
>     Inner\_loop Expression:
>
>         Statement inside inner\_loop
>
>     Statement inside Outer\_loop

## Python Nested Loops Examples

### Example 1: Basic Example of Python Nested Loops

Python

```` ```python
x = [1, 2]
y = [4, 5]

for i in x:
  for j in y:
    print(i, j)
``` ````

****Output:****

```python
1 4  
1 5  
2 4  
2 5
```

Python

```` ```python
x = [1, 2]
y = [4, 5]
i = 0
while i < len(x) :
  j = 0
  while j < len(y) :
    print(x[i] , y[j])
    j = j + 1
  i = i + 1
``` ````

*****Time Complexity:***** **O(n****2****)**

*****Auxiliary Space:***** **O(1)**

### Example 2: Printing multiplication table using Python nested for loops

Python

```` ```python
# Running outer loop from 2 to 3

for i in range(2, 4):

    # Printing inside the outer loop
    # Running inner loop from 1 to 10
    for j in range(1, 11):

        # Printing inside the inner loop
        print(i, "*", j, "=", i*j)
    # Printing inside the outer loop
    print()
``` ````

****Output:****

```python
2 * 1 = 2  
2 * 2 = 4  
2 * 3 = 6  
2 * 4 = 8  
2 * 5 = 10  
2 * 6 = 12  
2 * 7 = 14  
2 * 8 = 16  
2 * 9 = 18  
2 * 10 = 20  
  
  
3 * 1 = 3  
3 * 2 = 6  
3 * 3 = 9  
3 * 4 = 12  
3 * 5 = 15  
3 * 6 = 18  
3 * 7 = 21  
3 * 8 = 24  
3 * 9 = 27  
3 * 10 = 30
```

*****Time Complexity:***** **O(n****2****)**

*****Auxiliary Space:***** **O(1)**

In the above example what we do is take an outer for loop running from 2 to 3 for multiplication table of 2 and 3 and then inside that loop we are taking an inner for loop that will run from 1 to 10 inside that we are [printing multiplication table](https://www.geeksforgeeks.org/dsa/program-to-print-multiplication-table-of-a-number/) by multiplying each iteration value of inner loop with the [iteration](https://www.geeksforgeeks.org/python/iterators-in-python/) value of outer loop as we see in the below output.

### Example 3: Printing using different inner and outer nested loops

Python

```` ```python
# Initialize list1 and list2
# with some strings
list1 = ['I am ', 'You are ']
list2 = ['healthy', 'fine', 'geek']

# Store length of list2 in list2_size
list2_size = len(list2)

# Running outer for loop to
# iterate through a list1.
for item in list1:
  
    # Printing outside inner loop
    print("start outer for loop ")
    # Initialize counter i with 0
    i = 0
    # Running inner While loop to
    # iterate through a list2.
    while(i < list2_size):
      
        # Printing inside inner loop
        print(item, list2[i])
        # Incrementing the value of i
        i = i+1
    # Printing outside inner loop
    print("end for loop ")
``` ````

****Output:****

```python
start outer for loop  
I am  healthy  
I am  fine  
I am  geek  
  
end for loop  
  
start outer for loop  
  
You are  healthy  
You are  fine  
You are  geek  
  
end for loop
```

*****Time Complexity:***** **O(n****2****)**

*****Auxiliary Space:***** **O(1)**

In this example, we are initializing two [lists](https://www.geeksforgeeks.org/python/python-lists/) with some [strings](https://www.geeksforgeeks.org/python/python-string/). Store the size of list2 in 'list2\_Size' using len() function and using it in the while loop as a counter. After that run an outer for loop to [iterate over list1](https://www.geeksforgeeks.org/python/iterate-over-a-list-in-python/) and inside that loop run an inner while loop to iterate over list2 using [list indexing](https://www.geeksforgeeks.org/python/python-lists/) inside that we are printing each value of list2 for every value of list1.

## Using break statement in nested loops

It is a type of loop control statement. In a loop, we can use the [break statement](https://www.geeksforgeeks.org/python/python-break-statement/) to exit from the loop. When we use a break statement in a loop it skips the rest of the iteration and terminates the loop. let's understand it using an example.

****Code:****

Python

```` ```python
# Running outer loop from 2 to 3
for i in range(2, 4):

    # Printing inside the outer loop
    # Running inner loop from 1 to 10
    for j in range(1, 11):
      if i==j:
        break
      # Printing inside the inner loop
      print(i, "*", j, "=", i*j)
    # Printing inside the outer loop
    print()
``` ````

****Output:****

```python
2 * 1 = 2  
  
3 * 1 = 3  
3 * 2 = 6
```

*****Time Complexity:***** **O(n****2****)**

*****Auxiliary Space:***** **O(1)**

The above code is the same as in Example 2 In this code we are using a break statement inside the inner loop by using the [if statement](https://www.geeksforgeeks.org/python/python-if-else/). Inside the inner loop if 'i' becomes equals to 'j' then the inner loop will be terminated and not executed the rest of the iteration as we can see in the output table of 3 is printed up to two iterations because in the next iteration 'i' becomes equal to 'j' and the loop breaks.

## Using continue statement in nested loops

A continue statement is also a type of loop control statement. It is just the opposite of the break statement. The continue statement forces the loop to jump to the next iteration of the loop whereas the break statement terminates the loop. Let's understand it by using code.

Python

```` ```python
# Running outer loop from 2 to 3
for i in range(2, 4):

    # Printing inside the outer loop
    # Running inner loop from 1 to 10
    for j in range(1, 11):
      if i==j:
        continue
      # Printing inside the inner loop
      print(i, "*", j, "=", i*j)
    # Printing inside the outer loop
    print()
``` ````

****Output:****

```python
2 * 1 = 2  
2 * 3 = 6  
2 * 4 = 8  
2 * 5 = 10  
2 * 6 = 12  
2 * 7 = 14  
2 * 8 = 16  
2 * 9 = 18  
2 * 10 = 20  
  
3 * 1 = 3  
3 * 2 = 6  
3 * 4 = 12  
3 * 5 = 15  
3 * 6 = 18  
3 * 7 = 21  
3 * 8 = 24  
3 * 9 = 27  
3 * 10 = 30
```

*****Time Complexity:***** **O(n****2****)**

*****Auxiliary Space:***** **O(1)**

In the above code instead of using a break statement, we are using a continue statement. Here when 'i' becomes equal to 'j' in the inner loop it skips the rest of the code in the inner loop and jumps on the next iteration as we see in the output "2 \* 2 = 4" and "3 \* 3 = 9" is not printed because at that point 'i' becomes equal to 'j'.

## Single line Nested loops using list comprehension

To convert the multiline nested loops into a single line, we are going to use [list comprehension in Python](https://www.geeksforgeeks.org/python/python-list-comprehension/). List comprehension includes brackets consisting of expression, which is executed for each element, and the for loop to iterate over each element in the list.

****Syntax of List Comprehension:****

> **newList** *****=**********[***** **expression(element)** *****for***** **element** *****in***** **oldList** *****if***** **condition** *****]*****

****Code:****

Python

```` ```python
# Using  list comprehension to make
# nested loop statement in single line.
list1 = [[j for j in range(3)]
         for i in range(5)]
# Printing list1
print(list1)
``` ````

****Output:****

```python
[[0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2]]
```

In the above code, we are storing a list inside the list using list comprehension in the inner loop of list comprehension [j for j in range(3)] to make a list [0, 1, 2] for every iteration of the outer loop "for i in range(5)".

*****Time Complexity:***** **O(n****2****) It is faster than nested loops**

*****Auxiliary Space:***** **O(n)**

---
Ready for a challenge? Hit the button below.