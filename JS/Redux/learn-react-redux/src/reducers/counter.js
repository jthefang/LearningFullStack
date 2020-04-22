//REDUCER
const counterReducer = (state = 0, action) => { //initial state = 0
  switch(action.type) {
    case "INCREMENT":
      return state + action.payload;
    case "DECREMENT":
      return state - 1;
    default: 
      return state;
  }
}

export default counterReducer;