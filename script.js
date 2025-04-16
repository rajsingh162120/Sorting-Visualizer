// DOM Elements
const arrayContainer = document.getElementById('arrayContainer');
const generateArrayBtn = document.getElementById('generateArrayBtn');
const algorithmSelect = document.getElementById('algorithmSelect');
const sizeInput = document.getElementById('sizeInput');
const sizeValue = document.getElementById('sizeValue');
const speedInput = document.getElementById('speedInput');
const speedValue = document.getElementById('speedValue');
const sortBtn = document.getElementById('sortBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const comparisonsElement = document.getElementById('comparisons');
const swapsElement = document.getElementById('swaps');
const timeElement = document.getElementById('time');
const algorithmInfo = document.getElementById('algorithmInfo');
const userInputSection = document.getElementById('userInputSection');
const userArrayInput = document.getElementById('userArrayInput');
const applyUserArrayBtn = document.getElementById('applyUserArrayBtn');
const tabs = document.querySelectorAll('.tab');
const textLog = document.getElementById('textLog');

// Visualization states
let array = [];
let originalArray = []; // To store the original array for reset
let arraySize = parseInt(sizeInput.value);
let animationDelay = parseInt(speedInput.value); // Animation delay now linked to speed slider
let comparisons = 0;
let swaps = 0;
let startTime = 0;
let timerInterval;
let sorting = false;
let paused = false;
let animations = [];
let animationIndex = 0;
let isRandomArray = true;

// Algorithm information with detailed complexity data
const algorithmInfoText = {
    bubble: {
        title: "Bubble Sort",
        description: "Bubble Sort is a simple comparison-based sorting algorithm. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. This process is repeated until the array is sorted.",
        bestCase: "O(n)",
        averageCase: "O(n²)",
        worstCase: "O(n²)",
        bestCaseExplanation: "The best case occurs when the array is already sorted. A flag can be used to detect this and terminate the algorithm early, resulting in linear time complexity.",
        worstCaseExplanation: "The worst case occurs when the array is sorted in reverse order, which requires the maximum number of comparisons and swaps."
    },
    selection: {
        title: "Selection Sort",
        description: "Selection Sort works by dividing the array into a sorted and unsorted region. It repeatedly finds the minimum element from the unsorted part and swaps it with the leftmost unsorted element, gradually growing the sorted portion.",
        bestCase: "O(n²)",
        averageCase: "O(n²)",
        worstCase: "O(n²)",
        bestCaseExplanation: "Selection Sort performs the same number of comparisons regardless of the initial order of the array, hence the best-case time complexity remains O(n²).",
        worstCaseExplanation: "Since the algorithm always scans the unsorted portion of the array to find the minimum element, the time complexity remains O(n²) even in the worst case."
    },
    insertion: {
        title: "Insertion Sort",
        description: "Insertion Sort builds the final sorted array one element at a time. It takes the next unsorted element and inserts it into the correct position in the already sorted part of the array.",
        bestCase: "O(n)",
        averageCase: "O(n²)",
        worstCase: "O(n²)",
        bestCaseExplanation: "The best case occurs when the array is already sorted. In this case, only one comparison is needed per element, resulting in linear time complexity.",
        worstCaseExplanation: "The worst case happens when the array is sorted in reverse order. Each new element must be compared with all sorted elements and shifted, leading to quadratic time complexity."
    },
    merge: {
        title: "Merge Sort",
        description: "Merge Sort is an efficient, stable, divide-and-conquer sorting algorithm. It divides the array into halves, recursively sorts each half, and then merges the sorted halves to produce the final sorted array.",
        bestCase: "O(n log n)",
        averageCase: "O(n log n)",
        worstCase: "O(n log n)",
        bestCaseExplanation: "Merge Sort consistently divides the array into halves and merges them in linear time. This divide-and-conquer structure leads to O(n log n) time complexity in all cases.",
        worstCaseExplanation: "Even in the worst case, Merge Sort performs O(n) merging operations at each level of recursion, with a recursion depth of log(n), resulting in O(n log n) complexity."
    },
    quick: {
        title: "Quick Sort",
        description: "Quick Sort is a highly efficient divide-and-conquer algorithm. It selects a 'pivot' element, partitions the array such that elements smaller than the pivot come before it and larger elements come after, and recursively sorts the partitions.",
        bestCase: "O(n log n)",
        averageCase: "O(n log n)",
        worstCase: "O(n²)",
        bestCaseExplanation: "The best case occurs when the pivot divides the array into two nearly equal halves in every recursion, resulting in balanced partitions and logarithmic recursion depth.",
        worstCaseExplanation: "The worst case occurs when the pivot is always the smallest or largest element, producing highly unbalanced partitions (e.g., sorted or reverse-sorted arrays), which leads to quadratic time complexity."
    }
};

// Initialize
generateArray();
updateControls();
updateAlgorithmInfo();

// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const tabName = this.getAttribute('data-tab');
        if (tabName === 'random') {
            userInputSection.classList.remove('active');
            generateArrayBtn.classList.remove('hidden');
            sizeInput.disabled = false;
            isRandomArray = true;
            generateArray();
        } else {
            userInputSection.classList.add('active');
            generateArrayBtn.classList.add('hidden');
            sizeInput.disabled = true;
            isRandomArray = false;
            
            // Clear array display when switching to custom input
            arrayContainer.innerHTML = '';
            array = [];
            originalArray = [];
            
            // Reset stats
            resetStats();
        }
    });
});

