import React, { useEffect, useState } from 'react';
import { fetchTodos, updateTodoStatus } from './api';
import BounceLoader from "react-spinners/BounceLoader";
import './App.css';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingTodo, setCompletingTodo] = useState(null);

  useEffect(() => {
    const loadTodos = async () => {
      const data = await fetchTodos();
      setTodos(data);
      setLoading(false);
    };
    loadTodos();
  }, []);

  // Toggle the completion status of a todo
  const handleCompleteChange = async (id, isComplete, description) => {
    setCompletingTodo({
      id,
      description,
      action: isComplete ? 'uncompleting' : 'completing'
    });
    await updateTodoStatus(id, !isComplete);
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, isComplete: !isComplete } : todo
    ));
    setCompletingTodo(null);
  };

  // Sorting todos:
  // 1. Incomplete overdue tasks come first, sorted by due date (soonest at top)
  // 2. Incomplete future tasks follow, sorted by due date
  // 3. Completed tasks come last, sorted by due date
  const sortedTodos = todos.sort((a, b) => {
    // First compare completion status
    if (a.isComplete !== b.isComplete) {
      return a.isComplete ? 1 : -1;
    }

    // If both tasks have same completion status, sort by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }

    // If only one task has a due date, put it first
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return 0;
  });

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    return due < new Date();
  }

  if (loading) {
    return (
      <div className="loading">
        <header className='header-bar'>
          <h1 className='header-text'>Todo App</h1>
        </header>
        <div className="loading-content">
          <div className="loading-text">Loading your todos...</div>
          <BounceLoader
            loading={loading}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className='header-bar'>
        <h1 className='header-text'>Todo App</h1>
      </header>
      {completingTodo && (
        <div className={`completing-todos ${completingTodo.action !== 'completing' ? 'uncompleting' : ''}`}>
          {completingTodo.action} "{completingTodo.description}" {completingTodo.action === 'completing' ? '! Yay!' : '! Oh Noooooo!'}
        </div>
      )}
      <ul className="todo-list">
        {sortedTodos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.isComplete ? 'completed' : ''} ${isOverdue(todo.dueDate) && !todo.isComplete ? 'overdue' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={todo.isComplete}
                  onChange={() => handleCompleteChange(todo.id, todo.isComplete, todo.description)}
                />
                <span className={todo.isComplete ? 'completed-text' : ''}>{todo.description}</span>
              </div>
              {todo.dueDate && (
                <span className="due-date">
                  {new Date(todo.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;