# Lambda

# Lambda functions

---

Normally we define a function using the def keyword somewhere in the code and call it whenever we need to use it.

```python
def sum(a,b):
    return a + b

a = 1
b = 2
c = sum(a,b)
print(c)
```

Now instead of defining the function somewhere and calling it, we can use python's lambda functions, which are inline functions defined at the same place we use it. So we don't need to declare a function somewhere and revisit the code just for a single time use.

They don't need to have a name, so they also called anonymous functions. We define a lambda function using the keyword lambda.

```python
your_function_name = lambda inputs : output
```

So the above sum example using lambda function would be,

```python
a = 1
b = 2
sum = lambda x,y : x + y
c = sum(a,b)
print(c)
```

Here we are assigning the lambda function to the variable **sum**, and upon giving the arguments i.e. a and b, it works like a normal function.

Write a program using lambda functions to check if a number in the given list is odd. Print "True" if the number is odd or "False" if not for each element.

---
Ready for a challenge? Hit the button below.