// Reset stats function
function resetStats() {
    comparisons = 0;
    swaps = 0;
    startTime = 0;
    
    comparisonsElement.textContent = '0';
    swapsElement.textContent = '0';
    timeElement.textContent = '0.00s';
}

// Event Listeners
generateArrayBtn.addEventListener('click', generateArray);
algorithmSelect.addEventListener('change', updateAlgorithmInfo);
sizeInput.addEventListener('input', function() {
    arraySize = parseInt(this.value);
    sizeValue.textContent = arraySize;
    if (isRandomArray) {
        generateArray();
    }
});

// Speed controller event listener
speedInput.addEventListener('input', function() {
    animationDelay = parseInt(this.value);
    speedValue.textContent = animationDelay;
});

sortBtn.addEventListener('click', startSort);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetVisualization);
applyUserArrayBtn.addEventListener('click', applyUserArray);

// Generate a random array
function generateArray() {
    resetVisualization();
    array = [];
    arrayContainer.innerHTML = '';
    
    for (let i = 0; i < arraySize; i++) {
        // Generate values between 5 and 100
        const value = Math.floor(Math.random() * 96) + 5;
        array.push(value);
        createNumberBox(value, i);
    }
    // Store the original array for reset
    originalArray = [...array];
}

// Apply user input array
function applyUserArray() {
    const input = userArrayInput.value.trim();
    if (!input) {
        alert("Please enter some numbers separated by commas.");
        return;
    }
    
    // Parse and validate input
    const inputArray = input.split(',').map(num => {
        return parseInt(num.trim());
    }).filter(num => !isNaN(num) && num > 0 && num <= 100);
    
    if (inputArray.length < 2) {
        alert("Please enter at least 2 valid numbers (1-100).");
        return;
    }
    
    // Clear existing array display
    resetVisualization();
    array = inputArray;
    arrayContainer.innerHTML = '';
    
    // Create number boxes for each number
    for (let i = 0; i < array.length; i++) {
        createNumberBox(array[i], i);
    }
    
    // Store the original array for reset
    originalArray = [...array];
    
    // Update the array size counter but don't adjust the slider
    // This is important to maintain visual consistency
    arraySize = inputArray.length;
}

// Create a number box
function createNumberBox(value, index) {
    const numberBox = document.createElement('div');
    numberBox.className = 'number-box';
    numberBox.setAttribute('data-value', value);
    numberBox.textContent = value;
    
    arrayContainer.appendChild(numberBox);
}

