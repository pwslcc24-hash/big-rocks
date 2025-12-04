import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, Trash2, UserPlus, X, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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

export default function ManageList() {
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: list, isLoading } = useQuery({
    queryKey: ['taskList', listId],
    queryFn: async () => {
      const lists = await base44.entities.TaskList.filter({ id: listId });
      return lists[0];
    },
    enabled: !!listId
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.TaskList.update(listId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taskList', listId] })
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.TaskList.delete(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskLists'] });
      navigate(createPageUrl("Home"));
    }
  });

  const handleAddUser = () => {
    if (!newEmail.trim()) return;
    const currentShared = list.shared_with || [];
    if (!currentShared.includes(newEmail.trim())) {
      updateMutation.mutate({ shared_with: [...currentShared, newEmail.trim()] });
    }
    setNewEmail("");
  };

  const handleRemoveUser = (email) => {
    const currentShared = list.shared_with || [];
    updateMutation.mutate({ shared_with: currentShared.filter(e => e !== email) });
  };

  if (isLoading || !list) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-8">Loading...</div>;
  }

  const isOwner = user?.email === list.owner_email;

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-4">Only the list owner can manage this list.</p>
          <Link to={createPageUrl("Home")}>
            <Button variant="outline">Go back</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" className="mb-6 -ml-2 text-slate-600 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-[#0047BA] mb-6">Manage "{list.name}"</h1>

            {/* Share with users */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Share with Others</h2>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="rounded-xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                />
                <Button 
                  onClick={handleAddUser}
                  className="rounded-xl bg-[#0047BA] hover:bg-[#003A99]"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>

              {list.shared_with && list.shared_with.length > 0 ? (
                <div className="space-y-2">
                  {list.shared_with.map(email => (
                    <div key={email} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                      <span className="text-slate-700">{email}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveUser(email)}
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No one else has access to this list yet.</p>
              )}
            </div>

            {/* Delete list */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
              <p className="text-slate-500 text-sm mb-4">Deleting this list will remove all tasks in it.</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete List
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete List</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure? This will permanently delete "{list.name}" and all its tasks.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteMutation.mutate()}
                      className="rounded-xl bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}