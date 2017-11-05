
export const SchemaHelpers = {
  /**
   * Helper to automatically record the date a doc is created
   * @returns Date
   */
  autoValueDateCreated() {
    // only update the value on insert and upsert
    if(this.isInsert){
      return new Date;
    } else if (this.isUpsert) {
      return { $setOnInsert: new Date };
    }
  },
  
  /**
   * Helper to automatically record the date a doc is modified
   * @returns Date
   */
  autoValueDateModified() {
    if(this.operator !== '$pull'){
      return new Date;
    }
  },
  
  /**
   * Helper to automatically record the user creating a record
   * @returns Investigator
   */
  autoValueCreatedBy() {
    if(this.userId){
      // Check if the value is already set, and respect it if it s
      if(this.isInsert){
        return this.userId;
      } else if (this.isUpsert) {
        return { $setOnInsert: this.userId };
      }
    }
  },
  
  /**
   * Helper to automatically record the user modifying a record
   * @returns Investigator
   */
  autoValueModifiedBy() {
    if(this.userId && this.operator !== '$pull'){
      return this.userId;
    }
  },
  
};