// Update algorithm information with detailed complexity
function updateAlgorithmInfo() {
    const algorithm = algorithmSelect.value;
    const info = algorithmInfoText[algorithm];
    
    const html = `
        <h3>${info.title}</h3>
        <p><strong>Approach:</strong> ${info.description}</p>
        
        <table class="complexity-table">
            <tr>
                <th>Complexity Measure</th>
                <th>Time Complexity</th>
                <th>Explanation</th>
            </tr>
            <tr>
                <td><strong>Best Case</strong></td>
                <td>${info.bestCase}</td>
                <td>${info.bestCaseExplanation}</td>
            </tr>
            <tr>
                <td><strong>Average Case</strong></td>
                <td>${info.averageCase}</td>
                <td>Typical performance across random inputs</td>
            </tr>
            <tr>
                <td><strong>Worst Case</strong></td>
                <td>${info.worstCase}</td>
                <td>${info.worstCaseExplanation}</td>
            </tr>
        </table>
    `;
    
    algorithmInfo.innerHTML = html;
}

// Update control buttons
function updateControls() {
    sortBtn.disabled = sorting || array.length === 0;
    generateArrayBtn.disabled = sorting || !isRandomArray;
    algorithmSelect.disabled = sorting;
    sizeInput.disabled = sorting || !isRandomArray;
    speedInput.disabled = sorting; // Disable speed control during sorting
    pauseBtn.disabled = !sorting;
    resetBtn.disabled = !sorting && array.length === 0;
    userArrayInput.disabled = sorting;
    applyUserArrayBtn.disabled = sorting;
    tabs.forEach(tab => tab.style.pointerEvents = sorting ? 'none' : 'auto');
}

// Reset visualization - return to original array state
function resetVisualization() {
    if (timerInterval) clearInterval(timerInterval);
    sorting = false;
    paused = false;
    comparisons = 0;
    swaps = 0;
    animations = [];
    animationIndex = 0;
    startTime = 0;
    
    comparisonsElement.textContent = '0';
    swapsElement.textContent = '0';
    timeElement.textContent = '0.00s';
    
    // Reset to original array if it exists
    if (originalArray.length > 0) {
        array = [...originalArray];
        
        // Recreate all number boxes with original values
        arrayContainer.innerHTML = '';
        for (let i = 0; i < array.length; i++) {
            createNumberBox(array[i], i);
        }
    }
    
    updateControls();
}

// Start sorting
function startSort() {
    if (sorting && !paused) return;
    if (array.length === 0) return;
    
    if (!sorting) {
        // Only reset if we're starting a new sort
        if (animationIndex >= animations.length) {
            resetVisualization();
        }
        
        sorting = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 10);
        
        // Only generate animations if we don't already have them
        if (animations.length === 0) {
            const algorithm = algorithmSelect.value;
            switch (algorithm) {
                case 'bubble': bubbleSort(); break;
                case 'selection': selectionSort(); break;
                case 'insertion': insertionSort(); break;
                case 'merge': mergeSort(); break;
                case 'quick': quickSort(); break;
            }
        }
    }
    
    paused = false;
    pauseBtn.textContent = 'Pause';
    processAnimations();
    updateControls();
}

// Toggle pause/resume
function togglePause() {
    if (!sorting) return;
    
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    
    if (!paused) {
        processAnimations();
    }
}

// Update timer
function updateTimer() {
    if (!sorting || paused) return;
    
    const elapsed = (Date.now() - startTime) / 1000;
    timeElement.textContent = elapsed.toFixed(2) + 's';
}

