import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Teams from "./Teams";
import KanbanBoard from "./KanbanBoard";

const socket = io("http://localhost:5000");

export default function DashboardPage() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch tasks when a team is selected
  useEffect(() => {
    if (!selectedTeam) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks");
        const data = await res.json();
        const teamTasks = data.filter((t) => t.teamId === selectedTeam._id);
        setTasks(teamTasks);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTasks();
  }, [selectedTeam]);

  // Listen for new task notifications via Socket.io
  useEffect(() => {
    socket.on("taskCreated", (task) => {
      setNotifications((prev) => [
        `🆕 Task "${task.title}" assigned to ${task.assignedTo.join(", ")}`,
        ...prev,
      ]);

      if (selectedTeam && task.teamId === selectedTeam._id) {
        setTasks((prev) => [...prev, task]);
      }
    });

    return () => socket.off("taskCreated");
  }, [selectedTeam]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teams Section */}
        <div>
          <Teams onTeamSelect={setSelectedTeam} />

          {selectedTeam && (
            <div className="mt-4 p-4 bg-white rounded shadow">
              <h3 className="font-semibold">Selected Team:</h3>
              <p className="text-gray-700">{selectedTeam.name}</p>
              <p className="text-sm text-gray-500">
                Domain: {selectedTeam.domain || "Not specified"}
              </p>
            </div>
          )}
        </div>

        {/* Kanban Board Section */}
        <div>
          {selectedTeam ? (
            <KanbanBoard selectedTeam={selectedTeam} />
          ) : (
            <div className="p-6 bg-gray-50 rounded-2xl shadow">
              <p className="text-gray-500">👉 Select a team to view tasks</p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-2">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No notifications yet.</p>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {notifications.map((n, i) => (
              <li key={i} className="p-2 border rounded bg-gray-50 text-sm">
                {n}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
