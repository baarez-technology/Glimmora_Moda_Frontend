'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Crown,
  ClipboardList,
  Scissors,
  Search,
  Truck,
  CalendarCheck,
  Wrench,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { uhniService } from '@/services';
import type { ConciergeTask, ConciergeTaskType, ConciergeTaskPriority, ConciergeTaskStatus } from '@/types/uhni';

export default function ConciergeTasksPage() {
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [tasks, setTasks] = useState<ConciergeTask[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    uhniService.getConciergeTasks().then(res => {
      if (res.data) setTasks(res.data);
      setIsLoaded(true);
    });
  }, []);

  const toggleNotes = (taskId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const getTypeIcon = (type: ConciergeTaskType) => {
    switch (type) {
      case 'styling': return Scissors;
      case 'sourcing': return Search;
      case 'delivery': return Truck;
      case 'reservation': return CalendarCheck;
      case 'alteration': return Wrench;
    }
  };

  const getTypeBadge = (type: ConciergeTaskType) => {
    switch (type) {
      case 'styling': return 'bg-purple-100 text-purple-700';
      case 'sourcing': return 'bg-info/10 text-info';
      case 'delivery': return 'bg-green-100 text-green-700';
      case 'reservation': return 'bg-gold-soft/20 text-gold-deep';
      case 'alteration': return 'bg-champagne/30 text-gold-muted';
    }
  };

  const getPriorityBadge = (priority: ConciergeTaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-error/10 text-error';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-info/10 text-info';
      case 'low': return 'bg-success/10 text-success';
    }
  };

  const getStatusLabel = (status: ConciergeTaskStatus) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusGroups: { status: ConciergeTaskStatus; label: string }[] = [
    { status: 'in_progress', label: 'In Progress' },
    { status: 'pending', label: 'Pending' },
    { status: 'completed', label: 'Completed' },
  ];

  const groupedTasks = statusGroups.map(group => ({
    ...group,
    tasks: tasks.filter(t => t.status === group.status),
  })).filter(group => group.tasks.length > 0);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Crown size={16} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                UHNI Exclusive
              </span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Concierge Tasks
            </h1>
            <p className="text-sand mt-3">Personal concierge execution tracking</p>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Task Groups */}
        {groupedTasks.map(group => (
          <div key={group.status} className="mb-12">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">
              {group.label} ({group.tasks.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.tasks.map(task => {
                const TypeIcon = getTypeIcon(task.type);
                const isExpanded = expandedNotes.has(task.id);
                return (
                  <div key={task.id} className="bg-white border border-sand/30 p-6 flex flex-col">
                    {/* Badges */}
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase inline-flex items-center gap-1.5 ${getTypeBadge(task.type)}`}>
                        <TypeIcon size={12} />
                        {task.type}
                      </span>
                      <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getPriorityBadge(task.priority)}`}>
                        {task.priority === 'urgent' && <AlertCircle size={12} className="inline mr-1" />}
                        {task.priority}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-display text-lg text-charcoal-deep mb-2">{task.title}</h3>
                    <p className="text-sm text-stone leading-relaxed mb-4">{task.description}</p>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4 mt-auto">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-stone" />
                        <p className="text-xs text-stone">
                          Assigned to <span className="text-charcoal-deep font-medium">{task.assignedTo}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-stone" />
                        <p className="text-xs text-stone">
                          Due {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>

                    {/* Notes Toggle */}
                    {task.notes.length > 0 && (
                      <div className="border-t border-sand/30 pt-4">
                        <button
                          onClick={() => toggleNotes(task.id)}
                          className="flex items-center gap-2 text-xs text-stone hover:text-charcoal-deep transition-colors w-full"
                        >
                          <MessageSquare size={14} />
                          <span>{task.notes.length} note{task.notes.length !== 1 ? 's' : ''}</span>
                          {isExpanded ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
                        </button>
                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {task.notes.map((note, index) => (
                              <div key={index} className="bg-parchment p-3">
                                <p className="text-xs text-charcoal-deep leading-relaxed">{note}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {tasks.length === 0 && isLoaded && (
          <div className="text-center py-16">
            <ClipboardList size={40} className="text-stone/40 mx-auto mb-4" />
            <p className="text-stone">No concierge tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}
