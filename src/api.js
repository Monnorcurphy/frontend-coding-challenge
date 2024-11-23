import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

// Fetch Todos
export const fetchTodos = async () => {
  try {
    const response = await axios.get(`${API_URL}/get`, {
      headers: {
        'X-Api-Key': API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};

// Update Todo Completion Status
export const updateTodoStatus = async (todoId, isComplete) => {
  try {
    await axios.patch(`${API_URL}/patch/${todoId}`,
      { isComplete },
      {
        headers: {
          'X-Api-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error updating todo status:', error);
  }
};