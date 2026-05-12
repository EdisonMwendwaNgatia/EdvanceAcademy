"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { CourseItem } from "@/types/lesson";
import DraggableLessonItem from "./DraggableLessonItem";
import { Plus, Flag, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  items: CourseItem[];
  selectedId?: string | null;
  onSelect: (item: CourseItem) => void;
  onReorder: (items: CourseItem[]) => void;
  onAddMilestone: (position: number) => void;
  onDeleteMilestone: (milestoneId: string) => void;
}

export default function DraggableSidebar({
  items,
  selectedId,
  onSelect,
  onReorder,
  onAddMilestone,
  onDeleteMilestone,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Track expanded sections by a composite key that resets when items change
  const [expandedSectionKeys, setExpandedSectionKeys] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        display_order: index,
      }));
      
      onReorder(updatedItems);
    }
  };

  // Generate a unique key for each section that includes the items length
  // This way when items change (milestone added/deleted), the key changes and sections reset
  const getSectionKey = (index: number) => {
    return `${index}-${items.length}-${items.map(i => i.id).join(',')}`;
  };

  const toggleSection = (index: number) => {
    const sectionKey = getSectionKey(index);
    const newExpanded = new Set(expandedSectionKeys);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSectionKeys(newExpanded);
  };

  const isSectionExpanded = (index: number) => {
    return expandedSectionKeys.has(getSectionKey(index));
  };

  const activeItem = activeId ? items.find(item => item.id === activeId) : null;

  // Check if we can add a milestone after a specific index
  const canAddMilestoneAfter = (index: number) => {
    // If this is the last item, we can add milestone at the end
    if (index === items.length - 1) return true;
    
    // Check if the next item is a milestone
    const nextItem = items[index + 1];
    return nextItem?.type !== 'milestone';
  };

  // Handle adding milestone
  const handleAddMilestone = (position: number) => {
    onAddMilestone(position);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-gray-900 mb-2">Course Content</h3>
        <p className="text-xs text-gray-500">Drag items to reorder</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item, index) => (
              <div key={item.id} className="mb-2">
                <DraggableLessonItem
                  id={item.id}
                  type={item.type}
                  data={item.data}
                  isSelected={selectedId === item.id}
                  onSelect={() => onSelect(item)}
                  onDeleteMilestone={item.type === 'milestone' ? onDeleteMilestone : undefined}
                />
                
                {/* Only show "Add milestone after" if we can add one here AND the next item is not a milestone */}
                {item.type !== 'milestone' && canAddMilestoneAfter(index) && (
                  <div className="mt-1">
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full flex items-center justify-center gap-1 text-xs 
                               text-gray-400 hover:text-purple-500 transition py-1"
                    >
                      {isSectionExpanded(index) ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      <span>Add milestone after this lesson</span>
                    </button>
                    
                    {isSectionExpanded(index) && (
                      <div className="mt-1 p-2 bg-purple-50 rounded-lg border border-purple-200">
                        <button
                          onClick={() => handleAddMilestone(index + 1)}
                          className="w-full flex items-center justify-center gap-2 
                                   text-purple-700 text-sm py-1 hover:bg-purple-100 
                                   rounded transition"
                        >
                          <Plus className="w-4 h-4" />
                          Insert Milestone Here
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </SortableContext>
          
          <DragOverlay>
            {activeItem ? (
              <div className="bg-white border-2 border-blue-400 rounded shadow-lg">
                <DraggableLessonItem
                  id={activeItem.id}
                  type={activeItem.type}
                  data={activeItem.data}
                  isSelected={false}
                  onSelect={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}