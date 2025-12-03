import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, Calendar, CheckCircle2, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CalendarSettings() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const status = await base44.functions.getCalendarConnectionStatus();
      setConnectionStatus(status);
    } catch (error) {
      setConnectionStatus({ connected: false });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await base44.connectors.connect('googlecalendar');
      await checkConnection();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
    setIsConnecting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" className="mb-6 -ml-2 text-slate-600 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100">
              <h1 className="text-2xl font-bold text-[#0047BA]">Calendar Integration</h1>
              <p className="text-slate-500 mt-1">Sync your tasks with Google Calendar</p>
            </div>

            <div className="p-6 sm:p-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0047BA]" />
                </div>
              ) : connectionStatus?.connected ? (
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800">Connected</h3>
                        <p className="text-sm text-green-600">{connectionStatus.email}</p>
                      </div>
                    </div>
                    <p className="text-sm text-green-700">
                      Calendar: {connectionStatus.calendarName}
                    </p>
                  </div>

                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      Tasks with deadlines can now be synced to your Google Calendar. 
                      Enable "Sync to Calendar" when creating or editing a task.
                    </AlertDescription>
                  </Alert>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://calendar.google.com', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Google Calendar
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">Not Connected</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Connect your Google Calendar to sync tasks with deadlines automatically.
                    </p>
                    <Button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="bg-[#0047BA] hover:bg-[#003A99]"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Connect Google Calendar
                        </>
                      )}
                    </Button>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Connecting allows you to sync tasks with deadlines to your calendar and view them alongside your other events.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}