// Process animations
function processAnimations() {
    if (!sorting || paused || animationIndex >= animations.length) {
        if (animationIndex >= animations.length && sorting) {
            finishSorting();
        }
        return;
    }
    
    const animation = animations[animationIndex++];
    const numberBoxes = arrayContainer.querySelectorAll('.number-box');
    
    switch (animation.type) {
        case 'compare':
            updateComparisons();
            numberBoxes[animation.indices[0]].classList.add('comparing');
            numberBoxes[animation.indices[1]].classList.add('comparing');
            
            setTimeout(() => {
                if (!paused) {
                    numberBoxes[animation.indices[0]].classList.remove('comparing');
                    numberBoxes[animation.indices[1]].classList.remove('comparing');
                    processAnimations();
                }
            }, animationDelay);
            break;
            
        case 'swap':
            updateSwaps();
            // Update the actual boxes with new values
            const temp = numberBoxes[animation.indices[0]].textContent;
            numberBoxes[animation.indices[0]].textContent = numberBoxes[animation.indices[1]].textContent;
            numberBoxes[animation.indices[1]].textContent = temp;
            
            // Update data-value attribute
            const tempValue = numberBoxes[animation.indices[0]].getAttribute('data-value');
            numberBoxes[animation.indices[0]].setAttribute('data-value', numberBoxes[animation.indices[1]].getAttribute('data-value'));
            numberBoxes[animation.indices[1]].setAttribute('data-value', tempValue);
            
            setTimeout(() => {
                if (!paused) {
                    processAnimations();
                }
            }, animationDelay);
            break;
            
        case 'overwrite':
            numberBoxes[animation.index].textContent = animation.value;
            numberBoxes[animation.index].setAttribute('data-value', animation.value);
            
            setTimeout(() => {
                if (!paused) {
                    processAnimations();
                }
            }, animationDelay);
            break;
            
        case 'highlight':
            numberBoxes[animation.index].classList.add(animation.color === 'linear-gradient(to top, var(--sorted), #a8e063)' ? 'sorted' : 'current');
            
            setTimeout(() => {
                if (!paused) {
                    processAnimations();
                }
            }, animationDelay);
            break;
            
        case 'reset-color':
            numberBoxes[animation.index].classList.remove('comparing', 'current', 'sorted');
            
            setTimeout(() => {
                if (!paused) {
                    processAnimations();
                }
            }, animationDelay);
            break;
    }
}

// Update counters
function updateComparisons() {
    comparisons++;
    comparisonsElement.textContent = comparisons;
}

function updateSwaps() {
    swaps++;
    swapsElement.textContent = swaps;
}

// Finish sorting
function finishSorting() {
    if (timerInterval) clearInterval(timerInterval);
    sorting = false;
    
    // Highlight all boxes to indicate completion
    const numberBoxes = arrayContainer.querySelectorAll('.number-box');
    for (let i = 0; i < numberBoxes.length; i++) {
        setTimeout(() => {
            numberBoxes[i].classList.add('sorted');
        }, i * 10);
    }
    
    updateControls();
}

// SORTING ALGORITHMS

// Bubble Sort
function bubbleSort() {
    const arrayCopy = [...array];
    
    for (let i = 0; i < arrayCopy.length; i++) {
        for (let j = 0; j < arrayCopy.length - i - 1; j++) {
            animations.push({ type: 'compare', indices: [j, j + 1] });
            
            if (arrayCopy[j] > arrayCopy[j + 1]) {
                animations.push({ type: 'swap', indices: [j, j + 1] });
                
                // Swap in the array copy
                const temp = arrayCopy[j];
                arrayCopy[j] = arrayCopy[j + 1];
                arrayCopy[j + 1] = temp;
            }
        }
        
        // Mark the last element of this pass as sorted
        animations.push({ type: 'highlight', index: arrayCopy.length - i - 1, color: 'linear-gradient(to top, var(--sorted), #a8e063)' });
    }
}

