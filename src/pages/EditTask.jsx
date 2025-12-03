import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import TaskForm from "@/components/tasks/TaskForm";
import { motion } from "framer-motion";

export default function EditTask() {
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const tasks = await base44.entities.Task.filter({ id: taskId });
      return tasks[0];
    },
    enabled: !!taskId
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      navigate(createPageUrl(`TaskDetail?id=${taskId}`));
    }
  });

  const handleSubmit = (data) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Task not found</h2>
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" className="mt-4">Go back to tasks</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to={createPageUrl(`TaskDetail?id=${taskId}`)}>
            <Button variant="ghost" className="mb-6 -ml-2 text-slate-600 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Task
            </Button>
          </Link>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Task</h1>
            <TaskForm
              task={task}
              onSubmit={handleSubmit}
              onCancel={() => navigate(createPageUrl(`TaskDetail?id=${taskId}`))}
              isLoading={updateMutation.isPending}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}