import React, { useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, ChevronRight, Repeat, ChevronUp, ChevronDown } from "lucide-react";
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

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  // Generate next recurring task instance
  const generateNextRecurrence = (task) => {
    if (!task.recurrence || task.recurrence === "none" || !task.deadline) return;

    const currentDeadline = new Date(task.deadline);
    let nextDeadline = new Date(currentDeadline);

    switch (task.recurrence) {
      case "daily":
        nextDeadline.setDate(nextDeadline.getDate() + 1);
        break;
      case "weekly":
        nextDeadline.setDate(nextDeadline.getDate() + 7);
        break;
      case "monthly":
        nextDeadline.setMonth(nextDeadline.getMonth() + 1);
        break;
      case "yearly":
        nextDeadline.setFullYear(nextDeadline.getFullYear() + 1);
        break;
    }

    createMutation.mutate({
      title: task.title,
      urgency: task.urgency,
      importance: task.importance,
      deadline: nextDeadline.toISOString(),
      notes: task.notes,
      recurrence: task.recurrence,
      completed: false,
      parent_task_id: task.parent_task_id || task.id
    });
  };

  // Sort by manual order
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // First, separate completed from incomplete
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then sort by manual order
      return (a.order || 0) - (b.order || 0);
    });
  }, [tasks]);

  const handleMoveTask = (task, direction) => {
    const taskList = incompleteTasks;
    const currentIndex = taskList.findIndex(t => t.id === task.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= taskList.length) return;
    
    const otherTask = taskList[newIndex];
    const currentOrder = task.order || 0;
    const otherOrder = otherTask.order || 0;
    
    // Swap orders
    updateMutation.mutate({ id: task.id, data: { order: otherOrder } });
    updateMutation.mutate({ id: otherTask.id, data: { order: currentOrder } });
  };

  const incompleteTasks = sortedTasks.filter(t => !t.completed);
  const completedTasks = sortedTasks.filter(t => t.completed);

  const handleToggleComplete = (task) => {
    const isCompleting = !task.completed;
    
    updateMutation.mutate({
      id: task.id,
      data: { 
        completed: isCompleting,
        completed_at: isCompleting ? new Date().toISOString() : null
      }
    });

    // Generate next recurring task when completing
    if (isCompleting && task.recurrence && task.recurrence !== "none") {
      generateNextRecurrence(task);
    }
  };

  // Move tasks to completed after 5 minutes
  useEffect(() => {
    const recentlyCompleted = tasks.filter(t => 
      t.completed && t.completed_at && 
      (new Date() - new Date(t.completed_at)) < 5 * 60 * 1000
    );

    if (recentlyCompleted.length > 0) {
      const timeouts = recentlyCompleted.map(task => {
        const timeLeft = 5 * 60 * 1000 - (new Date() - new Date(task.completed_at));
        return setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }, Math.max(timeLeft, 0));
      });

      return () => timeouts.forEach(t => clearTimeout(t));
    }
  }, [tasks, queryClient]);

  // Tasks that are recently completed (within 5 minutes) stay visible
  const recentlyCompletedTasks = completedTasks.filter(t => 
    t.completed_at && (new Date() - new Date(t.completed_at)) < 5 * 60 * 1000
  );

  // Count of tasks moved to completed page
  const archivedCompletedCount = completedTasks.length - recentlyCompletedTasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0047BA]">Big Rocks</h1>
            <div className="flex flex-col items-end gap-2">
            <Link to={createPageUrl("AddTask")}>
            <Button className="h-11 px-5 rounded-xl bg-[#0047BA] hover:bg-[#003A99] shadow-lg shadow-blue-900/25">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </Button>
            </Link>
            {completedTasks.length > 0 && (
              <Link to={createPageUrl("CompletedTasks")} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0047BA] transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
            </div>
            </motion.div>



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
          <div className="space-y-6">
            {/* Current Tasks */}
            {(incompleteTasks.length > 0 || recentlyCompletedTasks.length > 0) && (
              <div>
                <h2 className="text-lg font-semibold text-slate-700 mb-3">Current Tasks</h2>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {incompleteTasks.map((task, index) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onMoveUp={() => handleMoveTask(task, 'up')}
                        onMoveDown={() => handleMoveTask(task, 'down')}
                        canMoveUp={index > 0}
                        canMoveDown={index < incompleteTasks.length - 1}
                      />
                    ))}
                    {recentlyCompletedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}