import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, Repeat, ListChecks } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const urgencyColors = {
  1: "bg-slate-100 text-slate-600",
  2: "bg-blue-100 text-blue-700",
  3: "bg-amber-100 text-amber-700",
  4: "bg-orange-100 text-orange-700",
  5: "bg-red-100 text-red-700"
};

const importanceColors = {
  1: "bg-slate-100 text-slate-600",
  2: "bg-blue-100 text-blue-700",
  3: "bg-blue-200 text-blue-800",
  4: "bg-blue-300 text-blue-900",
  5: "bg-[#0047BA] text-white"
};

export default function TaskItem({ task, onToggleComplete }) {
  const { data: subtasks = [] } = useQuery({
    queryKey: ['subtasks', task.id],
    queryFn: () => base44.entities.Subtask.filter({ task_id: task.id })
  });

  const completedSubtasks = subtasks.filter(s => s.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
      className={`group relative bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 hover:shadow-lg hover:border-slate-200 transition-all duration-300 ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="pt-0.5">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task)}
            className="h-5 w-5 rounded-full border-2 border-slate-300 data-[state=checked]:bg-[#0047BA] data-[state=checked]:border-[#0047BA]"
          />
        </div>
        
        <Link 
          to={createPageUrl(`TaskDetail?id=${task.id}`)}
          className="flex-1 min-w-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className={`text-base sm:text-lg font-medium text-slate-800 truncate ${
                task.completed ? "line-through text-slate-400" : ""
              }`}>
                {task.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className={`${urgencyColors[task.urgency]} border-0 text-xs font-medium`}>
                  Urgency: {task.urgency}
                </Badge>
                <Badge className={`${importanceColors[task.importance]} border-0 text-xs font-medium`}>
                  Importance: {task.importance}
                </Badge>
                
                {task.deadline && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(task.deadline), "MMM d, h:mm a")}
                    </span>
                  )}

                  {task.recurrence && task.recurrence !== "none" && (
                    <span className="flex items-center gap-1 text-xs text-purple-600">
                      <Repeat className="w-3 h-3" />
                      {task.recurrence}
                    </span>
                  )}

                  {subtasks.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <ListChecks className="w-3 h-3" />
                      {completedSubtasks}/{subtasks.length}
                    </span>
                  )}
              </div>
            </div>
            
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
}