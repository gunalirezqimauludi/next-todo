const baseURL = 'https://todos-rest-api-demo.onrender.com';

export class TodoServices {
  async getTodos() {
    const result = await fetch(`${baseURL}/todos`);
    return await result.json();
  }

  async postTodo(payload) {
    const response = await fetch(`${baseURL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('An error has occured');
    }

    return await response.json();
  }

  async updateTodo(payload) {
    const response = await fetch(`${baseURL}/todos/${payload._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: payload.text,
      }),
    });

    if (!response.ok) {
      throw new Error('An error has occured');
    }

    return await response.json();
  }

  async deleteTodo(todoId) {
    const response = await fetch(`${baseURL}/todos/${todoId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('An error has occured');
    }

    return await response.json();
  }
}
