import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import TaskForm from "@/components/tasks/TaskForm";
import { motion } from "framer-motion";

export default function AddTask() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate(createPageUrl("Home"));
    }
  });

  const handleSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" className="mb-6 -ml-2 text-slate-600 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-[#002E5D] mb-6">Create New Task</h1>
            <TaskForm
              onSubmit={handleSubmit}
              onCancel={() => navigate(createPageUrl("Home"))}
              isLoading={createMutation.isPending}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}