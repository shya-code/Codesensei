# Classes and Objects

---

Objects are an encapsulation of variables and functions into a single entity. Objects get their variables and functions from **classes**. Classes are essentially a template to create your objects.

A very basic class looks like this:

```python
class MyClass:
    variable = "blah"

    def function(self):
        print("This is a message inside the class.")
```

To assign this class to an object:

```python
myobjectx = MyClass()
```

Now `myobjectx` holds an object of the class `MyClass`.

### Accessing Object Variables

```python
class MyClass:
    variable = "blah"

    def function(self):
        print("This is a message inside the class.")

myobjectx = MyClass()
print(myobjectx.variable)  # prints "blah"
```

You can create multiple objects from the same class — each has its own independent copy of the variables:

```python
myobjectx = MyClass()
myobjecty = MyClass()
myobjecty.variable = "yackity"

print(myobjectx.variable)  # blah
print(myobjecty.variable)  # yackity
```

### Accessing Object Functions

```python
myobjectx = MyClass()
myobjectx.function()  # prints "This is a message inside the class."
```

### `__init__()`

The `__init__()` function is special — it is called automatically when you create a new object. It's used for assigning values in a class:

```python
class NumberHolder:
    def __init__(self, number):
        self.number = number

    def returnNumber(self):
        return self.number

var = NumberHolder(7)
print(var.returnNumber())  # prints 7
```

The `self` parameter refers to the object itself, so `self.number` stores the value *inside* the object.

---
Ready for a challenge? Hit the button below.
