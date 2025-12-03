import { base44 } from './base44Client.js';

export default async function syncTaskToCalendar({ task, action = 'create' }) {
  const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
  
  const baseUrl = 'https://www.googleapis.com/calendar/v3';
  
  if (action === 'create' || action === 'update') {
    // Create/update calendar event
    const event = {
      summary: task.title,
      description: task.notes || '',
      start: {
        dateTime: task.deadline,
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(new Date(task.deadline).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
        timeZone: 'UTC'
      },
      extendedProperties: {
        private: {
          taskId: task.id
        }
      }
    };

    if (task.recurrence && task.recurrence !== 'none') {
      const recurrenceMap = {
        daily: 'RRULE:FREQ=DAILY',
        weekly: 'RRULE:FREQ=WEEKLY',
        monthly: 'RRULE:FREQ=MONTHLY',
        yearly: 'RRULE:FREQ=YEARLY'
      };
      event.recurrence = [recurrenceMap[task.recurrence]];
    }

    let url = `${baseUrl}/calendars/primary/events`;
    let method = 'POST';

    // If updating and we have a calendar event ID
    if (action === 'update' && task.calendar_event_id) {
      url = `${baseUrl}/calendars/primary/events/${task.calendar_event_id}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to sync event: ${error}`);
    }

    const createdEvent = await response.json();
    return { success: true, eventId: createdEvent.id, eventLink: createdEvent.htmlLink };
  }

  if (action === 'delete' && task.calendar_event_id) {
    const response = await fetch(
      `${baseUrl}/calendars/primary/events/${task.calendar_event_id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Failed to delete event: ${error}`);
    }

    return { success: true };
  }

  return { success: false, message: 'Invalid action' };
}