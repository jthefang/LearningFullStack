import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Column from './column';

const Container = styled.div` /* have columns be aligned as columsn in a row */
  display: flex;
`;

class InnerList extends PureComponent {
  render() {
    const { column, taskMap, index } = this.props;
    const tasks = column.taskIds.map(taskId => taskMap[taskId]);
    return <Column column={column} tasks={tasks} index={index} />;
  }
}

class App extends React.Component {
  state = initialData;

  /*onDragStart = () => {
    document.body.style.color = 'orange';
    document.body.style.transition = 'background-color 0.2s ease';
  };

  onDragUpdate = update => {
    const { destination } = update;
    const opacity = destination 
      ? destination.index / Object.keys(this.state.tasks).length 
      : 0;
    document.body.style.backgroundColor = `rgba(153, 141, 217, ${opacity})`;
  }*/

  onDragStart = start => {
    // only allow tasks to move to columns to the right of it's current column
    const homeIndex = this.state.columnOrder.indexOf(start.source.droppableId);

    this.setState({
      homeIndex,
    });
  }

  onDragEnd = result => {
    this.setState({ homeIndex: null });

    document.body.style.color = 'inherit';
    document.body.style.backgroundColor = 'inherit';

    const { destination, source, draggableId, type } = result;
    if (!destination) {
      return;
    }

    const sameLocation = destination.droppableId === source.droppableId && destination.index === source.index;
    if (sameLocation) {
      return;
    }

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
    const newStart = {
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
                  <InnerList
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

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
