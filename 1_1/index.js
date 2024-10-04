/**
 * Знайомство з Node.js
 */

// Initial data
const arr = [1, 2, 3, 4, 5];

recursiveIteration(arr);

function recursiveIteration(array, index = 0) {
  if (index >= array.length) {
    return;
  }

  console.log(array[index]);

  recursiveIteration(array, index + 1);
}
