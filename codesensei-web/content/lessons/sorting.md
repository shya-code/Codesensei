# Sorting

Sorting is defined as an arrangement of data in a certain order like sorting numbers in increasing order or decreasing order, sorting students by marks and sorting names alphabetically

* There can be different types of input arrays like binary array, a character array, an array with a large range of values or an array with many duplicates or a small vs large array. There exist different sorting algorithms to handle different cases.
* The algorithms may also differ according to output requirements. For example, stable sorting (or maintains original order of equal elements) or not stable. .

![Introduction-to-Sorting-Techniques](https://media.geeksforgeeks.org/wp-content/uploads/20240520115941/Introduction-to-Sorting-Techniques.webp)

Introduction to Sorting

Some of the real-life examples of sorting are:

* ****Telephone Directory:****  It is a book that contains telephone numbers and addresses of people in alphabetical order.
* ****Dictionary:**** It is a huge collection of words along with their meanings in alphabetical order.
* ****Contact List:**** It is a list of contact numbers of people in alphabetical order on a mobile phone.

### Built-in Support in Python

Python has two main methods to sort a list, [sort()](https://www.geeksforgeeks.org/python/sort-in-python/) and [sorted()](https://www.geeksforgeeks.org/python/python-sorted-function/). Please refer [Sort a list in Python](https://www.geeksforgeeks.org/python/sort-a-list-in-python/) for details.

### Implementing Different Algorithms in Python

The different implementations of sorting techniques in Python are:

****1. Bubble Sort****

Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping the adjacent elements if they are in the wrong order. 

* Bubble Sort algorithm, sorts an array by repeatedly comparing adjacent elements and swapping them if they are in the wrong order.
* The algorithm iterates through the array multiple times, with each pass pushing the largest unsorted element to its correct position at the end.
* Code includes an optimization: if no swaps are made during a pass, the array is already sorted, and the sorting process stops.

> Explore in detail about [Bubble Sort - Python](https://www.geeksforgeeks.org/python/python-program-for-bubble-sort/)

****2. Selection Sort****

****Selection Sort**** is a comparison-based sorting algorithm. It sorts an array by repeatedly selecting the ****smallest (or largest)**** element from the unsorted portion and swapping it with the first unsorted element. This process continues until the entire array is sorted.

1. First we find the smallest element and swap it with the first element. This way we get the smallest element at its correct position.
2. Then we find the smallest among remaining elements (or second smallest) and swap it with the second element.
3. We keep doing this until we get all elements moved to correct position.

> Explore in detail about [Selection Sort - Python](https://www.geeksforgeeks.org/python/python-program-for-selection-sort/)

****3. Insertion Sort****

****Insertion sort****is a simple sorting algorithm that works by iteratively inserting each element of an unsorted list into its correct position in a sorted portion of the list.

* The insertionSort function takes an array arr as input. It first calculates the length of the array (n). If the length is 0 or 1, the function returns immediately as an array with 0 or 1 element is considered already sorted.
* For arrays with more than one element, We start with second element of the array as first element in the array is assumed to be sorted.
* Compare second element with the first element and check if the second element is smaller then swap them.
* Move to the third element and compare it with the first two elements and put at its correct position
* Repeat until the entire array is sorted.

> Explore in detail about [Insertion Sort - Python](https://www.geeksforgeeks.org/python/python-program-for-insertion-sort/)

****4. Merge Sort****

Merge Sort is a [Divide and Conquer](https://www.geeksforgeeks.org/dsa/introduction-to-divide-and-conquer-algorithm/) algorithm. It divides input array in two halves, calls itself for the two halves and then merges the two sorted halves. ****The merge() function**** is used for merging two halves. The merge(arr, l, m, r) is key process that assumes that arr[l..m] and arr[m+1..r] are sorted and merges the two sorted sub-arrays into one. 

> Explore in detail about [Merge Sort - Python](https://www.geeksforgeeks.org/python/python-program-for-merge-sort/)

****5. Quick Sort****

****QuickSort**** is a sorting algorithm based on the Divide and Conquer that picks an element as a pivot and partitions the given array around the picked pivot by placing the pivot in its correct position in the sorted array.

> Explore in detail about [Quick Sort - Python](https://www.geeksforgeeks.org/dsa/python-program-for-quicksort/)

****6. Heap Sort****

Heapsort is a comparison-based sorting technique based on a Binary Heap data structure. It is similar to selection sort where we first find the maximum element and place the maximum element at the end. We repeat the same process for the remaining element.

> Explore in detail about [Heap Sort - Python](https://www.geeksforgeeks.org/dsa/python-program-for-heap-sort/)

****7. Cycle Sort****

Cycle sort is an in-place, unstable sorting algorithm that is particularly useful when sorting arrays containing elements with a small range of values. It is optimal in terms of several memory writes. It minimizes the number of memory writes to sort (Each value is either written zero times, if it’s already in its correct position or written one time to its correct position.)

It is based on the idea that the array to be sorted can be divided into cycles. Cycles can be visualized as a graph. We have n nodes and an edge directed from node ****i**** to node ****j**** if the element at ****i-th**** index must be present at ****j-th**** index in the sorted array.  
****Cycle in arr[] = {2, 4, 5, 1, 3}****

> Explore in detail about [Cycle Sort - Python](https://www.geeksforgeeks.org/dsa/python-program-for-cycle-sort/)

****8. 3-way Merge Sort****

Merge Sort is a divide-and-conquer algorithm that recursively splits an array into two halves, sorts each half, and then merges them. A variation of this is ****3-way Merge Sort****, where instead of splitting the array into two parts, we divide it into ****three equal parts****. 

In traditional Merge Sort, the array is recursively divided into halves until we reach subarrays of size ****1****. In ****3-way Merge Sort****, the array is recursively divided into ****three**** parts, reducing the depth of recursion and potentially improving efficiency.

> Explore in detail about [3-way Merge Sort - Python](https://www.geeksforgeeks.org/dsa/3-way-merge-sort-in-python/)

****9. Counting Sort****

****Counting Sort****is a ****non-comparison-based**** sorting algorithm. It is particularly efficient when the range of input values is small compared to the number of elements to be sorted. The basic idea behind Counting Sort is to count the frequency of each distinct element in the input array and use that information to place the elements in their correct sorted positions. For example, for input [1, 4, 3, 2, 2, 1], the output should be [1, 1, 2, 2, 3, 4]. The important thing to notice is that the range of input elements is small and comparable to the size of the array.

> Explore in detail about [Counting Sort - Python](https://www.geeksforgeeks.org/python/python-program-for-counting-sort/)

****10. Radix Sort****

****Radix Sort****is a linear sorting algorithm that sorts elements by processing them digit by digit. It is an efficient sorting algorithm for integers or strings with fixed-size keys. 

Rather than comparing elements directly, Radix Sort distributes the elements into buckets based on each digit’s value. By repeatedly sorting the elements by their significant digits, from the least significant to the most significant, Radix Sort achieves the final sorted order.

> Explore in detail about [Radix Sort - Python](https://www.geeksforgeeks.org/python/python-program-for-radix-sort/)

****11. Bucket Sort****

****Bucket sort**** is a sorting technique that involves dividing elements into various groups, or buckets. These buckets are formed by uniformly distributing the elements. Once the elements are divided into buckets, they can be sorted using any other sorting algorithm. Finally, the sorted elements are gathered together in an ordered fashion.

> Explore in detail about [Bucket Sort - Python](https://www.geeksforgeeks.org/dsa/bucket-sort-in-python/)

****12. Tim Sort****

****Tim Sort**** is a hybrid sorting algorithm derived from merge sort and insertion sort. It is designed to perform well on many kinds of real-world data. Tim Sort's efficiency comes from its ability to exploit the structure present in the data, such as runs (consecutive sequences that are already ordered) and merges these runs using a modified merge sort approach. It was Created by****Tim Peters****in ****2002****, ****Tim Sort**** is the default sorting algorithm in Python and is renowned for its speed and efficiency in real-world data scenarios.

> Explore in detail about [Tim Sort - Python](https://www.geeksforgeeks.org/dsa/tim-sort-in-python/)

****13. Comb Sort****

****Comb Sort**** is an improvement over Bubble Sort, and it aims to eliminate the problem of small values near the end of the list, which causes Bubble Sort to take more time than necessary. Comb Sort uses a larger gap for comparison, which gradually reduces until it becomes 1 (like the gap in Shell Sort). By doing this, it helps in more efficient sorting by “jumping over” some unnecessary comparisons and swaps.

* The shrink factor has been empirically found to be 1.3 (by testing Comb sort on over 200,000 random lists)
* Although it works better than Bubble Sort on average, the worst case remains O****(n********2********)****.

> Explore in detail about [Comb Sort - Python](https://www.geeksforgeeks.org/python/python-program-for-comb-sort/)

****14. Pigeonhole Sort****

Pigeonhole Sort is a sorting algorithm that is suitable for sorting lists of elements where the number of elements and the number of possible key values are approximately the same. It requires O(**n** + **Range**) time where n is number of elements in input array and 'Range' is number of possible values in array.

> Explore in detail about [Pigeonhole Sort - Python](https://www.geeksforgeeks.org/python/python-program-for-pigeonhole-sort/)

****15. Shell Sort****

****Shell Sort**** is an advanced version of the insertion sort algorithm that improves its efficiency by comparing and sorting elements that are far apart. The idea behind Shell Sort is to break the original list into smaller sublists, sort these sublists, and gradually reduce the gap between the sublist elements until the list is sorted.

> Explore in detail about [Shell Sort - Python](https://www.geeksforgeeks.org/python/python-program-for-shellsort/)

### ****Different Types of Sorting Orders****

* ****Increasing Order:**** A set of values are said to be increasing order when every successive element is greater than its previous element. For example: 1, 2, 3, 4, 5. Here, the given sequence is in increasing order.
* ****Decreasing Order:**** A set of values are said to be in decreasing order when the successive element is always less than the previous one. For Example: 5, 4, 3, 2, 1. Here the given sequence is in decreasing order.
* ****Non-Increasing Order:**** A set of values are said to be in non-increasing order if every ith element present in the sequence is less than or equal to its (i-1)th element. This order occurs whenever there are numbers that are being repeated. For Example: 5, 4, 3, 2, 2, 1. Here 2 repeated two times.
* ****Non-Decreasing Order:**** A set of values are said to be in non-decreasing order if every ith element present in the sequence is greater than or equal to its (i-1)th element. This order occurs whenever there are numbers that are being repeated. For Example: 1, 2, 2, 3, 4, 5. Here 2 repeated two times.

---
Ready for a challenge? Hit the button below.