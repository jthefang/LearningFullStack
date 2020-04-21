# react-beautiful-dnd

- [react-beautiful-dnd](#react-beautiful-dnd)
  - [Styling `Draggable`/`Droppable` components during a drag](#styling-draggabledroppable-components-during-a-drag)
  - [Add drag handle](#add-drag-handle)
  - [Multiple Droppable columns](#multiple-droppable-columns)
  - [Conditionally Allow DnD movement](#conditionally-allow-dnd-movement)
  - [Reorderable horizontal lists](#reorderable-horizontal-lists)
  - [Reorderable (draggable) columns](#reorderable-draggable-columns)
  - [Performance optimization](#performance-optimization)

- See [docs](https://github.com/atlassian/react-beautiful-dnd)
![beautiful dnd components](./images/components.gif)
- `DragDropContext` component will wrap part of app that will have DnD (drag and drop) enabled
  - `Droppable` component = region that we can drop elements into
  - `Draggable` component that can be dragged and dropped into Droppables
- `DragDropContext` has 3 callback properties
  - `onDragStart, onDragUpdate, onDragEnd`: called when a `Draggable` is first dragged, when its position is updated, and when it's dropped 
  - the only required property is `onDragEnd` (should synchronously update app state to reflect the DnD result)
- `Droppable` 
  - 1 required prop = `droppableId` (needs to be unique within the `DragDropContext`)
  - uses **render props pattern** => *expects child to be a function that returns a React component*
    - function has a `provided` parameter
    - `provided.droppableProps` must be applied on the component you want to *designate as your `Droppable`*
    - `provided.innerRef` = function used to supply DOM node of your `Droppable` component to react-dnd (assign it to styled component's `innerRef` prop)
    - `provided.placeholder` = component that will increase space in `Droppable` component when it's needed (i.e. when a new item is dropped in)
      - must be added as child of component that you designated as the `Droppable`
- `Draggable`
  - 2 required props: `draggableId` and `index`
  - also uses render props pattern
    - `provided.draggableProps` need to be applied on the component that we want to be `Draggable` in response to user input
    - `provided.dragHandleProps` need to be applied to the part of the `Draggable` component that we want to control the drag action
    - also do `innerRef={provided.innerRef} ref={provided.innerRef}`
- `OnDragEnd`
  - `result` parameter is structured like:
```js
const result = {
  draggableId: 'task-1',
  type: 'TYPE',
  reason: 'DROP',
  source: { //source Droppable
    droppableId: 'column-1',
    index: 0, //which index in source Droppable
  },
  destination: { //dest Droppable (could be null if dropped outside of list)
    droppableId: 'column-1',
    index: 1,
  },
}
```

## Styling `Draggable`/`Droppable` components during a drag

- Make sure you don't change the dimensions of your `Droppable` components during a drag
- Optional `snapshot` parameter will be helpful for styling
```js
const draggableSnapshot = {
  isDragging: true, //if draggable is currently being dragged
  draggingOver: 'column-1', //id of droppable that draggable is dragging over (null if not over a droppable)
}
const droppableSnapshot = {
  isDraggingOver: true, //if a draggable is being dragged over the droppable
  draggingOverWith: 'task-1', //id of draggable being dragged over the droppable (null otherwise)
}

//e.g.
const TaskList = styled.div`
  padding: 8px;
  background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')};
`; //turn droppable skyblue if a draggable is being dragged over it 

<TaskList 
  innerRef={provided.innerRef}
  ref={provided.innerRef}
  {...provided.droppableProps}
  isDraggingOver={snapshot.isDraggingOver}
> ...
```
- `OnDragStart and `OnDragUpdate` has parameters:
```js 
// onDragStart
const start = {
  draggableId: 'task-1',
  type: 'TYPE',
  source: { //source Droppable
    droppableId: 'column-1',
    index: 0, //which index in source Droppable
  },
}; 

// onDragUpdate
const update = {
  ...start,
  destination: { //curr Droppable that we're over (could be null if over nothing)
    droppableId: 'column-1',
    index: 1,
  },
}

// onDragEnd
const result = {
  ...update,
  reason: 'DROP',
}
```

## Add drag handle

- can isolate the handle / drag-control into a small sub-component of the `Draggable`
```js
const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${props => (props.isDragging ? 'lightgreen' : 'white')}; 

  display: flex; /* for handle */
`;

const Handle = styled.div` /* This will be the drag handle */
  width: 20px;
  height: 20px;
  background-color: orange;
  border-radius: 4px;
  margin-right: 8px;
`;

export default class Task extends Component {
  render() {
    return (
      <Draggable draggableId={this.props.task.id} index={this.props.index}>
        {(provided, snapshot) => (
          <Container
            {...provided.draggableProps}  
            //{...provided.dragHandleProps}
            innerRef={provided.innerRef}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
          >
            <Handle {...provided.dragHandleProps} /> 
            {this.props.task.content}
          </Container>
        )}
      </Draggable>
    )
  }
}
```

## Multiple Droppable columns

- Add more columns in your data
- Add styling
- Update `onDragEnd` to account for new columns
```js
//More columns
const initialData = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Take out the garbage' },
    'task-2': { id: 'task-2', content: 'Watch my favorite show' },
    'task-3': { id: 'task-3', content: 'Charge my phone' },
    'task-4': { id: 'task-4', content: 'Cook dinner' },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To do',
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In progress',
      taskIds: [],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: [],
    },
  },
  //facilitate reording of the cols
  columnOrder: ['column-1', 'column-2', 'column-3'],
}

export default initialData;
```
```js
// flex styling for multiple columns
const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 220px;

  display: flex; /* Align task list vertically */
  flex-direction: column; 
`;
const Title = styled.h3`
  padding: 8px;
`;
const TaskList = styled.div`
  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')};
  flex-grow: 1; /* have task list fill up vertical space */
  min-height: 100px; /* column will always have a height to drop things in */
`;

export default class column extends Component {
  render() {
    return (
      <Container>
        <Title>{this.props.column.title}</Title>
        <Droppable droppableId={this.props.column.id}>
          {(provided, snapshot) => (
            <TaskList 
              innerRef={provided.innerRef}
              ref={provided.innerRef}
              {...provided.droppableProps}
              isDraggingOver={snapshot.isDraggingOver}
            >
              {this.props.tasks.map((task, index) => <Task key={task.id} task={task} index={index} />)}
              {provided.placeholder}
            </TaskList>
          )}
        </Droppable>
      </Container>
    );
  }
}
```
```js
// Code to handle dragging from within and between columns
onDragEnd = result => {
  document.body.style.color = 'inherit';
  document.body.style.backgroundColor = 'inherit';

  const { destination, source, draggableId } = result;
  if (!destination) {
    return;
  }

  const sameLocation = destination.droppableId === source.droppableId && destination.index === source.index;
  if (sameLocation) {
    return;
  }

  // reorder our draggable items
  const startCol = this.state.columns[source.droppableId];
  const finishCol = this.state.columns[destination.droppableId];

  if (startCol === finishCol) { //reorder within column
    const newTaskIds = Array.from(startCol.taskIds); //don't mutate existing state yet
    newTaskIds.splice(source.index, 1); //remove 1 item from task list at source idx
    newTaskIds.splice(destination.index, 0, draggableId); //insert draggableId

    const newColumn = {
      ...startCol,
      taskIds: newTaskIds,
    };

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newColumn.id]: newColumn,
      }
    };

    this.setState(newState);
    return;
  }

  //moving from one list to another
  const startTaskIds = Array.from(startCol.taskIds);
  startTaskIds.splice(source.index, 1); //remove from source col
  const newStart =  {
    ...startCol,
    taskIds: startTaskIds,
  };

  const finishTaskIds = Array.from(finishCol.taskIds);
  finishTaskIds.splice(destination.index, 0, draggableId); //add to dest col
  const newFinish = {
    ...finishCol,
    taskIds: finishTaskIds,
  };
  const newState = {
    ...this.state,
    columns: {
      ...this.state.columns,
      [newStart.id]: newStart,
      [newFinish.id]: newFinish,
    }
  };
  this.setState(newState);
}
```

## Conditionally Allow DnD movement

- Use `isDragDisabled` prop on `Draggable` to disable it (it won't be able to be dragged, but can still be reordered)
  - Here we also style disabled `Draggable`'s with a `lightgrey` background
```js
const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${props => 
    props.isDragDisabled 
      ? 'lightgrey'
      : props.isDragging 
        ? 'lightgreen' 
        : 'white'}; 
`;

export default class Task extends Component {
  render() {
    const isDragDisabled = this.props.task.id === 'task-1';
    return (
      <Draggable 
        draggableId={this.props.task.id} 
        index={this.props.index}
        isDragDisabled={isDragDisabled}
      >
        {(provided, snapshot) => (
          <Container
            {...provided.draggableProps}  
            {...provided.dragHandleProps}
            innerRef={provided.innerRef}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
            isDragDisabled={isDragDisabled}
          >
            {this.props.task.content}
          </Container>
        )}
      </Draggable>
    )
  }
}
```
- You can optionally restrict which `Droppable` components `Draggable`s can be dropped in using the `type` prop on `Droppable`
  - only `Draggable`s with the matching type can be dropped in the `Droppable`
```js
<Droppable 
  droppableId={this.props.column.id} 
  type={this.props.column.id === 'column-3' ? 'done' : 'active'} 
>
```
- `isDropDisabled` on `Droppable` components will disable them from accepting and `Draggable`s
  - e.g. to only allow dragging of items to rightwards columns:
```js
class App extends React.Component {
  state = initialData;

  onDragStart = start => {
    const homeIndex = this.state.columnOrder.indexOf(start.source.droppableId);

    this.setState({
      homeIndex,
    });
  }

  onDragEnd = result => {
    this.setState({ homeIndex: null });
    ...
  }

  render() {
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
      >
        <Container>
          {this.state.columnOrder.map((columnId, index) => {
            const column = this.state.columns[columnId];
            const tasks = column.taskIds.map(taskId => this.state.tasks[taskId]);

            const isDropDisabled = index < this.state.homeIndex; //only allow dragging to the "right" (to higher indexed cols)

            return (
              <Column
                key={column.id}
                column={column}
                tasks={tasks}
                isDropDisabled={isDropDisabled}
              />
            );
          })}
        </Container>
      </DragDropContext>
    )
  }
}
...
```
```js
<Droppable 
  droppableId={this.props.column.id} 
  isDropDisabled={this.props.isDropDisabled}
>
```

## Reorderable horizontal lists

- Do some flexbox styling to get horizontally aranged `Draggable`s
- Change `direction="horizontal"` on the `Droppable` 
```js
// On draggables
const Container = styled.div`
  ...
  /* for horiziontal tasks */
  margin-right: 8px; 
  /* center text */
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    outline: none;
    border-color: red;
  }
`;
...
```
```js
const TaskList = styled.div`
  ...
  display: flex; /* for horizontal task list */
`;

export default class column extends Component {
  render() {
    return (
      <Container>
        <Title>{this.props.column.title}</Title>
        <Droppable 
          droppableId={this.props.column.id} 
          direction="horizontal" //<------------ this line
        >
          {(provided, snapshot) => (
            <TaskList 
              innerRef={provided.innerRef}
              ref={provided.innerRef}
              {...provided.droppableProps}
              isDraggingOver={snapshot.isDraggingOver}
            >
              {this.props.tasks.map((task, index) => <Task key={task.id} task={task} index={index} />)}
              {provided.placeholder}
            </TaskList>
          )}
        </Droppable>
      </Container>
    );
  }
}
```

## Reorderable (draggable) columns

- Have parent `Droppable` columns be also `Draggable`s themselves
- `Droppable` container (horizontally ordered)
  - `Draggable` columns
    - Each draggable column has a `Droppable` (vertically ordered) which will contain:
      - `Draggable` items within the column
- Remember to add the appropriate props to make a component `Droppable` or `Draggable`
- Update the same `onDragEnd` function you were using before to handle reordering of columns
```js
// The droppable container (horizontally ordered)
class App extends React.Component {
  onDragEnd = result => {
    ...
    //reordering columns
    if (type === 'column') {
      const newColumnOrder = Array.from(this.state.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newState = {
        ...this.state,
        columnOrder: newColumnOrder,
      }
      this.setState(newState);
      return;
    }
    ...
  }

  render() {
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {provided => (
            <Container
              {...provided.droppableProps} //<-------------- Don't forget this
              innerRef={provided.innerRef}
              ref={provided.innerRef}
            >
              ...
              {provided.placeholder} //<-------------- Don't forget this
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    )
  }
}
```
```js
const Container = styled.div`
  background-color: white;
  ...
`;

export default class Column extends Component {
  render() {
    return (
      <Draggable draggableId={this.props.column.id} index={this.props.index}> // <------ columns are draggable now
        {provided => (
          <Container
            {...provided.draggableProps}
            innerRef={provided.innerRef}
            ref={provided.innerRef}
          >
            <Title {...provided.dragHandleProps}>{this.props.column.title}</Title> // <------ add the drag handle to the title of the column
            <Droppable
              droppableId={this.props.column.id}
              isDropDisabled={this.props.isDropDisabled}
              type="task"
            >
              {(provided, snapshot) => (
                <TaskList
                  innerRef={provided.innerRef}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  isDraggingOver={snapshot.isDraggingOver}
                >
                  {this.props.tasks.map((task, index) => <Task key={task.id} task={task} index={index} />)}
                  {provided.placeholder}
                </TaskList>
              )}
            </Droppable>
          </Container>
        )}
      </Draggable>
    );
  }
}
```

## Performance optimization

- You don't want to call the render function on components that don't have any new changes to be applied
- Use `shouldComponentUpdate` to prevent calling render on `Task` components that aren't changing from `snapshot` value changes
```js
class InnerList extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (
      nextProps.column === this.props.column &&
      nextProps.taskMap === this.props.taskMap && 
      nextProps.index === this.props.index
    ) {
      return false;
    }
    return true;
  }

  render() {
    const { column, taskMap, index } = this.props;
    const tasks = column.taskIds.map(taskId => taskMap[taskId]);
    return <Column column={column} tasks={tasks} index={index} />;
  }
}

/* 
class InnerList extends React.PureComponent {
  render() {
    const { column, taskMap, index } = this.props;
    const tasks = column.taskIds.map(taskId => taskMap[taskId]);
    return <Column column={column} tasks={tasks} index={index} />;
  }
}*/

class App extends React.Component {
  ...
  render() {
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {provided => (
            <Container
              {...provided.droppableProps}
              innerRef={provided.innerRef}
              ref={provided.innerRef}
            >
              {this.state.columnOrder.map((columnId, index) => {
                const column = this.state.columns[columnId];
                const isDropDisabled = index < this.state.homeIndex; //only allow dragging to the "right" (to higher indexed cols)

                return (
                  <InnerList // <------------ USE INNER LIST to do conditional rendering
                    key={column.id}
                    column={column}
                    taskMap={this.state.tasks}
                    index={index}
                    isDropDisabled={isDropDisabled}
                  />
                );
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    )
  }
}
```
```js
class InnerList extends Component {
  shouldComponentUpdate(nextProps) { //if list of tasks haven't changed => don't rerender
    if (nextProps.tasks === this.props.tasks) { //reference equality
      return false;
    }
    return true;
  }

  render() {
    return this.props.tasks.map((task, index) => (
      <Task key={task.id} task={task} index={index} />
    ));
  }
}

export default class Column extends Component {
  render() {
    return (
      <Draggable draggableId={this.props.column.id} index={this.props.index}>
        {provided => (
          <Container
            {...provided.draggableProps}
            innerRef={provided.innerRef}
            ref={provided.innerRef}
          >
            <Title {...provided.dragHandleProps}>{this.props.column.title}</Title>
            <Droppable
              droppableId={this.props.column.id}
              isDropDisabled={this.props.isDropDisabled}
              type="task"
            >
              {(provided, snapshot) => (
                <TaskList
                  innerRef={provided.innerRef}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  isDraggingOver={snapshot.isDraggingOver}
                >
                  <InnerList tasks={this.props.tasks} /> //<---------- USE INNER LIST
                  {provided.placeholder}
                </TaskList>
              )}
            </Droppable>
          </Container>
        )}
      </Draggable>
    );
  }
}
```
