import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SubtaskList({ taskId }) {
  const [newSubtask, setNewSubtask] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: subtasks = [] } = useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: () => base44.entities.Subtask.filter({ task_id: taskId }),
    enabled: !!taskId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Subtask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
      setNewSubtask("");
      setIsAdding(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subtask.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Subtask.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] })
  });

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    createMutation.mutate({
      title: newSubtask.trim(),
      task_id: taskId,
      order: subtasks.length
    });
  };

  const sortedSubtasks = [...subtasks].sort((a, b) => (a.order || 0) - (b.order || 0));
  const completedCount = subtasks.filter(s => s.completed).length;

  const handleMoveSubtask = (subtask, direction) => {
    const currentIndex = sortedSubtasks.findIndex(s => s.id === subtask.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sortedSubtasks.length) return;
    
    const otherSubtask = sortedSubtasks[newIndex];
    const currentOrder = subtask.order || 0;
    const otherOrder = otherSubtask.order || 0;
    
    updateMutation.mutate({ id: subtask.id, data: { order: otherOrder } });
    updateMutation.mutate({ id: otherSubtask.id, data: { order: currentOrder } });
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">
          Subtasks {subtasks.length > 0 && `(${completedCount}/${subtasks.length})`}
        </span>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-8 text-[#0047BA] hover:text-[#003A99]"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sortedSubtasks.map((subtask, index) => (
            <motion.div
              key={subtask.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 group"
            >
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveSubtask(subtask, 'up')}
                  disabled={index === 0}
                  className="h-4 w-4 p-0 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveSubtask(subtask, 'down')}
                  disabled={index === sortedSubtasks.length - 1}
                  className="h-4 w-4 p-0 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={(checked) => 
                  updateMutation.mutate({ id: subtask.id, data: { completed: checked } })
                }
                className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-[#0047BA] data-[state=checked]:border-[#0047BA]"
              />
              <span className={`flex-1 text-sm ${subtask.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                {subtask.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate(subtask.id)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {isAdding && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddSubtask}
            className="flex items-center gap-2"
          >
            <Input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Subtask title..."
              className="h-9 text-sm rounded-lg border-slate-200"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newSubtask.trim() || createMutation.isPending}
              className="h-9 px-3 rounded-lg bg-[#0047BA] hover:bg-[#003A99]"
            >
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => { setIsAdding(false); setNewSubtask(""); }}
              className="h-9 w-9"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.form>
        )}

        {subtasks.length === 0 && !isAdding && (
          <p className="text-sm text-slate-400 text-center py-2">No subtasks yet</p>
        )}
      </div>
    </div>
  );
}