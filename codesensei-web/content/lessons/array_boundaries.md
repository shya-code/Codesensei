# Array Boundaries

****index()**** method in Python is a helpful tool when you want to find the position of a specific item in a list. It works by searching through the list from the beginning and returning the index (position) of the first occurrence of the element you're looking for. ****Example:****

Python

```` ```python
a = ["cat", "dog", "tiger"]
print(a.index("dog"))
``` ````

**Output**

```python
1
```

****Explanation: index("dog")**** method finds the first occurrence of "dog" in the list ****a****. Since "dog" is at index 1, it returns 1.

## Syntax of List index() method

> list.index(element, start, end)

****Parameters:****

* ****element (required):**** The item to search for.
* ****start (optional):**** Index to start the search from (default is 0).
* ****end (optional):**** Index to end the search (exclusive, default is end of list).

****Returns:****

* The first index of element in the list within the specified range.
* Raises ValueError if the element is not found.

## Examples of List index()

****Example 1:**** In this example, we are searching for the index of the number 40 within a specific range of the list from index 4 to 7 .

Python

```` ```python
a = [10, 20, 30, 40, 50, 40, 60, 40, 70]

res = a.index(40, 4, 8)
print(res)
``` ````

**Output**

```python
5
```

****Example 2:**** In this example, we try to find the index of 'yellow' in the list and handle the error with a try-except block if it's not found.

Python

```` ```python
a = ['red', 'green', 'blue']

try:
    index = a.index('yellow')
    print(a)
except ValueError:
    print("Not Present")
``` ````

**Output**

```python
Not Present
```

****Example 3:**** In this example, we are finding the index of the tuple ("Bob", 22) in a list of tuples and index() will return the position of its first occurrence.

Python

```` ```python
a = [("Alice", 21), ("Bob", 22), ("Charlie", 20), ("Bob", 24)]

res = a.index(("Bob", 22))
print(res)
``` ````

**Output**

```python
1
```

> ****Also Read:****
>
> * [Python Program to Accessing index and value in list](https://www.geeksforgeeks.org/python/python-accessing-index-and-value-in-list/)
> * [Python | Ways to find indices of value in list](https://www.geeksforgeeks.org/python/python-ways-to-find-indices-of-value-in-list/)

---
Ready for a challenge? Hit the button below.