# Basic Operators

---

This section explains how to use basic operators in Python.

### Arithmetic Operators

The addition, subtraction, multiplication, and division operators can be used with numbers:

```python
number = 1 + 2 * 3 / 4.0
print(number)
```

Python follows the standard order of operations (PEMDAS / BODMAS).

The **modulo** (`%`) operator returns the integer remainder of a division:

```python
remainder = 11 % 3
print(remainder)  # prints 2
```

Using two multiplication symbols (`**`) creates a power relationship:

```python
squared = 7 ** 2
cubed = 2 ** 3
print(squared)  # prints 49
print(cubed)    # prints 8
```

### Using Operators with Strings

Python supports concatenating strings using the `+` operator:

```python
helloworld = "hello" + " " + "world"
print(helloworld)
```

You can also multiply a string to repeat it:

```python
lotsofhellos = "hello" * 10
print(lotsofhellos)
```

### Using Operators with Lists

Lists can be joined with the `+` operator:

```python
even_numbers = [2, 4, 6, 8]
odd_numbers = [1, 3, 5, 7]
all_numbers = odd_numbers + even_numbers
print(all_numbers)
```

Python also supports repeating lists using the `*` operator:

```python
print([1, 2, 3] * 3)
```

The target of this exercise is to print the sum, product, and result of `11 % 3` using the operators above.

---
Ready for a challenge? Hit the button below.
