import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";
import { doSignOut } from "../firebase/auth";
import { useNavigate } from "react-router";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, type DocumentData } from "firebase/firestore";

interface Todo {
  id: number;
  title: string;
  description: string;
  isEditing: boolean;
  completed: boolean;
}

export const TodoPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [userDetails, setUserDetails] = useState<null | DocumentData>(null);
  const { userLoggedIn } = useAuth();

  const navigate = useNavigate();

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user);
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
        console.log(docSnap.data());
      } else {
        console.log("User is not logged in");
      }
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setTodos([
      ...todos,
      {
        id: Date.now(),
        title: newTitle,
        description: newDescription,
        isEditing: false,
        completed: false,
      },
    ]);
    setNewTitle("");
    setNewDescription("");
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleEdit = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
      )
    );
  };

  useEffect(() => {
    if (!userLoggedIn) {
      navigate("/");
    }
  }, [userLoggedIn]);

  const updateTodo = (
    id: number,
    updatedTitle: string,
    updatedDescription: string
  ) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              title: updatedTitle,
              description: updatedDescription,
              isEditing: false,
            }
          : todo
      )
    );
  };

  const toggleComplete = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 onClick={() => doSignOut()}>Hello, {userDetails?.name}</h1>
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-center">My Todo List</h1>

        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Add Task
          </button>
        </form>

        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-start gap-3 bg-gray-50 border p-4 rounded-xl transition ${
                todo.completed ? "opacity-60 line-through" : ""
              }`}
            >
              <button
                onClick={() => toggleComplete(todo.id)}
                className={`w-6 h-6 mt-1 flex-shrink-0 flex items-center justify-center border-2 rounded-full ${
                  todo.completed
                    ? "bg-green-500 text-white border-green-500"
                    : "border-gray-400"
                }`}
              >
                {todo.completed ? "✔" : ""}
              </button>

              <div className="flex-1">
                {todo.isEditing ? (
                  <>
                    <input
                      defaultValue={todo.title}
                      onBlur={(e) =>
                        updateTodo(todo.id, e.target.value, todo.description)
                      }
                      className="w-full mb-2 p-2 border rounded-lg"
                      autoFocus
                    />
                    <textarea
                      defaultValue={todo.description}
                      onBlur={(e) =>
                        updateTodo(todo.id, todo.title, e.target.value)
                      }
                      className="w-full p-2 border rounded-lg resize-none"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">{todo.title}</h3>
                    <p className="text-sm text-gray-600">{todo.description}</p>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-1 ml-2">
                <button
                  onClick={() => toggleEdit(todo.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TodoPage;