// Selection Sort
function selectionSort() {
    const arrayCopy = [...array];
    
    for (let i = 0; i < arrayCopy.length - 1; i++) {
        let minIndex = i;
        
        // Mark current position
        animations.push({ type: 'highlight', index: i, color: 'orange' });
        
        // Find the minimum element in the unsorted part
        for (let j = i + 1; j < arrayCopy.length; j++) {
            animations.push({ type: 'compare', indices: [minIndex, j] });
            
            if (arrayCopy[j] < arrayCopy[minIndex]) {
                // Reset previous min highlight if not the starting position
                if (minIndex !== i) {
                    animations.push({ type: 'reset-color', index: minIndex });
                }
                
                minIndex = j;
                animations.push({ type: 'highlight', index: minIndex, color: 'orange' });
            }
        }
        
        // Swap the found minimum element with the first element of unsorted part
        if (minIndex !== i) {
            animations.push({ type: 'swap', indices: [i, minIndex] });
            
            // Swap in the array copy
            const temp = arrayCopy[i];
            arrayCopy[i] = arrayCopy[minIndex];
            arrayCopy[minIndex] = temp;
            
            // Reset the min index highlight
            animations.push({ type: 'reset-color', index: minIndex });
        }
        
        // Mark the position as sorted
        animations.push({ type: 'highlight', index: i, color: 'linear-gradient(to top, var(--sorted), #a8e063)' });
    }
    
    // Mark the last element as sorted (it's automatically in the right place)
    animations.push({ type: 'highlight', index: arrayCopy.length - 1, color: 'linear-gradient(to top, var(--sorted), #a8e063)' });
}

let swapCount = 0;

function insertionSort() {
    const arrayCopy = [...array];
    
    animations.push({ type: 'highlight', index: 0, color: 'linear-gradient(to top, var(--sorted), #a8e063)' });

    for (let i = 1; i < arrayCopy.length; i++) {
        const key = arrayCopy[i];
        let j = i - 1;

        animations.push({ type: 'highlight', index: i, color: 'orange' });

        while (j >= 0) {
            animations.push({ type: 'compare', indices: [j, j + 1] });

            if (arrayCopy[j] > key) {
                animations.push({ type: 'overwrite', index: j + 1, value: arrayCopy[j] });
                arrayCopy[j + 1] = arrayCopy[j];
                j--;

                swapCount++; // Count each shift as a swap
            } else {
                break;
            }
        }

        animations.push({ type: 'overwrite', index: j + 1, value: key });
        arrayCopy[j + 1] = key;

        swapCount++; // Count inserting the key as a swap

        animations.push({ type: 'reset-color', index: i });

        for (let k = 0; k <= i; k++) {
            animations.push({ type: 'highlight', index: k, color: 'linear-gradient(to top, var(--sorted), #a8e063)' });
        }
    }

    console.log("Total swaps:", swapCount);
}

// Merge Sort
function mergeSort() {
    const arrayCopy = [...array];
    
    // Main merge sort function
    function mergeSortHelper(array, start, end) {
        if (start >= end) return;
        
        const mid = Math.floor((start + end) / 2);
        
        // Sort first and second halves
        mergeSortHelper(array, start, mid);
        mergeSortHelper(array, mid + 1, end);
        
        // Merge the sorted halves
        merge(array, start, mid, end);
    }
    
    // Merge function
    function merge(array, start, mid, end) {
        const leftSize = mid - start + 1;
        const rightSize = end - mid;
        
        // Create temp arrays
        const leftArray = new Array(leftSize);
        const rightArray = new Array(rightSize);
        
        // Copy data to temp arrays
        for (let i = 0; i < leftSize; i++) {
            leftArray[i] = array[start + i];
        }
        for (let j = 0; j < rightSize; j++) {
            rightArray[j] = array[mid + 1 + j];
        }
        
        // Merge the temp arrays back into the main array
        let i = 0; // Initial index of first subarray
        let j = 0; // Initial index of second subarray
        let k = start; // Initial index of merged subarray
        
        while (i < leftSize && j < rightSize) {
            // Compare elements from both arrays
            animations.push({ type: 'compare', indices: [start + i, mid + 1 + j] });
            
            if (leftArray[i] <= rightArray[j]) {
                // Overwrite value at k with leftArray[i]
                animations.push({ type: 'overwrite', index: k, value: leftArray[i] });
                array[k] = leftArray[i];
                i++;
            } else {
                // Overwrite value at k with rightArray[j]
                animations.push({ type: 'overwrite', index: k, value: rightArray[j] });
                array[k] = rightArray[j];
                j++;
            }
            k++;
        }
        
        // Copy the remaining elements of leftArray, if any
        while (i < leftSize) {
            animations.push({ type: 'overwrite', index: k, value: leftArray[i] });
            array[k] = leftArray[i];
            i++;
            k++;
        }
        
        // Copy the remaining elements of rightArray, if any
        while (j < rightSize) {
            animations.push({ type: 'overwrite', index: k, value: rightArray[j] });
            array[k] = rightArray[j];
            j++;
            k++;
        }
    }
    
    // Start the merge sort
    mergeSortHelper(arrayCopy, 0, arrayCopy.length - 1);
    
    // Highlight all elements as sorted when complete
    for (let i = 0; i < arrayCopy.length; i++) {
        animations.push({ type: 'highlight', index: i, color: 'linear-gradient(to top, var(--sorted), #a8e063)' });
    }
}

