import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, X, Repeat, Trash2 } from "lucide-react";
import { format } from "date-fns";
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
import SubtaskList from "./SubtaskList";

export default function TaskDialog({ open, onClose, task, listId }) {
  const queryClient = useQueryClient();
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: "",
    urgency: 3,
    importance: 3,
    deadline: null,
    notes: "",
    recurrence: "none"
  });
  const [time, setTime] = useState({ hour: "12", minute: "00", period: "PM" });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        urgency: task.urgency || 3,
        importance: task.importance || 3,
        deadline: task.deadline ? new Date(task.deadline) : null,
        notes: task.notes || "",
        recurrence: task.recurrence || "none"
      });
      if (task.deadline) {
        const d = new Date(task.deadline);
        const hours = d.getHours();
        const period = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 || 12;
        setTime({
          hour: String(hour12),
          minute: String(d.getMinutes()).padStart(2, '0'),
          period
        });
      }
    } else {
      setFormData({
        title: "",
        urgency: 3,
        importance: 3,
        deadline: null,
        notes: "",
        recurrence: "none"
      });
      setTime({ hour: "12", minute: "00", period: "PM" });
    }
  }, [task, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.update(task.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Task.delete(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (formData.deadline && time) {
      let hours = parseInt(time.hour);
      if (time.period === "PM" && hours !== 12) hours += 12;
      if (time.period === "AM" && hours === 12) hours = 0;
      const deadline = new Date(formData.deadline);
      deadline.setHours(hours, parseInt(time.minute));
      submitData.deadline = deadline.toISOString();
    } else {
      submitData.deadline = null;
    }

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate({ ...submitData, list_id: listId, completed: false });
    }
  };

  const urgencyLabels = ["Very Low", "Low", "Medium", "High", "Critical"];
  const importanceLabels = ["Minor", "Low", "Moderate", "High", "Essential"];
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white border-[#C7C9C7]/30">
        <DialogHeader>
          <DialogTitle className="text-[#0047BA] font-semibold">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-10 border-[#C7C9C7]/50 focus:border-[#0047BA] focus:ring-[#0047BA] rounded-lg"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Urgency</Label>
              <span className="text-sm font-medium text-orange-600">
                {formData.urgency} - {urgencyLabels[formData.urgency - 1]}
              </span>
            </div>
            <Slider
              value={[formData.urgency]}
              onValueChange={([value]) => setFormData({ ...formData, urgency: value })}
              min={1}
              max={5}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Importance</Label>
              <span className="text-sm font-medium text-[#0047BA]">
                {formData.importance} - {importanceLabels[formData.importance - 1]}
              </span>
            </div>
            <Slider
              value={[formData.importance]}
              onValueChange={([value]) => setFormData({ ...formData, importance: value })}
              min={1}
              max={5}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Deadline (Optional)</Label>
            <div className="flex flex-wrap gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal h-10 rounded-lg border-[#C7C9C7]/50"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#C7C9C7]" />
                    {formData.deadline ? format(formData.deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => setFormData({ ...formData, deadline: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {formData.deadline && (
                <>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={time.hour}
                      onChange={(e) => setTime({ ...time, hour: e.target.value })}
                      className="h-10 w-14 text-center rounded-lg border-[#C7C9C7]/50"
                    />
                    <span className="text-[#C7C9C7]">:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={time.minute}
                      onChange={(e) => setTime({ ...time, minute: e.target.value.padStart(2, '0') })}
                      className="h-10 w-14 text-center rounded-lg border-[#C7C9C7]/50"
                    />
                    <select
                      value={time.period}
                      onChange={(e) => setTime({ ...time, period: e.target.value })}
                      className="h-10 px-2 rounded-lg border border-[#C7C9C7]/50 bg-white text-sm"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormData({ ...formData, deadline: null })}
                    className="h-10 w-10 rounded-lg text-[#C7C9C7] hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Repeat</Label>
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#C7C9C7]" />
              <select
                value={formData.recurrence}
                onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                className="h-10 px-4 flex-1 rounded-lg border border-[#C7C9C7]/50 bg-white text-sm"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-24 border-[#C7C9C7]/50 focus:border-[#0047BA] focus:ring-[#0047BA] rounded-lg resize-none"
            />
          </div>

          {isEditing && <SubtaskList taskId={task.id} />}

          <div className="flex gap-3 pt-2">
            {isEditing && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg border-red-200 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure? This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteMutation.mutate()}
                      className="rounded-lg bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border-[#C7C9C7]/50 text-gray-600"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 rounded-lg bg-[#0047BA] hover:bg-[#003A99] text-white font-medium"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}