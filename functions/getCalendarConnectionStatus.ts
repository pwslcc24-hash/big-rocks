import { base44 } from './base44Client.js';

export default async function getCalendarConnectionStatus() {
  try {
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
    
    // Test the connection by fetching calendar info
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (response.ok) {
      const calendar = await response.json();
      return { 
        connected: true, 
        calendarName: calendar.summary,
        email: calendar.id
      };
    }
    
    return { connected: false };
  } catch (error) {
    return { connected: false };
  }
}