import React, { useEffect, useState } from 'react';
import { fetchTodos, updateTodoStatus } from './api';
import './App.css';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingTodo, setCompletingTodo] = useState(null);
  const [theme, setTheme] = useState('default');

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };


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
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading your todos...</div>
      </div>
    );
  }

  return (
    <div className={`App ${theme}`}>
      <header className='header-bar'>
        <h1 className='header-text'>Todo App</h1>
        <select value={theme} onChange={handleThemeChange}>
          <option value="default">Default</option>
          <option value="dark">Dark</option>
          <option value="high-contrast">High Contrast</option>
        </select>
      </header>
      <main>
        {completingTodo && (
          <div
            className={`completing-todos ${completingTodo.action !== 'completing' ? 'uncompleting' : ''}`}
            role="status"
            aria-live="polite"
          >
            {completingTodo.action} "{completingTodo.description}" {completingTodo.action === 'completing' ? '! Yay!' : '! Oh Noooooo!'}
          </div>
        )}
        <ul className="todo-list">
          {sortedTodos.map(todo => (
            <li
              key={todo.id}
              className={`todo-item ${todo.isComplete ? 'completed' : ''} ${isOverdue(todo.dueDate) && !todo.isComplete ? 'overdue' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id={`todo-${todo.id}`}
                    checked={todo.isComplete}
                    onChange={() => handleCompleteChange(todo.id, todo.isComplete, todo.description)}
                    aria-label={`Mark "${todo.description}" as ${todo.isComplete ? 'incomplete' : 'complete'}`}
                  />
                  <label htmlFor={`todo-${todo.id}`} className={todo.isComplete ? 'completed-text' : ''}>{todo.description}</label>
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
      </main>
    </div>
  );
};

export default App;