/* A preprocessing function I used to generate the PREFIXES tree, out of the list of words in words.json

The list of words itself is adapted from http://www.wordfrequency.info/
*/
function preparePrefixes() {
    $.getJSON('words.json').then(function(words) {
        // The tree to be created
        let prefixes = {};

        // We go over all of the words and create the full nested structure for that word
        for (word of words) {
            let currentPrefix = prefixes;
            for (letter of word.split('')) {
                // If a level for specific letter didn't exist until now, initialise it to an empty object
                if (!currentPrefix.hasOwnProperty(letter)) {
                    currentPrefix[letter] = {};
                }
                // Go to the next level
                currentPrefix = currentPrefix[letter];
            }

            // Add the word itself, so we can distinguish between full words and prefixes
            currentPrefix.word = word;
        }

        // I created prefixes.js based from this output
        console.log(prefixes);
    })
}
