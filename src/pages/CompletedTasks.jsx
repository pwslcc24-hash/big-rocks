import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import TaskItem from "@/components/tasks/TaskItem";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompletedTasks() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get('list');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', listId],
    queryFn: () => listId ? base44.entities.Task.filter({ list_id: listId }) : base44.entities.Task.list(),
    enabled: !!listId
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const completedTasks = tasks.filter(t => t.completed);

  const handleToggleComplete = (task) => {
    updateMutation.mutate({
      id: task.id,
      data: { completed: !task.completed, completed_at: null }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" className="mb-6 -ml-2 text-slate-600 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Big Rocks
            </Button>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#0047BA] mb-2">Completed Tasks</h1>
          <p className="text-slate-500 mb-8">
            {completedTasks.length} {completedTasks.length === 1 ? 'task' : 'tasks'} completed
          </p>

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
          ) : completedTasks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500">No completed tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}