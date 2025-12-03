import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock, X, Repeat, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function TaskForm({ task, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    title: "",
    urgency: 3,
    importance: 3,
    deadline: null,
    notes: "",
    completed: false,
    recurrence: "none",
    sync_to_calendar: false
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
        completed: task.completed || false,
        recurrence: task.recurrence || "none",
        sync_to_calendar: task.sync_to_calendar || false
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
    }
  }, [task]);

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
          className="h-12 text-lg border-slate-200 focus:border-[#0047BA] focus:ring-[#0047BA] rounded-xl"
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
          <span className="text-sm font-semibold text-[#0047BA]">
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
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min="1"
                max="12"
                value={time.hour}
                onChange={(e) => setTime({ ...time, hour: e.target.value })}
                className="h-12 w-14 text-center rounded-xl border-slate-200"
                disabled={!formData.deadline}
              />
              <span className="text-slate-400">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                value={time.minute}
                onChange={(e) => setTime({ ...time, minute: e.target.value.padStart(2, '0') })}
                className="h-12 w-14 text-center rounded-xl border-slate-200"
                disabled={!formData.deadline}
              />
              <select
                value={time.period}
                onChange={(e) => setTime({ ...time, period: e.target.value })}
                className="h-12 px-2 rounded-xl border border-slate-200 bg-white text-sm"
                disabled={!formData.deadline}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
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
        <Label className="text-sm font-medium text-slate-700">Repeat</Label>
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-slate-400" />
          <select
            value={formData.recurrence}
            onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
            className="h-12 px-4 flex-1 rounded-xl border border-slate-200 bg-white text-sm"
          >
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {formData.deadline && (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-slate-500" />
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Sync to Google Calendar</Label>
                      <p className="text-xs text-slate-500">Add this task to your calendar</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.sync_to_calendar}
                    onCheckedChange={(checked) => setFormData({ ...formData, sync_to_calendar: checked })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-slate-700">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional details..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="min-h-32 border-slate-200 focus:border-[#0047BA] focus:ring-[#0047BA] rounded-xl resize-none"
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
          className="flex-1 h-12 rounded-xl bg-[#0047BA] hover:bg-[#003A99]"
          disabled={isLoading || !formData.title.trim()}
        >
          {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </motion.form>
  );
}