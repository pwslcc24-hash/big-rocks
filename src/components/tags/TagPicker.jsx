import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tag, Plus, Check } from "lucide-react";
import TagBadge from "./TagBadge";

const TAG_COLORS = [
  // Row 1 - Vibrant
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
  // Row 2 - Muted/Pastel
  "#FCA5A5", "#FDBA74", "#FCD34D", "#FDE047", "#BEF264", "#86EFAC", "#6EE7B7", "#5EEAD4", "#67E8F9", "#7DD3FC", "#93C5FD", "#A5B4FC", "#C4B5FD", "#D8B4FE", "#F0ABFC", "#F9A8D4",
];

function getRandomColor(existingColors) {
  const availableColors = TAG_COLORS.filter(c => !existingColors.includes(c));
  if (availableColors.length > 0) {
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

export default function TagPicker({ selectedTagIds = [], onChange, userEmail }) {
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: tags = [] } = useQuery({
    queryKey: ['tags', userEmail],
    queryFn: async () => {
      const allTags = await base44.entities.Tag.list();
      return allTags.filter(tag => tag.owner_email === userEmail);
    },
    enabled: !!userEmail
  });

  const createTagMutation = useMutation({
    mutationFn: (data) => base44.entities.Tag.create(data),
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      onChange([...selectedTagIds, newTag.id]);
      setNewTagName("");
      setSelectedColor(null);
      setShowCreateForm(false);
    }
  });

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    const existingColors = tags.map(t => t.color);
    const color = selectedColor || getRandomColor(existingColors);
    createTagMutation.mutate({
      name: newTagName.trim(),
      color,
      owner_email: userEmail
    });
  };

  const toggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const selectedTags = tags.filter(t => selectedTagIds.includes(t.id));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {selectedTags.map(tag => (
          <TagBadge 
            key={tag.id} 
            tag={tag} 
            onRemove={(id) => onChange(selectedTagIds.filter(tid => tid !== id))}
            size="md"
          />
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 rounded-full border-dashed border-[#C7C9C7]/50 text-[#C7C9C7] hover:text-[#0047BA] hover:border-[#0047BA]"
            >
              <Tag className="w-3 h-3 mr-1" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 rounded-lg" align="start">
            {!showCreateForm ? (
              <div className="space-y-2">
                {tags.length > 0 && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <TagBadge tag={tag} size="md" />
                        {selectedTagIds.includes(tag.id) && (
                          <Check className="w-4 h-4 text-[#0047BA]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full justify-start text-[#0047BA] hover:bg-[#0047BA]/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Tag
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="h-8 text-sm rounded-md border-[#C7C9C7]/50"
                  autoFocus
                />
                <div className="grid grid-cols-8 gap-1.5">
                  {TAG_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-5 h-5 rounded-full transition-all ${
                        selectedColor === color ? 'ring-2 ring-offset-1 ring-[#0047BA]' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewTagName("");
                      setSelectedColor(null);
                    }}
                    className="flex-1 h-8 rounded-md"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || createTagMutation.isPending}
                    className="flex-1 h-8 rounded-md bg-[#0047BA] hover:bg-[#003A99]"
                  >
                    Create
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}