// Quick Sort
function quickSort() {
    const arrayCopy = [...array];
    
    // Main quicksort function
    function quickSortHelper(array, low, high) {
        if (low < high) {
            // Find the partition index
            const partitionIndex = partition(array, low, high);
            
            // Sort elements before and after partition
            quickSortHelper(array, low, partitionIndex - 1);
            quickSortHelper(array, partitionIndex + 1, high);
        }
    }
    
    // Partition function
    function partition(array, low, high) {
        // Choose the rightmost element as pivot
        const pivot = array[high];
        
        // Highlight pivot
        animations.push({ type: 'highlight', index: high, color: 'orange' });
        
        let i = low - 1; // Index of smaller element
        
        for (let j = low; j < high; j++) {
            // Compare current element with pivot
            animations.push({ type: 'compare', indices: [j, high] });
            
            if (array[j] <= pivot) {
                i++;
                
                // Swap elements
                if (i !== j) {
                    animations.push({ type: 'swap', indices: [i, j] });
                    
                    // Swap in the array
                    const temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }
        }
        
        // Swap pivot to its correct position
        if (i + 1 !== high) {
            animations.push({ type: 'swap', indices: [i + 1, high] });
            
            // Swap in the array
            const temp = array[i + 1];
            array[i + 1] = array[high];
            array[high] = temp;
        }
        
        // Mark pivot as sorted
        animations.push({ type: 'highlight', index: i + 1, color: 'linear-gradient(to top, var(--sorted), #a8e063)' });
        
        // Reset pivot highlight
        animations.push({ type: 'reset-color', index: high });
        
        return i + 1;
    }
    
    // Start the quick sort
    quickSortHelper(arrayCopy, 0, arrayCopy.length - 1);
    
    // Highlight all elements as sorted when complete
    for (let i = 0; i < arrayCopy.length; i++) {
        if (!document.querySelectorAll('.number-box')[i].classList.contains('sorted')) {
            animations.push({ type: 'highlight', index: i, color: 'linear-gradient(to top, var(--sorted), #a8e063)' });
        }
    }
}

// Add log entry to text log
function addLogEntry(message, type) {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type || ''}`;
    logEntry.textContent = message;
    
    // Remove empty placeholder if it exists
    const emptyPlaceholder = textLog.querySelector('.log-empty');
    if (emptyPlaceholder) {
        textLog.removeChild(emptyPlaceholder);
    }
    
    textLog.appendChild(logEntry);
    textLog.scrollTop = textLog.scrollHeight; // Auto-scroll to bottom
}

// Clear the text log
function clearTextLog() {
    textLog.innerHTML = '<p class="log-empty">Sorting steps will appear here once you start sorting...</p>';
}

function resetVisualization() {
    if (timerInterval) clearInterval(timerInterval);
    sorting = false;
    paused = false;
    comparisons = 0;
    swaps = 0;
    animations = [];
    animationIndex = 0;
    startTime = 0;
    
    comparisonsElement.textContent = '0';
    swapsElement.textContent = '0';
    timeElement.textContent = '0.00s';
    
    // Clear the text log
    clearTextLog();
    
    // Reset to original array if it exists
    if (originalArray.length > 0) {
        array = [...originalArray];
        
        // Recreate all number boxes with original values
        arrayContainer.innerHTML = '';
        for (let i = 0; i < array.length; i++) {
            createNumberBox(array[i], i);
        }
    }
    
    updateControls();
}

function processAnimations() {
    if (!sorting || paused || animationIndex >= animations.length) {
        if (animationIndex >= animations.length && sorting) {
            finishSorting();
        }
        return;
    }
    
    const animation = animations[animationIndex++];
    const numberBoxes = arrayContainer.querySelectorAll('.number-box');
    
    switch (animation.type) {
        case 'compare':
            updateComparisons();
            numberBoxes[animation.indices[0]].classList.add('comparing');
            numberBoxes[animation.indices[1]].classList.add('comparing');
            
            // Add log entry for comparison
            addLogEntry(`Comparing: ${numberBoxes[animation.indices[0]].textContent} and ${numberBoxes[animation.indices[1]].textContent}`, 'compare');
            
            setTimeout(() => {
                if (!paused) {
                    numberBoxes[animation.indices[0]].classList.remove('comparing');
                    numberBoxes[animation.indices[1]].classList.remove('comparing');
                    processAnimations();
                }
            }, animationDelay);
            break;
            
        case 'swap':
            updateSwaps();
            // Log before swap
            const val1 = numberBoxes[animation.indices[0]].textContent;
            const val2 = numberBoxes[animation.indices[1]].textContent;
            addLogEntry(`Swapping: ${val1} and ${val2}`, 'swap');
            
            // Update the actual boxes with new values
            const temp = numberBoxes[animation.indices[0]].textContent;
            numberBoxes[animation.indices[0]].textContent = numberBoxes[animation.indices[1]].textContent;
            numberBoxes[animation.indices[1]].textContent = temp;
            
            // Update data-value attribute
            const tempValue = numberBoxes[animation.indices[0]].getAttribute('data-value');
            numberBoxes[animation.indices[0]].setAttribute('data-value', numberBoxes[animation.indices[1]].getAttribute('data-value'));
            numberBoxes[animation.indices[1]].setAttribute('data-value', tempValue);
            
            setTimeout(() => {
                if (!paused) {
                    processAnimations();
                }
            }, animationDelay);
            break;
            
        case 'overwrite':
            const oldValue = numberBoxes[animation.index].textContent;
            numberBoxes[animation.index].textContent = animation.value;
            numberBoxes[animation.index].setAttribute('data-value', animation.value);
            
            // Add log entry for overwrite
            addLogEntry(`Placing: ${animation.value} at position ${animation.index+1} (was ${oldValue})`, 'swap');
            
            setTimeout(() => {
                if (!paused) {
                    processAnimations();
                }
            }, animationDelay);
            break;
            
        case 'highlight':
            numberBoxes[animation.index].classList.add(animation.color === 'linear-gradient(to top, var(--sorted), #a8e063)' ? 'sorted' : 'current');
            
            // Add log entry for marking an element as sorted
            if (animation.color === 'linear-gradient(to top, var(--sorted), #a8e063)') {
                addLogEntry(`Element ${numberBoxes[animation.index].textContent} is now in its sorted position`, 'highlight');
            } else {
                addLogEntry(`Selecting ${numberBoxes[animation.index].textContent} as current element`, 'current');
            }
            
            setTimeout(() => {
                if (!paused) {
                    processAnimations();
                }
            }, animationDelay);
            break;
            
        case 'reset-color':
            numberBoxes[animation.index].classList.remove('comparing', 'current', 'sorted');
            
            setTimeout(() => {
                if (!paused) {
                    processAnimations();
                }
            }, animationDelay);
            break;
    }
}

function finishSorting() {
    if (timerInterval) clearInterval(timerInterval);
    sorting = false;
    
    // Add completion log entry
    addLogEntry(`Sorting complete! Array is now sorted.`, 'highlight');
    
    // Highlight all boxes to indicate completion
    const numberBoxes = arrayContainer.querySelectorAll('.number-box');
    for (let i = 0; i < numberBoxes.length; i++) {
        setTimeout(() => {
            numberBoxes[i].classList.add('sorted');
        }, i * 10);
    }
    
    updateControls();
}