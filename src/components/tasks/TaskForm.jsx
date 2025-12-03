import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function TaskForm({ task, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    title: "",
    urgency: 3,
    importance: 3,
    deadline: null,
    notes: "",
    completed: false
  });
  const [time, setTime] = useState("12:00");

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        urgency: task.urgency || 3,
        importance: task.importance || 3,
        deadline: task.deadline ? new Date(task.deadline) : null,
        notes: task.notes || "",
        completed: task.completed || false
      });
      if (task.deadline) {
        setTime(format(new Date(task.deadline), "HH:mm"));
      }
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (formData.deadline && time) {
      const [hours, minutes] = time.split(":");
      const deadline = new Date(formData.deadline);
      deadline.setHours(parseInt(hours), parseInt(minutes));
      submitData.deadline = deadline.toISOString();
    } else if (!formData.deadline) {
      submitData.deadline = null;
    }
    onSubmit(submitData);
  };

  const urgencyLabels = ["Very Low", "Low", "Medium", "High", "Critical"];
  const importanceLabels = ["Minor", "Low", "Moderate", "High", "Essential"];

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-slate-700">Task Title</Label>
        <Input
          id="title"
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="h-12 text-lg border-slate-200 focus:border-[#002E5D] focus:ring-[#002E5D] rounded-xl"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-700">Urgency</Label>
          <span className="text-sm font-semibold text-orange-600">
            {formData.urgency} - {urgencyLabels[formData.urgency - 1]}
          </span>
        </div>
        <div className="px-2">
          <Slider
            value={[formData.urgency]}
            onValueChange={([value]) => setFormData({ ...formData, urgency: value })}
            min={1}
            max={5}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-700">Importance</Label>
          <span className="text-sm font-semibold text-[#002E5D]">
            {formData.importance} - {importanceLabels[formData.importance - 1]}
          </span>
        </div>
        <div className="px-2">
          <Slider
            value={[formData.importance]}
            onValueChange={([value]) => setFormData({ ...formData, importance: value })}
            min={1}
            max={5}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Deadline (Optional)</Label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 justify-start text-left font-normal h-12 rounded-xl border-slate-200"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                {formData.deadline ? format(formData.deadline, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.deadline}
                onSelect={(date) => setFormData({ ...formData, deadline: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-32">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 pl-10 rounded-xl border-slate-200"
                disabled={!formData.deadline}
              />
            </div>
            {formData.deadline && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFormData({ ...formData, deadline: null })}
                className="h-12 w-12 rounded-xl text-slate-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-slate-700">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional details..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="min-h-32 border-slate-200 focus:border-[#002E5D] focus:ring-[#002E5D] rounded-xl resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl border-slate-200"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 rounded-xl bg-[#002E5D] hover:bg-[#001F3F]"
          disabled={isLoading || !formData.title.trim()}
        >
          {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </motion.form>
  );
}