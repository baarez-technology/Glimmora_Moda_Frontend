'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  AlertCircle,
  Plus,
  CheckCircle,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { ConciergeTask, ConciergeTaskType, ConciergeTaskPriority, ConciergeTaskStatus, ConciergeAppointment, AppointmentType } from '@/types/uhni';

type TabValue = 'tasks' | 'appointments';

export default function ConciergeTasksPage() {
  const router = useRouter();
  const {
    showToast,
    conciergeTasks,
    addConciergeTask,
    completeConciergeTask,
    conciergeAppointments,
    cancelAppointment,
    rescheduleAppointment,
    concierge,
  } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabValue>('tasks');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showSummaryAppt, setShowSummaryAppt] = useState<ConciergeAppointment | null>(null);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<ConciergeTaskType>('styling');
  const [taskPriority, setTaskPriority] = useState<ConciergeTaskPriority>('normal');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskInstructions, setTaskInstructions] = useState('');

  // Reschedule modal state
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  useEffect(() => {
    setIsLoaded(true);
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
      case 'normal': return 'bg-taupe/20 text-stone';
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

  const getAppointmentTypeLabel = (type: AppointmentType) => {
    switch (type) {
      case 'styling_session': return 'Styling Session';
      case 'private_viewing': return 'Private Viewing';
      case 'consultation': return 'Consultation';
      case 'fitting': return 'Fitting';
    }
  };

  const getAppointmentStatusBadge = (status: ConciergeAppointment['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-info/10 text-info';
      case 'completed': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-error/10 text-error';
      case 'rescheduled': return 'bg-warning/10 text-warning';
    }
  };

  const handleCreateTask = () => {
    if (!taskTitle || !taskDescription || !taskDueDate) return;
    addConciergeTask({
      title: taskTitle,
      description: taskDescription,
      type: taskType,
      priority: taskPriority,
      dueDate: taskDueDate,
      clientInstructions: taskInstructions || undefined,
    });
    setTaskTitle('');
    setTaskDescription('');
    setTaskType('styling');
    setTaskPriority('normal');
    setTaskDueDate('');
    setTaskInstructions('');
    setShowNewTaskForm(false);
  };

  const handleReschedule = () => {
    if (!rescheduleId || !rescheduleDate || !rescheduleTime) return;
    rescheduleAppointment(rescheduleId, rescheduleDate, rescheduleTime);
    setRescheduleId(null);
    setRescheduleDate('');
    setRescheduleTime('');
  };

  const statusGroups: { status: ConciergeTaskStatus; label: string }[] = [
    { status: 'in_progress', label: 'In Progress' },
    { status: 'pending', label: 'Pending' },
    { status: 'completed', label: 'Completed' },
  ];

  const groupedTasks = statusGroups.map(group => ({
    ...group,
    tasks: conciergeTasks.filter(t => t.status === group.status),
  })).filter(group => group.tasks.length > 0);

  const upcomingAppts = conciergeAppointments.filter(a => a.status === 'upcoming' || a.status === 'rescheduled');
  const pastAppts = conciergeAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  const tabs: { value: TabValue; label: string; count: number }[] = [
    { value: 'tasks', label: 'Tasks', count: conciergeTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length },
    { value: 'appointments', label: 'Appointments', count: upcomingAppts.length },
  ];

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

            <Link
              href="/profile/styling-sessions"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gold-soft/20 text-gold-soft hover:bg-gold-soft/30 transition-colors text-xs tracking-[0.15em] uppercase"
            >
              <Scissors size={14} />
              Styling Sessions
            </Link>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-parchment p-1 w-fit mb-8">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-6 py-2.5 text-xs tracking-[0.1em] uppercase transition-colors flex items-center gap-2 ${
                activeTab === tab.value
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] ${activeTab === tab.value ? 'text-taupe' : 'text-taupe/60'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            {/* New Task Button */}
            <div className="mb-8">
              {!showNewTaskForm ? (
                <button
                  onClick={() => setShowNewTaskForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                >
                  <Plus size={16} />
                  New Task
                </button>
              ) : (
                <div className="bg-white border border-sand/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-lg text-charcoal-deep">Create New Task</h3>
                    <button onClick={() => setShowNewTaskForm(false)} className="text-stone hover:text-charcoal-deep">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Title *</label>
                      <input
                        type="text"
                        value={taskTitle}
                        onChange={e => setTaskTitle(e.target.value)}
                        placeholder="e.g., Source vintage Chanel jacket"
                        className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Description *</label>
                      <textarea
                        value={taskDescription}
                        onChange={e => setTaskDescription(e.target.value)}
                        placeholder="Describe what you need..."
                        rows={3}
                        className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Type</label>
                        <select
                          value={taskType}
                          onChange={e => setTaskType(e.target.value as ConciergeTaskType)}
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                        >
                          <option value="styling">Styling</option>
                          <option value="sourcing">Sourcing</option>
                          <option value="delivery">Delivery</option>
                          <option value="reservation">Reservation</option>
                          <option value="alteration">Alteration</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Priority</label>
                        <select
                          value={taskPriority}
                          onChange={e => setTaskPriority(e.target.value as ConciergeTaskPriority)}
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Due Date *</label>
                        <input
                          type="date"
                          value={taskDueDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => setTaskDueDate(e.target.value)}
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Instructions (Optional)</label>
                      <textarea
                        value={taskInstructions}
                        onChange={e => setTaskInstructions(e.target.value)}
                        placeholder="Special instructions for the concierge..."
                        rows={2}
                        className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowNewTaskForm(false)}
                        className="px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateTask}
                        disabled={!taskTitle || !taskDescription || !taskDueDate}
                        className="px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Create Task
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

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

                        {/* Client Instructions */}
                        {task.clientInstructions && (
                          <div className="bg-gold-soft/10 p-3 mb-4">
                            <p className="text-[10px] tracking-[0.15em] uppercase text-gold-deep mb-1">Client Instructions</p>
                            <p className="text-xs text-charcoal-deep">{task.clientInstructions}</p>
                          </div>
                        )}

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

                        {/* Complete Button */}
                        {(task.status === 'pending' || task.status === 'in_progress') && (
                          <button
                            onClick={() => completeConciergeTask(task.id)}
                            className="flex items-center justify-center gap-2 w-full py-2.5 border border-success/30 text-success text-sm hover:bg-success/10 transition-colors mb-4"
                          >
                            <CheckCircle size={14} />
                            Mark Complete
                          </button>
                        )}

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

            {conciergeTasks.length === 0 && (
              <div className="text-center py-16">
                <ClipboardList size={40} className="text-stone/40 mx-auto mb-4" />
                <p className="text-stone">No concierge tasks found</p>
                <button
                  onClick={() => setShowNewTaskForm(true)}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                >
                  <Plus size={16} />
                  Create Your First Task
                </button>
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            {/* Upcoming */}
            {upcomingAppts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">
                  Upcoming ({upcomingAppts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingAppts.map(appt => (
                    <div key={appt.id} className="bg-white border border-sand/30 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getAppointmentStatusBadge(appt.status)}`}>
                          {appt.status}
                        </span>
                      </div>
                      <h3 className="font-display text-lg text-charcoal-deep mb-1">{appt.title}</h3>
                      <p className="text-xs text-taupe mb-4">{getAppointmentTypeLabel(appt.type)}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-charcoal-deep">
                          <Calendar size={14} className="text-stone" />
                          {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-charcoal-deep">
                          <Clock size={14} className="text-stone" />
                          {appt.time} · {appt.duration} minutes
                        </div>
                        <div className="flex items-center gap-2 text-sm text-charcoal-deep">
                          <User size={14} className="text-stone" />
                          {appt.conciergeName}
                        </div>
                      </div>

                      {appt.notes && (
                        <div className="bg-parchment p-3 mb-4">
                          <p className="text-xs text-charcoal-deep">{appt.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setRescheduleId(appt.id);
                            setRescheduleDate(appt.date);
                            setRescheduleTime(appt.time);
                          }}
                          className="flex-1 py-2.5 border border-sand text-sm text-charcoal-deep hover:border-charcoal-deep transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => cancelAppointment(appt.id)}
                          className="flex-1 py-2.5 border border-error/30 text-sm text-error hover:bg-error/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastAppts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">
                  Past ({pastAppts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastAppts.map(appt => {
                    const isPast = appt.status === 'completed';
                    return (
                      <div key={appt.id} className="bg-white border border-sand/30 p-6 opacity-70">
                        <div className="flex items-start justify-between mb-3">
                          <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getAppointmentStatusBadge(appt.status)}`}>
                            {appt.status}
                          </span>
                        </div>
                        <h3 className="font-display text-lg text-charcoal-deep mb-1">{appt.title}</h3>
                        <p className="text-xs text-taupe mb-3">{getAppointmentTypeLabel(appt.type)}</p>
                        <div className="flex items-center gap-2 text-sm text-stone mb-3">
                          <Calendar size={14} />
                          {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                          <span>·</span>
                          <span>{appt.time}</span>
                        </div>
                        {isPast && appt.status !== 'cancelled' && (
                          <button
                            onClick={() => setShowSummaryAppt(appt)}
                            className="w-full px-4 py-2 border border-sand text-stone text-xs tracking-[0.1em] uppercase hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
                          >
                            View Summary
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {conciergeAppointments.length === 0 && (
              <div className="text-center py-16">
                <Calendar size={40} className="text-stone/40 mx-auto mb-4" />
                <p className="text-stone">No appointments found</p>
                <Link
                  href="/uhni/concierge"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                >
                  Book an Appointment
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleId && (
        <div className="fixed inset-0 bg-noir/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 relative">
            <button
              onClick={() => setRescheduleId(null)}
              className="absolute top-4 right-4 text-stone hover:text-charcoal-deep transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Crown size={14} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/70">Reschedule</span>
            </div>
            <h3 className="font-display text-2xl text-charcoal-deep mb-6">Reschedule Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">New Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={e => setRescheduleTime(e.target.value)}
                  className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRescheduleId(null)}
                  className="flex-1 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={!rescheduleDate || !rescheduleTime}
                  className="flex-1 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Summary Modal */}
      {showSummaryAppt && (
        <div
          className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSummaryAppt(null)}
        >
          <div
            className="bg-white max-w-md w-full p-8"
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">
                Session Summary
              </h3>
              <button
                onClick={() => setShowSummaryAppt(null)}
                className="p-2 hover:bg-sand/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-parchment p-4">
                <p className="text-xs tracking-[0.1em] uppercase text-taupe mb-1">
                  Session
                </p>
                <p className="font-medium text-charcoal-deep text-sm">
                  {showSummaryAppt.title}
                </p>
                <p className="text-xs text-stone mt-0.5">
                  {new Date(showSummaryAppt.date + 'T' + showSummaryAppt.time).toLocaleDateString(
                    'en-US', {
                      weekday: 'long', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    }
                  )}
                </p>
              </div>

              {showSummaryAppt.notes && (
                <div>
                  <p className="text-xs tracking-[0.1em] uppercase text-taupe mb-2">
                    Your Notes
                  </p>
                  <p className="text-sm text-charcoal-deep italic bg-parchment border border-sand px-4 py-3">
                    &quot;{showSummaryAppt.notes}&quot;
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs tracking-[0.1em] uppercase text-taupe mb-2">
                  Session Outcome
                </p>
                <div className="space-y-2 text-sm text-stone">
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-success mt-0.5 flex-shrink-0" />
                    <p>Session completed with {concierge?.name || 'your concierge'}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-success mt-0.5 flex-shrink-0" />
                    <p>All discussion notes saved to your profile</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-success mt-0.5 flex-shrink-0" />
                    <p>Any action items have been added to your concierge tasks</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-sand pt-4">
                <p className="text-xs tracking-[0.1em] uppercase text-taupe mb-2">
                  Follow-Up Actions
                </p>
                <button
                  onClick={() => {
                    setShowSummaryAppt(null)
                    router.push('/uhni/concierge')
                  }}
                  className="w-full px-4 py-2.5 border border-sand text-stone text-xs tracking-[0.1em] uppercase hover:border-charcoal-deep hover:text-charcoal-deep transition-colors mb-2"
                >
                  Continue Conversation with Isabella
                </button>
                <button
                  onClick={() => {
                    setShowSummaryAppt(null)
                    router.push('/uhni/concierge?tab=book')
                  }}
                  className="w-full px-4 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                >
                  Book Next Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
