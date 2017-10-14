
export const Util = {
  /**
   * Return a timestamp string
   */
  timestamp(){
    return moment().format('hh:mm:ss.SSS')
  },
  
  /**
   * Convert words to titleCase
   * @param words
   * @return {*}
   */
  titleCase(words){
    return words.replace(/([A-Z])/g, ' $1').split(/[^a-z0-9]/i).map((word) => { return word.substr(0, 1).toUpperCase() + word.substr(1) }).join(' ').trim()
  }
};
