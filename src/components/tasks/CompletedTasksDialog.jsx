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
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-lg bg-white border-[#C7C9C7]/30">
        <DialogHeader>
          <DialogTitle className="text-[#0047BA] font-semibold">Completed Tasks</DialogTitle>
        </DialogHeader>

        {completedTasks.length === 0 ? (
          <p className="text-center text-[#C7C9C7] py-8">No completed tasks yet</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {completedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-3 bg-[#C7C9C7]/10 rounded-lg"
                >
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => onToggleComplete(task)}
                    className="h-5 w-5 rounded-full border-2 border-[#C7C9C7] data-[state=checked]:bg-[#0047BA] data-[state=checked]:border-[#0047BA]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#C7C9C7] line-through truncate">{task.title}</p>
                    {task.completed_at && (
                      <p className="text-xs text-[#C7C9C7]/70">
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