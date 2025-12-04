import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, Repeat, ListChecks } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from "date-fns";
import { motion } from "framer-motion";

const urgencyColors = {
  1: "bg-white/20 text-white/70",
  2: "bg-white/25 text-white/80",
  3: "bg-amber-400/90 text-white",
  4: "bg-orange-400/90 text-white",
  5: "bg-red-400/90 text-white"
};

const importanceColors = {
  1: "bg-white/20 text-white/70",
  2: "bg-white/25 text-white/80",
  3: "bg-white/30 text-white",
  4: "bg-white/40 text-white",
  5: "bg-white text-[#0047BA]"
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
      className={`group relative bg-[#0047BA] rounded-lg p-4 sm:p-5 hover:bg-[#003A99] transition-all duration-200 ${
        task.completed ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="pt-0.5">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task)}
            className="h-5 w-5 rounded-full border-2 border-white/50 data-[state=checked]:bg-white data-[state=checked]:border-white"
          />
        </div>
        
        <button 
          onClick={() => onOpenTask?.(task)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className={`text-base sm:text-lg font-medium text-white truncate relative ${
                task.completed ? "text-white/70" : ""
              }`}>
                <span className="relative">
                  {task.title}
                  {task.completed && (
                    <span 
                      className="absolute left-0 top-1/2 h-[2px] bg-[#C7C9C7] origin-left animate-strikethrough"
                      style={{ width: '100%' }}
                    />
                  )}
                </span>
              </h3>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className={`${urgencyColors[task.urgency]} border-0 text-xs font-medium rounded-md`}>
                  Urgency: {task.urgency}
                </Badge>
                <Badge className={`${importanceColors[task.importance]} border-0 text-xs font-medium rounded-md`}>
                  Importance: {task.importance}
                </Badge>
                
                {task.deadline && (
                    <span className="flex items-center gap-1 text-xs text-white/70">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(task.deadline), "MMM d, h:mm a")}
                    </span>
                  )}

                  {task.recurrence && task.recurrence !== "none" && (
                    <span className="flex items-center gap-1 text-xs text-white/70">
                      <Repeat className="w-3 h-3" />
                      {task.recurrence}
                    </span>
                  )}

                  {subtasks.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-white/70">
                      <ListChecks className="w-3 h-3" />
                      {completedSubtasks}/{subtasks.length}
                    </span>
                  )}
              </div>
            </div>
            
            <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white transition-colors flex-shrink-0" />
          </div>
          </button>
      </div>
    </motion.div>
  );
}