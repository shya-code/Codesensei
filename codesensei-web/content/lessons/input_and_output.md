# Input and Output

---

Taking input and showing output in the required way plays an important role in interactive coding.

### `input()`

The `input()` function reads a line of text from the user:

```python
name = input()  # waits for user to type something
print(name)
```

You can also provide a prompt message:

```python
name = input("Enter your name: ")
print("Hello,", name)
```

Note: `input()` always returns a **string**. To use it as a number, convert it:

```python
age = int(input("Enter your age: "))
print("Next year you will be", age + 1)

price = float(input("Enter a price: "))
print("With tax:", price * 1.1)
```

### Taking Multiple Inputs on One Line

Use `split()` with `map()` to read two or more values at once:

```python
# User types: 3 5
a, b = map(int, input().split())
print(a + b)  # prints 8
```

### Output Formatting

`print()` automatically adds a newline. You can use `%`-style formatting:

```python
a = 5
b = 0.63
c = "hello"
print("a is: %d, b is %0.4f, c is %s" % (a, b, c))
```

Or use f-strings (the modern way):

```python
name = "Alex"
age = 17
print(f"My name is {name} and I am {age} years old.")
```

You can control the separator between values with `sep=` and the line ending with `end=`:

```python
print("one", "two", "three", sep=", ")  # one, two, three
print("no newline", end="")
print(" — same line")
```

---
Ready for a challenge? Hit the button below.
