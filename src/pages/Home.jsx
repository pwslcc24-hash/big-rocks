import React, { useMemo, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, ChevronRight, Repeat } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import TaskItem from "@/components/tasks/TaskItem";
import EmptyState from "@/components/tasks/EmptyState";
import ListSelector from "@/components/lists/ListSelector";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const queryClient = useQueryClient();
  const [currentList, setCurrentList] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Ensure personal list exists for user
  const { data: lists = [] } = useQuery({
    queryKey: ['taskLists', user?.email],
    queryFn: async () => {
      const allLists = await base44.entities.TaskList.list();
      return allLists.filter(list => 
        list.owner_email === user.email || 
        (list.shared_with && list.shared_with.includes(user.email))
      );
    },
    enabled: !!user?.email
  });

  // Set current list based on user preference
  useEffect(() => {
    if (!user?.email || lists === undefined || lists.length === 0) return;
    
    if (!currentList) {
      // Check for user's default list preference
      const defaultListId = user.default_list_id;
      const defaultList = defaultListId 
        ? lists.find(l => l.id === defaultListId) 
        : null;
      // Fall back to first available list
      setCurrentList(defaultList || lists[0]);
    }
  }, [user?.email, lists, currentList]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', currentList?.id],
    queryFn: () => base44.entities.Task.filter({ list_id: currentList.id }),
    enabled: !!currentList?.id
  });

  // Auto-escalate urgency based on deadline proximity
  useEffect(() => {
    if (!tasks.length) return;

    tasks.forEach(task => {
      if (!task.deadline || task.completed || task.importance < 3) return;

      const now = new Date();
      const deadline = new Date(task.deadline);
      const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
      const daysUntilDeadline = Math.round((deadlineDate - nowDate) / (1000 * 60 * 60 * 24));

      let newUrgency = task.urgency;
      if (daysUntilDeadline <= 0) newUrgency = 5;
      else if (daysUntilDeadline <= 1) newUrgency = Math.max(task.urgency, 5);
      else if (daysUntilDeadline <= 3) newUrgency = Math.max(task.urgency, 4);
      else if (daysUntilDeadline <= 7) newUrgency = Math.max(task.urgency, 3);

      // Only update if urgency needs to increase
      if (newUrgency > task.urgency) {
        updateMutation.mutate({ id: task.id, data: { urgency: newUrgency } });
      }
    });
  }, [tasks]);

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
      parent_task_id: task.parent_task_id || task.id,
      list_id: task.list_id
    });
  };

  // Calculate effective urgency based on deadline proximity
  const getEffectiveUrgency = (task) => {
    if (!task.deadline || task.completed) return task.urgency;
    
    const now = new Date();
    const deadline = new Date(task.deadline);
    
    // Calculate days difference using date only (ignore time)
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const daysUntilDeadline = Math.round((deadlineDate - nowDate) / (1000 * 60 * 60 * 24));
    
    // Escalate urgency as deadline approaches (for important tasks)
    if (task.importance >= 3) {
      if (daysUntilDeadline <= 0) return 5; // Overdue or due today = critical
      if (daysUntilDeadline <= 1) return Math.max(task.urgency, 5); // Tomorrow
      if (daysUntilDeadline <= 3) return Math.max(task.urgency, 4);
      if (daysUntilDeadline <= 7) return Math.max(task.urgency, 3);
    }
    
    return task.urgency;
  };

  // Sort algorithm: Effective Urgency first (descending), then Importance (descending)
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // First, separate completed from incomplete
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then sort by effective urgency (higher first)
      const aUrgency = getEffectiveUrgency(a);
      const bUrgency = getEffectiveUrgency(b);
      if (bUrgency !== aUrgency) {
        return bUrgency - aUrgency;
      }
      // Then by importance (higher first)
      return b.importance - a.importance;
    });
  }, [tasks]);

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
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0047BA]">Big Rocks</h1>
            <div className="flex flex-col items-end gap-2">
              <Link to={createPageUrl(`AddTask?list=${currentList?.id}`)}>
                <Button className="h-11 px-5 rounded-xl bg-[#0047BA] hover:bg-[#003A99] shadow-lg shadow-blue-900/25">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Add Task</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>
              {completedTasks.length > 0 && (
                <Link to={createPageUrl(`CompletedTasks?list=${currentList?.id}`)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0047BA] transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
          {user?.email && (
            <ListSelector 
              currentList={currentList} 
              onListChange={setCurrentList} 
              userEmail={user.email} 
            />
          )}
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
                    {incompleteTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
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