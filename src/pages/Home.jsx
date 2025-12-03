import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import TaskItem from "@/components/tasks/TaskItem";
import EmptyState from "@/components/tasks/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  // Sort algorithm: Urgency first (descending), then Importance (descending)
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // First, separate completed from incomplete
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then sort by urgency (higher first)
      if (b.urgency !== a.urgency) {
        return b.urgency - a.urgency;
      }
      // Then by importance (higher first)
      return b.importance - a.importance;
    });
  }, [tasks]);

  const incompleteTasks = sortedTasks.filter(t => !t.completed);
  const completedTasks = sortedTasks.filter(t => t.completed);

  const handleToggleComplete = (task) => {
    updateMutation.mutate({
      id: task.id,
      data: { completed: !task.completed }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Tasks</h1>
            <p className="text-slate-500 mt-1">
              {incompleteTasks.length} {incompleteTasks.length === 1 ? 'task' : 'tasks'} remaining
            </p>
          </div>
          <Link to={createPageUrl("AddTask")}>
            <Button className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        {tasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 sm:gap-4 mb-8"
          >
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <ListTodo className="w-4 h-4" />
                <span className="text-xs font-medium">Total</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{tasks.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{incompleteTasks.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Done</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{completedTasks.length}</p>
            </div>
          </motion.div>
        )}

        {/* Task List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {sortedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}