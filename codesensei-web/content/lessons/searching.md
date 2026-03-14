# Searching

---

Searching means finding whether a value exists in a list, and where it is. Python gives you built-in tools and classic algorithms to do this efficiently.

### The `in` Operator

The simplest way to check if an item exists in a list:

```python
fruits = ["apple", "banana", "cherry"]
print("banana" in fruits)   # True
print("mango" in fruits)    # False
```

### Linear Search

A **linear search** checks each element one by one from the beginning until it finds the target (or reaches the end):

```python
def linear_search(items, target):
    for i in range(len(items)):
        if items[i] == target:
            return i       # return the index where it was found
    return -1              # -1 means not found

scores = [34, 78, 55, 92, 11]
result = linear_search(scores, 92)
print(result)   # prints 3
```

- **Worst case:** you check every element — O(n)
- **Works on:** any list, unsorted or sorted

### Binary Search

A **binary search** works only on a **sorted** list. It cuts the search area in half each time — much faster:

```python
def binary_search(items, target):
    low = 0
    high = len(items) - 1

    while low <= high:
        mid = (low + high) // 2   # find the middle index
        if items[mid] == target:
            return mid             # found it
        elif items[mid] < target:
            low = mid + 1          # target is in the right half
        else:
            high = mid - 1         # target is in the left half

    return -1   # not found

sorted_scores = [11, 34, 55, 78, 92]
result = binary_search(sorted_scores, 55)
print(result)   # prints 2
```

- **Worst case:** O(log n) — extremely fast on large lists
- **Requirement:** the list **must be sorted first**

### Python Built-in: `list.index()`

```python
fruits = ["apple", "banana", "cherry"]
print(fruits.index("cherry"))  # prints 2
```

This raises a `ValueError` if the item isn't found, so use `in` first to be safe.

---
Ready for a challenge? Hit the button below.
