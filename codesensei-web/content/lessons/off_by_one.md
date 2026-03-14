# Off-By-One Errors

---

An **off-by-one error** is one of the most common bugs in programming. It happens when a loop runs one iteration too many or too few — usually because of a mistake in the boundary condition.

### Why It Happens

Python lists and strings use **zero-based indexing** — the first element is at index `0`, and the last element is at index `len(list) - 1`.

```python
scores = [10, 20, 30, 40, 50]
#          0   1   2   3   4   ← indices

print(scores[0])   # 10 (first)
print(scores[4])   # 50 (last)
print(scores[5])   # ❌ IndexError: list index out of range
```

### Off-By-One in a Loop

```python
scores = [10, 20, 30, 40, 50]

# ❌ Wrong — goes one step too far
for i in range(len(scores) + 1):
    print(scores[i])   # crashes at scores[5]

# ✅ Correct — range(5) gives 0,1,2,3,4
for i in range(len(scores)):
    print(scores[i])
```

### The Better Way: Iterate Directly

Avoid index arithmetic by looping over items directly:

```python
scores = [10, 20, 30, 40, 50]

for score in scores:     # no index needed at all
    print(score)
```

### When You Need the Index: `enumerate()`

If you need both the index AND the value, use `enumerate()`:

```python
scores = [10, 20, 30, 40, 50]

for i, score in enumerate(scores):
    print(f"Position {i}: {score}")
```

Output:
```
Position 0: 10
Position 1: 20
Position 2: 30
Position 3: 40
Position 4: 50
```

### Accessing the Last Element Safely

```python
scores = [10, 20, 30, 40, 50]

print(scores[-1])        # 50 — last element (always works)
print(scores[-2])        # 40 — second to last
```

Use negative indices instead of `scores[len(scores) - 1]` — less error prone.

### Classic Mistake: Fence Post Error

Imagine a 10-metre fence with posts every metre. How many posts do you need?

The answer is **11**, not 10. The first post and last post are both needed.

In code: if you want to visit items **including** the end:

```python
# Print numbers 1 through 10 inclusive
for i in range(1, 11):   # range(1, 11) gives 1,2,...,10
    print(i)
```

`range(start, stop)` does **not** include `stop`. So to go up to and including 10, you write `range(1, 11)`.

---
Ready for a challenge? Hit the button below.
