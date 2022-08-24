const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username)
  
  if(!user) return response.status(404).json({ error: "user not found"});

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.find(user => user.username === username)
  if(userAlreadyExists) return response.status(400).json({error: "username already exists."})

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }
  users.push(newUser)
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user, body: { title, deadline } } = request
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(newTodo)
  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, body: { title, deadline }, params: { id } } = request
  
  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) return response.status(404).json({error: "todo not found."})

  todo.title = title
  todo.deadline = new Date(deadline)
  return response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user, params: { id } } = request

  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) return response.status(404).json({error: "todo not found."})

  todo.done = true
  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, params: { id } } = request

  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) return response.status(404).json({error: "todo not found."})

  user.todos.splice(todo, 1)

  return response.status(204).send()
});

module.exports = app;