import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, Repeat, ListChecks } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from "date-fns";
import { motion } from "framer-motion";

const urgencyColors = {
  1: "bg-[#C7C9C7]/20 text-[#C7C9C7]",
  2: "bg-[#C7C9C7]/30 text-gray-600",
  3: "bg-amber-50 text-amber-600",
  4: "bg-orange-50 text-orange-600",
  5: "bg-red-50 text-red-600"
};

const importanceColors = {
  1: "bg-[#C7C9C7]/20 text-[#C7C9C7]",
  2: "bg-[#0047BA]/10 text-[#0047BA]/60",
  3: "bg-[#0047BA]/15 text-[#0047BA]/80",
  4: "bg-[#0047BA]/25 text-[#0047BA]",
  5: "bg-[#0047BA] text-white"
};

export default function TaskItem({ task, onToggleComplete, onOpenTask }) {
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
      className={`group relative bg-white rounded-lg border border-[#C7C9C7]/30 p-4 sm:p-5 hover:border-[#0047BA]/30 hover:shadow-sm transition-all duration-200 ${
        task.completed ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="pt-0.5">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task)}
            className="h-5 w-5 rounded-full border-2 border-[#C7C9C7] data-[state=checked]:bg-[#0047BA] data-[state=checked]:border-[#0047BA]"
          />
        </div>
        
        <button 
          onClick={() => onOpenTask?.(task)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className={`text-base sm:text-lg font-medium text-gray-800 truncate ${
                task.completed ? "line-through text-[#C7C9C7]" : ""
              }`}>
                {task.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className={`${urgencyColors[task.urgency]} border-0 text-xs font-medium rounded-md`}>
                  Urgency: {task.urgency}
                </Badge>
                <Badge className={`${importanceColors[task.importance]} border-0 text-xs font-medium rounded-md`}>
                  Importance: {task.importance}
                </Badge>
                
                {task.deadline && (
                    <span className="flex items-center gap-1 text-xs text-[#C7C9C7]">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(task.deadline), "MMM d, h:mm a")}
                    </span>
                  )}

                  {task.recurrence && task.recurrence !== "none" && (
                    <span className="flex items-center gap-1 text-xs text-[#0047BA]">
                      <Repeat className="w-3 h-3" />
                      {task.recurrence}
                    </span>
                  )}

                  {subtasks.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-[#C7C9C7]">
                      <ListChecks className="w-3 h-3" />
                      {completedSubtasks}/{subtasks.length}
                    </span>
                  )}
              </div>
            </div>
            
            <ChevronRight className="w-5 h-5 text-[#C7C9C7] group-hover:text-[#0047BA] transition-colors flex-shrink-0" />
          </div>
          </button>
      </div>
    </motion.div>
  );
}