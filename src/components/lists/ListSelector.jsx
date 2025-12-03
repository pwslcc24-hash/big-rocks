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
import { ChevronDown, Plus, Users, Settings, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ListSelector({ currentList, onListChange, userEmail }) {
  const [showNewListDialog, setShowNewListDialog] = useState(false);
  const [newListName, setNewListName] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const setDefaultMutation = useMutation({
    mutationFn: (listId) => base44.auth.updateMe({ default_list_id: listId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currentUser'] })
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

  const myLists = lists.filter(l => l.owner_email === userEmail && !l.is_personal);
  const sharedWithMe = lists.filter(l => l.owner_email !== userEmail);

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 px-3 rounded-xl border-slate-200">
              <Users className="w-4 h-4 mr-2 text-[#0047BA]" />
              <span className="max-w-[120px] truncate">{currentList?.name || "Select List"}</span>
              <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {myLists.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-slate-500">My Lists</div>
                {myLists.map(list => (
                  <DropdownMenuItem 
                    key={list.id} 
                    onClick={() => onListChange(list)}
                    className="cursor-pointer"
                  >
                    <Users className="w-4 h-4 mr-2 text-[#0047BA]" />
                    {list.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            {sharedWithMe.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-medium text-slate-500">Shared with Me</div>
                {sharedWithMe.map(list => (
                  <DropdownMenuItem 
                    key={list.id} 
                    onClick={() => onListChange(list)}
                    className="cursor-pointer"
                  >
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    {list.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowNewListDialog(true)} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Create New List
            </DropdownMenuItem>
            {currentList && (
              <DropdownMenuItem 
                onClick={() => setDefaultMutation.mutate(currentList.id)}
                className="cursor-pointer"
                disabled={user?.default_list_id === currentList.id}
              >
                <Star className={`w-4 h-4 mr-2 ${user?.default_list_id === currentList.id ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                {user?.default_list_id === currentList.id ? 'Default List' : 'Set as Default'}
              </DropdownMenuItem>
            )}
            {currentList && currentList.owner_email === userEmail && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to={createPageUrl(`ManageList?id=${currentList.id}`)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage List
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showNewListDialog} onOpenChange={setShowNewListDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <Input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name..."
            className="rounded-xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewListDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateList} 
              disabled={!newListName.trim() || createListMutation.isPending}
              className="rounded-xl bg-[#0047BA] hover:bg-[#003A99]"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}