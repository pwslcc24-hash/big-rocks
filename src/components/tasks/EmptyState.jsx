import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-indigo-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">No tasks yet</h3>
      <p className="text-slate-500 text-center mb-6 max-w-sm">
        Start organizing your day by creating your first task
      </p>
      <Link to={createPageUrl("AddTask")}>
        <Button className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Your First Task
        </Button>
      </Link>
    </motion.div>
  );
}