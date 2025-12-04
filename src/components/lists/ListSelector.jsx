import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronDown, Plus, Users, User, Settings } from "lucide-react";
import ManageListDialog from "./ManageListDialog";

export default function ListSelector({ currentList, onListChange, userEmail }) {
  const [showNewListDialog, setShowNewListDialog] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [manageListDialog, setManageListDialog] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: lists = [] } = useQuery({
    queryKey: ['taskLists', userEmail],
    queryFn: async () => {
      const allLists = await base44.entities.TaskList.list();
      // Filter to lists user owns or is shared with
      return allLists.filter(list => 
        list.owner_email === userEmail || 
        (list.shared_with && list.shared_with.includes(userEmail))
      );
    },
    enabled: !!userEmail
  });

  const createListMutation = useMutation({
    mutationFn: (data) => base44.entities.TaskList.create(data),
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: ['taskLists'] });
      setShowNewListDialog(false);
      setNewListName("");
      onListChange(newList);
    }
  });

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    createListMutation.mutate({
      name: newListName.trim(),
      owner_email: userEmail,
      shared_with: [],
      is_personal: false
    });
  };

  const myLists = lists.filter(l => l.owner_email === userEmail);
  const sharedWithMe = lists.filter(l => l.owner_email !== userEmail);

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 px-3 rounded-lg border-[#C7C9C7]/50 bg-white">
              {currentList?.is_personal ? (
                <User className="w-4 h-4 mr-2 text-[#C7C9C7]" />
              ) : (
                <Users className="w-4 h-4 mr-2 text-[#0047BA]" />
              )}
              <span className="max-w-[120px] truncate text-gray-700">{currentList?.name || "Select List"}</span>
              <ChevronDown className="w-4 h-4 ml-2 text-[#C7C9C7]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-lg border-[#C7C9C7]/30">
            {myLists.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#C7C9C7]">My Lists</div>
                {myLists.map(list => (
                        <DropdownMenuItem 
                          key={list.id} 
                          onClick={() => onListChange(list)}
                          className="cursor-pointer flex items-center justify-between rounded-md"
                        >
                          <div className="flex items-center">
                            {list.is_personal ? (
                              <User className="w-4 h-4 mr-2 text-[#C7C9C7]" />
                            ) : (
                              <Users className="w-4 h-4 mr-2 text-[#0047BA]" />
                            )}
                            {list.name}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setManageListDialog(list);
                            }}
                            className="ml-2 p-1 hover:bg-[#C7C9C7]/20 rounded"
                          >
                            <Settings className="w-3.5 h-3.5 text-[#C7C9C7] hover:text-[#0047BA]" />
                          </button>
                        </DropdownMenuItem>
                      ))}
              </>
            )}
            {sharedWithMe.length > 0 && (
              <>
                <DropdownMenuSeparator className="bg-[#C7C9C7]/30" />
                <div className="px-2 py-1.5 text-xs font-medium text-[#C7C9C7]">Shared with Me</div>
                {sharedWithMe.map(list => (
                  <DropdownMenuItem 
                    key={list.id} 
                    onClick={() => onListChange(list)}
                    className="cursor-pointer rounded-md"
                  >
                    <Users className="w-4 h-4 mr-2 text-[#0047BA]/60" />
                    {list.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            <DropdownMenuSeparator className="bg-[#C7C9C7]/30" />
            <DropdownMenuItem onClick={() => setShowNewListDialog(true)} className="cursor-pointer rounded-md text-[#0047BA]">
              <Plus className="w-4 h-4 mr-2" />
              Create New List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showNewListDialog} onOpenChange={setShowNewListDialog}>
        <DialogContent className="rounded-lg bg-white border-[#C7C9C7]/30">
          <DialogHeader>
            <DialogTitle className="text-[#0047BA] font-semibold">Create New List</DialogTitle>
          </DialogHeader>
          <Input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name..."
            className="rounded-lg border-[#C7C9C7]/50"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewListDialog(false)} className="rounded-lg border-[#C7C9C7]/50 text-gray-600">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateList} 
              disabled={!newListName.trim() || createListMutation.isPending}
              className="rounded-lg bg-[#0047BA] hover:bg-[#003A99] text-white font-medium"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManageListDialog
        open={!!manageListDialog}
        onClose={() => setManageListDialog(null)}
        list={manageListDialog}
        user={user}
      />
    </>
  );
}