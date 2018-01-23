export class CapacityPlanSprintModel {
  constructor (option, sprintId) {
    let sprintData = option.sprints || [];
    
    this.option       = option;
    this.sprintId     = sprintId;
    this.data         = sprintData.find((sprint) => {
      return sprint.id === sprintId
    }) || {};
    this.data.efforts = this.data.efforts || [];
  }
  
  addEffort (effortId) {
    this.data.efforts.push(effortId)
  }
  
  getData () {
    return this.data
  }
  
  getUpdate () {
    let update = { data: {} },
    sprintIndex = ;
    
    update.data[ 'sprint-' + this.sprintId ] = this.getData();
    return update;
  }
}