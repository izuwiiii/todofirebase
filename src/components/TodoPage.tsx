import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";
import { doSignOut } from "../firebase/auth";
import { useNavigate } from "react-router";
import { auth, db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

interface Todo {
  id: string;
  title: string;
  description: string;
  isEditing: boolean;
  completed: boolean;
  createdAt: Date;
}

interface TodoList {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
}

export const TodoPage: React.FC = () => {
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserDetails(data);
      }
    }
  };

  const fetchTodoLists = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const listsQuery = query(
        collection(db, "todoLists"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(listsQuery);
      const lists: TodoList[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lists.push({
          id: doc.id,
          name: data.name,
          userId: data.userId,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      setTodoLists(
        lists.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      );
    } catch (error) {
      console.error("Error fetching todo lists:", error);
    }
  };

  const fetchTodos = async (listId: string) => {
    try {
      const todosQuery = query(
        collection(db, "todos"),
        where("listId", "==", listId)
      );
      const querySnapshot = await getDocs(todosQuery);
      const todosList: Todo[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        todosList.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          isEditing: false,
          completed: data.completed,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      setTodos(
        todosList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      );
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (userLoggedIn) {
        await fetchUserData();
        await fetchTodoLists();
        setLoading(false);
      }
    };

    initializeData();
  }, [userLoggedIn]);

  useEffect(() => {
    if (!userLoggedIn) {
      navigate("/");
    }
  }, [userLoggedIn]);

  useEffect(() => {
    if (activeListId) {
      fetchTodos(activeListId);
    } else {
      setTodos([]);
    }
  }, [activeListId]);

  const createList = async () => {
    if (!newListName.trim() || !auth.currentUser) return;

    try {
      const docRef = await addDoc(collection(db, "todoLists"), {
        name: newListName,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      });

      const newList: TodoList = {
        id: docRef.id,
        name: newListName,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      };

      setTodoLists([...todoLists, newList]);
      setNewListName("");
      setActiveListId(newList.id);
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !activeListId) return;

    try {
      const docRef = await addDoc(collection(db, "todos"), {
        title: newTitle,
        description: newDescription,
        completed: false,
        listId: activeListId,
        createdAt: new Date(),
      });

      const newTodo: Todo = {
        id: docRef.id,
        title: newTitle,
        description: newDescription,
        isEditing: false,
        completed: false,
        createdAt: new Date(),
      };

      setTodos([...todos, newTodo]);
      setNewTitle("");
      setNewDescription("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const handleDeleteTodoList = async (todoList: TodoList) => {
    try {
      const todosQuery = query(
        collection(db, "todos"),
        where("listId", "==", todoList.id)
      );
      const querySnapshot = await getDocs(todosQuery);

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, "todoLists", todoList.id));

      setTodoLists((prev) => prev.filter((list) => list.id !== todoList.id));
      if (activeListId === todoList.id) {
        setActiveListId(null);
        setTodos([]);
      }
    } catch (error) {
      console.error("Error deleting todo list:", error);
    }
  };

  const getActiveList = () =>
    todoLists.find((list) => list.id === activeListId);

  const updateTodoInList = async (
    todoId: string,
    newTitle: string,
    newDescription: string
  ) => {
    try {
      await updateDoc(doc(db, "todos", todoId), {
        title: newTitle,
        description: newDescription,
      });

      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                title: newTitle,
                description: newDescription,
                isEditing: false,
              }
            : todo
        )
      );
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const toggleTodoComplete = async (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    try {
      await updateDoc(doc(db, "todos", todoId), {
        completed: !todo.completed,
      });

      setTodos((prev) =>
        prev.map((t) =>
          t.id === todoId ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      console.error("Error toggling todo completion:", error);
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      await deleteDoc(doc(db, "todos", todoId));
      setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const toggleEdit = (todoId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, isEditing: !todo.isEditing } : todo
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-indigo-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Hello, {userDetails?.name ?? "User"}
          </h1>
          <button
            onClick={() => doSignOut()}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Sign out
          </button>
        </div>

        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Todo Lists
          </h2>
          <div className="flex gap-3 flex-wrap mb-6">
            {todoLists.map((list) => (
              <div
                key={list.id}
                className="relative group bg-gradient-to-r from-amber-300 to-yellow-300 rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <button
                  onClick={() => setActiveListId(list.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeListId === list.id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-white text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {list.name}
                </button>
                <button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100"
                  onClick={() => handleDeleteTodoList(list)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="New list name"
              className="flex-1 p-4 border-2 border-indigo-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 outline-none placeholder-gray-500"
            />
            <button
              onClick={createList}
              className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              + Add List
            </button>
          </div>
        </div>

        {activeListId && (
          <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/30">
            <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {getActiveList()?.name}
            </h1>

            <form
              onSubmit={handleAddTodo}
              className="space-y-4 mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200"
            >
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title"
                className="w-full p-4 border-2 border-indigo-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 outline-none placeholder-gray-500 font-medium"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Task description"
                className="w-full p-4 border-2 border-indigo-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 outline-none placeholder-gray-500 resize-none h-24"
              />
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Add Task
              </button>
            </form>

            <ul className="space-y-4">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className={`group flex items-start gap-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                    todo.completed
                      ? "opacity-70 bg-gradient-to-r from-gray-50 to-gray-100"
                      : "hover:border-indigo-300"
                  }`}
                >
                  <button
                    onClick={() => toggleTodoComplete(todo.id)}
                    className={`w-8 h-8 mt-1 flex-shrink-0 flex items-center justify-center border-3 rounded-full transition-all duration-200 font-bold ${
                      todo.completed
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-500 shadow-lg"
                        : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                    }`}
                  >
                    {todo.completed ? "✓" : ""}
                  </button>

                  <div className="flex-1">
                    {todo.isEditing ? (
                      <>
                        <input
                          defaultValue={todo.title}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              const target = e.target as HTMLInputElement;
                              updateTodoInList(
                                todo.id,
                                target.value,
                                todo.description
                              );
                            }
                          }}
                          className="w-full mb-3 p-3 border-2 border-indigo-200 rounded-xl bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 outline-none font-medium"
                          autoFocus
                        />
                        <textarea
                          defaultValue={todo.description}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              const target = e.target as HTMLTextAreaElement;
                              updateTodoInList(
                                todo.id,
                                todo.title,
                                target.value
                              );
                            }
                          }}
                          className="w-full p-3 border-2 border-indigo-200 rounded-xl bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 outline-none resize-none h-20"
                        />
                      </>
                    ) : (
                      <>
                        <h3
                          className={`text-xl font-bold mb-2 ${
                            todo.completed
                              ? "line-through text-gray-500"
                              : "text-gray-800"
                          }`}
                        >
                          {todo.title}
                        </h3>
                        <p
                          className={`text-gray-600 leading-relaxed ${
                            todo.completed ? "line-through" : ""
                          }`}
                        >
                          {todo.description}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      onClick={() => toggleEdit(todo.id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoPage;
