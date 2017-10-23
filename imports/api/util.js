
export const Util = {
  /**
   * Return a timestamp string
   */
  timestamp(){
    return moment().format('hh:mm:ss.SSS')
  },
  
  /**
   * Convert words to Title Case
   * @param words
   * @return {*}
   */
  titleCase(words){
    return words.replace(/([A-Z])/g, ' $1').split(/[^a-z0-9]/i).map((word) => { return word.substr(0, 1).toUpperCase() + word.substr(1) }).join(' ').trim()
  },
  
  /**
   * Capitalize a string
   * @param word The string to capitalize
   */
  capitalize(word) {
    if (word) {
      return word.substr(0, 1).toUpperCase() + word.substr(1);
    }
    return word;
  },
  
  /**
   * Convert camel case to title case
   * @param word
   */
  camelToTitle(word) {
    if (word) {
      return (word.substr(0, 1).toUpperCase() + word.substr(1)).replace(/([A-Z])/g, " $1").trim();
    }
  },
  
  /**
   * Convert camel case to dashed words
   * @param word
   */
  camelToDash(word) {
    if (word) {
      return word.replace(/([A-Z])/g, "-$1").trim().toLowerCase();
    }
  },
  
  /**
   * Convert words to a CamelCase string
   * @param words
   */
  wordsToCamel(words) {
    if (words) {
      return words.replace(/[\W]/g, " ")
          .replace(/(^[a-z]|\s+[a-z])/g, (letter) => {
            return letter.trim().toUpperCase()
          })
          .replace(/\s/g, "");
    }
  },
};
