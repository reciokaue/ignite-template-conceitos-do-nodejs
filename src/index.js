const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find((user) => user.username === username)
  if(!user){
    return response.status(404).json({error: "Mensagem do erro"})
  }
  request.user = user
  return next()
}
// User Todos
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user
  return response.status(200).json(todos)
});
// Create user
app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExists = users.find((user) => user.username === username)
  if(userExists){
    return response.status(400).json({error: "Mensagem do erro"})
  }
  if(name == undefined || username == undefined){
    return response.status(404).json({error: "Mensagem do erro"})
  }

  const user = { 
    id: uuidv4(), 
    name: name,
    username: username,
    todos: [],
  }
  users.push(user)
  return response.status(201).json(user)
});
// Create Todo
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  user.todos.push(newTodo)
  return response.status(201).json(newTodo)
});
// Change Todo
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const selectedTodo = user.todos.find(todo => todo.id === id)
  if(!selectedTodo){
    return response.status(404).json({error: "Mensagem do erro"})
  }
  selectedTodo.title = title
  selectedTodo.deadline = new Date(deadline)
 
  response.json(selectedTodo)
});
// Done Todo
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const selectedTodo = user.todos.find(todo => todo.id === id)
  if(!selectedTodo){
    return response.status(404).json({error: "Todo not found"})
  }
  selectedTodo.done = true
 
  response.json(selectedTodo)
});
// Delete Todo
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1){
    return response.status(404).json({error: "Mensagem do erro"})
  }
  user.todos.splice(todoIndex, 1)
 
  response.status(204).json()
});

module.exports = app;