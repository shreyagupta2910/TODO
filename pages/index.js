import Head from "next/head";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import CardItem from "../components/CardItem";
import { createGuidId } from "../utils";
import AddTaskButton from "../components/ui/AddTaskButton";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [boardData, setBoardData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.quicksell.co/v1/internal/frontend-assignment"
        );
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();

        // Group tickets by status
        const dataByStatus = json.tickets.reduce((acc, ticket) => {
          if (!acc[ticket.status]) acc[ticket.status] = [];
          acc[ticket.status].push({
            id: ticket.id,
            priority: ticket.priority,
            title: ticket.title,
            chat: 5,
            assignees: ticket.userId
              ? [
                  {
                    avt: `https://randomuser.me/api/portraits/men/${
                      ticket.userId % 100
                    }.jpg`,
                  },
                ]
              : [],
          });
          return acc;
        }, {});

        setBoardData(dataByStatus);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  // Ensure the component only renders when the browser is ready
  useEffect(() => {
    if (typeof window !== "undefined") {
      setReady(true);
    }
  }, []);

  // Handle drag and drop functionality
  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    // Copy current state
    const newBoardData = { ...boardData };

    // Remove dragged item from source
    const [draggedItem] = newBoardData[source.droppableId].splice(
      source.index,
      1
    );

    // Insert dragged item into destination
    newBoardData[destination.droppableId].splice(
      destination.index,
      0,
      draggedItem
    );

    setBoardData(newBoardData);
  };

  // Handle adding a new task on Enter key press
  const onTextAreaKeyPress = (e) => {
    if (e.keyCode === 13) {
      const val = e.target.value.trim();
      if (val.length === 0) {
        setShowForm(false);
      } else {
        const boardId = e.target.attributes["data-id"].value;
        const newItem = {
          id: createGuidId(),
          title: val,
          priority: 0,
          chat: 0,
          attachment: 0,
          assignees: [],
        };

        // Update state immutably
        const newBoardData = { ...boardData };
        newBoardData[boardId] = [...newBoardData[boardId], newItem];
        setBoardData(newBoardData);

        setShowForm(false);
        e.target.value = "";
      }
    }
  };

  return (
    <div className="p-8 h-screen">
      <Head>
        <title>ToDo</title>
        <meta name="description" content="ToDo App created for DoctusTech" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {ready && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-4 gap-5 my-2">
            {Object.keys(boardData).map((boardkey, bIndex) => (
              <div key={boardkey}>
                <Droppable droppableId={boardkey}>
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <div
                        className={`bg-gray-100 rounded-md shadow-md
                          flex flex-col relative overflow-hidden
                          ${snapshot.isDraggingOver ? "bg-green-100" : ""}`}
                      >
                        <span
                          className="w-full h-1 bg-gradient-to-r from-pink-700 to-red-200
                        absolute inset-x-0 top-0"
                        ></span>
                        <h4 className="p-3 flex justify-between items-center">
                          <span className="text-base font-medium text-gray-600">
                            {boardkey}
                          </span>
                        </h4>

                        <div
                          className="overflow-y-auto overflow-x-hidden h-auto"
                          style={{ maxHeight: "calc(100vh - 200px)" }}
                        >
                          {boardData[boardkey]?.map((item, iIndex) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id.toString()}
                              index={iIndex}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="m-3"
                                >
                                  <CardItem data={item} index={iIndex} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>

                        {showForm && selectedBoard === bIndex ? (
                          <div className="p-3">
                            <textarea
                              className="border-gray-300 rounded focus:ring-purple-400 w-full"
                              rows={3}
                              placeholder="Task info"
                              data-id={boardkey}
                              onKeyDown={(e) => onTextAreaKeyPress(e)}
                            />
                          </div>
                        ) : (
                          <AddTaskButton
                            setSelectedBoard={setSelectedBoard}
                            setShowForm={setShowForm}
                            bIndex={bIndex}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
