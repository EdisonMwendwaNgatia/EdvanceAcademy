"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Lesson, Milestone } from "@/types/lesson";

interface Props {
  id: string;
  type: 'milestone' | 'lesson';
  data: Lesson | Milestone;
  isSelected: boolean;
  onSelect: () => void;
  onDeleteMilestone?: (milestoneId: string) => void;
}

export default function DraggableLessonItem({ 
  id, 
  type, 
  data, 
  isSelected, 
  onSelect,
  onDeleteMilestone 
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const stripHtml = (html: string) => {
    if (!html) return "Untitled";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "Untitled";
  };

  const displayTitle = type === 'milestone' 
    ? `🎯 ${(data as Milestone).title}`
    : stripHtml((data as Lesson).title) || "Untitled Lesson";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the item when clicking delete
    if (type === 'milestone' && onDeleteMilestone) {
      if (confirm(`Delete milestone "${(data as Milestone).title}"?`)) {
        onDeleteMilestone(id);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 p-2 border rounded cursor-pointer transition-all ${
        isSelected 
          ? type === 'milestone' 
            ? "bg-purple-50 border-purple-300" 
            : "bg-blue-50 border-blue-300"
          : "bg-white hover:bg-gray-50"
      } ${type === 'milestone' ? "border-l-4 border-l-purple-500" : ""}`}
      onClick={onSelect}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="flex-1">
        <p className={`text-sm font-medium ${type === 'milestone' ? 'text-purple-700' : ''}`}>
          {displayTitle}
        </p>
        {type === 'milestone' && (
          <p className="text-xs text-purple-500 mt-0.5">Milestone</p>
        )}
      </div>

      {/* Delete button for milestones */}
      {type === 'milestone' && onDeleteMilestone && (
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-500"
          title="Delete milestone"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}