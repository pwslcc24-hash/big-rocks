import React, { useState } from 'react';
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
import { Trash2, UserPlus, X, Pencil, Check, Star } from "lucide-react";
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

export default function ManageListDialog({ open, onClose, list, user }) {
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(list?.name || "");

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.TaskList.update(list.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskLists'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.TaskList.delete(list.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskLists'] });
      onClose();
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

  if (!list) return null;

  const isOwner = user?.email === list.owner_email;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-lg bg-white border-[#C7C9C7]/30">
        <DialogHeader>
          <DialogTitle className="text-[#0047BA] font-semibold">Manage List</DialogTitle>
        </DialogHeader>

        {!isOwner ? (
          <p className="text-[#C7C9C7]">Only the list owner can manage this list.</p>
        ) : (
          <div className="space-y-5">
            {/* List Name */}
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-lg font-semibold rounded-lg border-[#C7C9C7]/50"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editedName.trim()) {
                        updateMutation.mutate({ name: editedName.trim() });
                        setIsEditingName(false);
                      }
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setEditedName(list.name);
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={() => {
                      if (editedName.trim()) {
                        updateMutation.mutate({ name: editedName.trim() });
                        setIsEditingName(false);
                      }
                    }}
                    className="rounded-lg bg-[#0047BA] hover:bg-[#003A99]"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setIsEditingName(false);
                      setEditedName(list.name);
                    }}
                    className="rounded-lg border-[#C7C9C7]/50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">{list.name}</h2>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditedName(list.name);
                      setIsEditingName(true);
                    }}
                    className="h-8 w-8 text-[#C7C9C7] hover:text-[#0047BA]"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Set as default */}
            <div className="flex items-center justify-between p-4 bg-[#C7C9C7]/10 rounded-lg">
              <div>
                <p className="font-medium text-gray-700">Default List</p>
                <p className="text-sm text-[#C7C9C7]">Opens on login</p>
              </div>
              <Button
                variant={user?.default_list_id === list.id ? "default" : "outline"}
                onClick={async () => {
                  await base44.auth.updateMe({ 
                    default_list_id: user?.default_list_id === list.id ? null : list.id 
                  });
                  queryClient.invalidateQueries({ queryKey: ['currentUser'] });
                }}
                className={`rounded-lg ${user?.default_list_id === list.id ? 'bg-[#0047BA] hover:bg-[#003A99] text-white' : 'border-[#C7C9C7]/50'}`}
              >
                <Star className={`w-4 h-4 mr-2 ${user?.default_list_id === list.id ? 'fill-current' : ''}`} />
                {user?.default_list_id === list.id ? 'Default' : 'Set Default'}
              </Button>
            </div>

            {/* Share with users */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Share with Others</h3>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email..."
                  className="rounded-lg border-[#C7C9C7]/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                />
                <Button 
                  onClick={handleAddUser}
                  className="rounded-lg bg-[#0047BA] hover:bg-[#003A99]"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>

              {list.shared_with && list.shared_with.length > 0 ? (
                <div className="space-y-2">
                  {list.shared_with.map(email => (
                    <div key={email} className="flex items-center justify-between bg-[#C7C9C7]/10 rounded-lg p-3">
                      <span className="text-gray-700 text-sm">{email}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveUser(email)}
                        className="h-7 w-7 text-[#C7C9C7] hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#C7C9C7] text-sm">No one else has access yet.</p>
              )}
            </div>

            {/* Delete list */}
            <div className="pt-4 border-t border-[#C7C9C7]/20">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full rounded-lg border-red-200 text-red-500 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete List
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete List</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{list.name}" and all its tasks.
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
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}