// DOM manipulation functions:
function resetToValid() {
    $('#wordinput').removeClass('invalid');
    $('#suggestion').text('');
}

function showSuggestion(badWord, suggestion) {
    $('#wordinput').addClass('invalid');
    $('#suggestion').text(`${badWord} is not in the dictionary, did you mean ${suggestion}?`);
}


// Logic functions:
/* The main event handler, which splits the input into words, sends each to be checked and calls the DOM manipulation functions */
function spellCheckInput() {
    let words = $('#wordinput').val().toLowerCase().split(' ');

    // Check all the words that have been fully typed, and must be in the dictionary
    let completeWords = words.slice(0, -1);
    for (word of completeWords) {
        let spelling = checkWord(word);
        if (!spelling.valid) {
            showSuggestion(word, spelling.suggestion);
            return;
        }
    }

    // Check the last word, that is possibly still being typed, and just needs to conform to a prefix
    let lastWord = words.slice(-1)[0];
    let spelling = checkWord(lastWord, /*isPartial*/ true);
    if (!spelling.valid) {
        showSuggestion(lastWord, spelling.suggestion);
        return;
    }

    // If we haven't returned out of the function by now, then all the words are good, and we reset the suggestion
    resetToValid();
}

/* Check whether a particular word is valid */
function checkWord(word, isPartial) {
    /* This PREFIXES constant defined in prefixes.js is the secret sauce.
       It's a prefix tree (nested object) of letters for all the valid words in our dictionary (most common 5000 words).
       To make the algorithm here more concise, in addition to the letters, the tree also contains a "word" property for each valid word.
       The preprocessing code used to generate this tree out of the list of words is in preparePrefixes.js
    */
    let currentPrefix = PREFIXES;

    // Go through the prefix tree for each letter of the word
    for (letter of word.split('')) {
        // Peek at the next level of the tree
        let nextPrefix = currentPrefix[letter];
        if (nextPrefix) {
            // If the next level exists, continue the loop and go deeper
            currentPrefix = nextPrefix;
        } else {
            // If we can't go deeper, but still have letters in the word, the word is invalid
            return {valid: false, suggestion: findSuggestion(currentPrefix)};
        }
    }

    // We need special handling of complete words, such that if a word is not partial, the prefix must be a valid word in itself
    if (isPartial || currentPrefix.word) {
        return {valid: true};
    } else {
        return {valid: false, suggestion: findSuggestion(currentPrefix)};
    }
}

/* Find a suggested word, based on just the last valid prefix, before the typo.
   Rather than spending time on this, I tried to go for the simplest possible suggestion.
*/
function findSuggestion(prefix) {
    // Take the first word we can find (in no particular order), that has the same prefix as the typed word
    while (!prefix.word) {
        // As long as the current prefix is not a valid word, go to the first deeper prefix you see
        prefix = Object.values(prefix)[0]
    }
    return prefix.word;
}
