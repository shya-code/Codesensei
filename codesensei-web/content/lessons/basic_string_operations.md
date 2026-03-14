# Basic String Operations

---

Strings are bits of text. They can be defined as anything between quotes:

```python
astring = "Hello world!"
astring2 = 'Hello world!'
```

### Length

Use `len()` to find the number of characters in a string:

```python
astring = "Hello world!"
print(len(astring))  # prints 12
```

### Finding Characters

`index()` finds the position of the first occurrence of a character:

```python
astring = "Hello world!"
print(astring.index("o"))  # prints 4
```

Note: Python starts counting at **0**, so the first character is at index 0.

`count()` counts how many times a character appears:

```python
astring = "Hello world!"
print(astring.count("l"))  # prints 3
```

### Slicing

You can extract a portion of a string using slices:

```python
astring = "Hello world!"
print(astring[3:7])   # prints "lo w"
print(astring[3:7:2]) # prints "l " (every 2nd character)
print(astring[::-1])  # prints the string reversed
```

### Case Methods

```python
astring = "Hello world!"
print(astring.upper())  # "HELLO WORLD!"
print(astring.lower())  # "hello world!"
```

### Checking Start/End

```python
astring = "Hello world!"
print(astring.startswith("Hello"))        # True
print(astring.endswith("asdfasdfasdf"))   # False
```

### Splitting

`split()` divides a string into a list of words:

```python
astring = "Hello world!"
afewwords = astring.split(" ")
print(afewwords)  # ['Hello', 'world!']
```

---
Ready for a challenge? Hit the button below.
