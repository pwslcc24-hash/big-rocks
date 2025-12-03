import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, Edit2, Trash2, Calendar, Clock, FileText, AlertTriangle, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const urgencyColors = {
  1: "bg-slate-100 text-slate-600 border-slate-200",
  2: "bg-blue-100 text-blue-700 border-blue-200",
  3: "bg-amber-100 text-amber-700 border-amber-200",
  4: "bg-orange-100 text-orange-700 border-orange-200",
  5: "bg-red-100 text-red-700 border-red-200"
};

const importanceColors = {
  1: "bg-slate-100 text-slate-600 border-slate-200",
  2: "bg-blue-100 text-blue-700 border-blue-200",
  3: "bg-blue-200 text-blue-800 border-blue-300",
  4: "bg-blue-300 text-blue-900 border-blue-400",
  5: "bg-[#0047BA] text-white border-[#003A99]"
};

const urgencyLabels = ["Very Low", "Low", "Medium", "High", "Critical"];
const importanceLabels = ["Minor", "Low", "Moderate", "High", "Essential"];

export default function TaskDetail() {
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

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Task.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate(createPageUrl("Home"));
    }
  });

  const toggleMutation = useMutation({
    mutationFn: () => base44.entities.Task.update(taskId, { completed: !task.completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            <Skeleton className="h-24 w-full" />
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
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" className="mb-6 -ml-2 text-slate-600 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className={`text-2xl sm:text-3xl font-bold text-slate-800 ${
                    task.completed ? "line-through text-slate-400" : ""
                  }`}>
                    {task.title}
                  </h1>
                  {task.completed && (
                    <div className="flex items-center gap-2 mt-2 text-[#0047BA]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link to={createPageUrl(`EditTask?id=${task.id}`)}>
                    <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-xl border-slate-200 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this task? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteMutation.mutate()}
                          className="rounded-xl bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Ratings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Urgency</span>
                  </div>
                  <Badge className={`${urgencyColors[task.urgency]} border text-sm px-3 py-1`}>
                    {task.urgency} - {urgencyLabels[task.urgency - 1]}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">Importance</span>
                  </div>
                  <Badge className={`${importanceColors[task.importance]} border text-sm px-3 py-1`}>
                    {task.importance} - {importanceLabels[task.importance - 1]}
                  </Badge>
                </div>
              </div>

              {/* Deadline */}
              {task.deadline && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Deadline</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-slate-800">
                      {format(new Date(task.deadline), "EEEE, MMMM d, yyyy")}
                    </p>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{format(new Date(task.deadline), "h:mm a")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {task.notes && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Notes</span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{task.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4">
                <Button
                  onClick={() => toggleMutation.mutate()}
                  className={`w-full h-12 rounded-xl ${
                    task.completed 
                      ? "bg-slate-600 hover:bg-slate-700" 
                      : "bg-[#0047BA] hover:bg-[#003A99]"
                  }`}
                  disabled={toggleMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}