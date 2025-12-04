import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function EmptyState({ onAddTask }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-16 h-16 rounded-full bg-[#0047BA]/10 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-8 h-8 text-[#0047BA]" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">No tasks yet</h3>
      <p className="text-[#C7C9C7] text-center mb-6 max-w-sm">
        Start organizing your day by creating your first task
      </p>
      <Button 
        onClick={onAddTask}
        className="h-10 px-6 rounded-lg bg-[#0047BA] hover:bg-[#003A99] text-white font-medium"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Your First Task
      </Button>
    </motion.div>
  );
}