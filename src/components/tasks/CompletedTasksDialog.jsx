import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function CompletedTasksDialog({ open, onClose, tasks, onToggleComplete }) {
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-700">Completed Tasks</DialogTitle>
        </DialogHeader>

        {completedTasks.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No completed tasks yet</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {completedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                >
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => onToggleComplete(task)}
                    className="h-5 w-5 rounded-full border-2 border-slate-300 data-[state=checked]:bg-[#0047BA] data-[state=checked]:border-[#0047BA]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 line-through truncate">{task.title}</p>
                    {task.completed_at && (
                      <p className="text-xs text-slate-400">
                        Completed {format(new Date(task.completed_at), "MMM d, h:mm a")}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}