import { base44 } from './base44Client.js';
import syncTaskToCalendar from './syncTaskToCalendar.js';

export default async function syncTaskAfterSave({ taskId, action = 'create' }) {
  // Get the task
  const tasks = await base44.entities.Task.filter({ id: taskId });
  const task = tasks[0];
  
  if (!task) {
    return { success: false, message: 'Task not found' };
  }

  // Only sync if sync_to_calendar is enabled and task has a deadline
  if (!task.sync_to_calendar || !task.deadline) {
    return { success: true, message: 'Sync not required' };
  }

  try {
    const result = await syncTaskToCalendar({ task, action });
    
    // If we created a new event, save the event ID to the task
    if (result.success && result.eventId && !task.calendar_event_id) {
      await base44.entities.Task.update(taskId, { 
        calendar_event_id: result.eventId 
      });
    }

    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
}