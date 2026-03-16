'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PersonalConcierge, AutonomousShoppingSettings, SourcingRequest, SourcingMessage, SourcingRequestStatus, BespokeOrder, AutonomousActivity, BespokeMessage, BespokeDetailedSpec, PriceNegotiation, NegotiationStatus, ConciergeAppointment, ConciergeTask, ConciergeTaskInput } from '@/types';
import * as uhniService from '@/services/uhni.service';
import { fetchConsumerTasks, createConsumerTask, updateConsumerTask } from '@/services/consumer-task.service';
import { fetchConsumerAppointments, createConsumerAppointment, patchConsumerAppointment } from '@/services/consumer-appointment.service';

interface UseUHNIFeaturesProps {
  isUHNI: boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

/**
 * Manages UHNI-specific data (concierge, autonomous shopping, sourcing, bespoke).
 * Auth state (userTier, isUHNI, setUserRole, logout) lives in AuthContext — single source of truth.
 */
export function useUHNIFeatures({ isUHNI, showToast }: UseUHNIFeaturesProps) {
  const [concierge, setConcierge] = useState<PersonalConcierge | null>(null);
  const [autonomousSettings, setAutonomousSettings] = useState<AutonomousShoppingSettings | null>(null);
  const [sourcingRequests, setSourcingRequests] = useState<SourcingRequest[]>([]);
  const [bespokeOrders, setBespokeOrders] = useState<BespokeOrder[]>([]);
  const [autonomousActivity, setAutonomousActivity] = useState<AutonomousActivity[]>([]);
  const [priceNegotiations, setPriceNegotiations] = useState<PriceNegotiation[]>([]);
  const [conciergeAppointments, setConciergeAppointments] = useState<ConciergeAppointment[]>([]);
  const [localConciergeTasks, setLocalConciergeTasks] = useState<ConciergeTask[]>([]);

  useEffect(() => {
    if (isUHNI) {
      uhniService.getConcierge().then(r => { if (r.success) setConcierge(r.data); });
      uhniService.getAutonomousSettings().then(r => { if (r.success) setAutonomousSettings(r.data); });
      uhniService.getSourcingRequests().then(r => { if (r.success) setSourcingRequests(r.data); });
      uhniService.getBespokeOrders().then(r => { if (r.success) setBespokeOrders(r.data); });
      uhniService.getAutonomousActivity().then(r => { if (r.success) setAutonomousActivity(r.data); });
      uhniService.getPriceNegotiations().then(r => { if (r.success) setPriceNegotiations(r.data); });
      uhniService.getConciergeTasks().then(r => { if (r.success) setLocalConciergeTasks(r.data); });
      fetchConsumerTasks().then(tasks => { if (tasks.length) setLocalConciergeTasks(tasks); }).catch(() => {});
      fetchConsumerAppointments().then(appts => { setConciergeAppointments(appts); }).catch(() => {});
    } else {
      setConcierge(null);
      setAutonomousSettings(null);
    }
  }, [isUHNI]);

  const updateAutonomousSettings = useCallback((settings: Partial<AutonomousShoppingSettings>) => {
    if (!isUHNI || !autonomousSettings) return;
    setAutonomousSettings(prev => prev ? { ...prev, ...settings } : null);
    showToast('Settings updated', 'success');
  }, [isUHNI, autonomousSettings, showToast]);

  const createBespokeOrder = useCallback((orderData: {
    title: string;
    type: 'made_to_measure' | 'custom_design' | 'modification';
    description: string;
    detailedSpec: BespokeDetailedSpec;
    estimatedBudget: number;
    requestedDeadline?: string;
    selectedBrands?: { id: string; name: string }[];
  }) => {
    const brands = orderData.selectedBrands || [];
    const primaryBrand = brands[0];
    const newOrder: BespokeOrder = {
      id: `bespoke-${Date.now()}`,
      brandId: primaryBrand?.id || 'brand-default',
      brandName: primaryBrand?.name || 'ModaGlimmora Atelier',
      selectedBrands: brands.length > 0 ? brands : undefined,
      title: orderData.title,
      type: orderData.type,
      description: orderData.description,
      specifications: [],
      detailedSpec: orderData.detailedSpec,
      status: 'consultation',
      timeline: [
        { id: 'step-consultation', stage: 'consultation', title: 'Consultation', description: 'Initial consultation and requirements gathering', status: 'current' },
        { id: 'step-design', stage: 'design_approval', title: 'Design Approval', description: 'Design review and client approval', status: 'upcoming' },
        { id: 'step-production', stage: 'production', title: 'Production', description: 'Crafting your bespoke piece', status: 'upcoming' },
        { id: 'step-fitting', stage: 'fitting', title: 'Fitting', description: 'First fitting and adjustments', status: 'upcoming' },
        { id: 'step-final', stage: 'final_adjustments', title: 'Final Adjustments', description: 'Final touches and quality assurance', status: 'upcoming' },
        { id: 'step-complete', stage: 'complete', title: 'Complete', description: 'Ready for delivery', status: 'upcoming' },
      ],
      price: orderData.estimatedBudget,
      depositPaid: 0,
      depositPercentage: 50,
      estimatedCompletion: orderData.requestedDeadline
        || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      progressImages: [],
      messages: [],
      timelineEvents: [
        { id: `tl-${Date.now()}`, status: 'consultation', note: 'Bespoke request submitted by client', updatedBy: 'system', createdAt: new Date().toISOString() },
      ],
      clientApprovalRequired: false,
      clientApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBespokeOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const addMessageToBespokeOrder = useCallback((orderId: string, content: string, role: 'client' | 'brand') => {
    const newMessage: BespokeMessage = {
      id: `msg-${Date.now()}`,
      senderId: role === 'client' ? 'uhni-user' : 'brand-user',
      senderName: role === 'client' ? 'You' : 'Brand Atelier',
      senderRole: role,
      content,
      createdAt: new Date().toISOString(),
    };
    setBespokeOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, messages: [...(order.messages || []), newMessage] }
          : order
      )
    );
  }, []);

  const approveBespokeDesign = useCallback((orderId: string) => {
    setBespokeOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, clientApproved: true }
          : order
      )
    );
  }, []);

  const createNegotiation = useCallback((data: {
    productId: string;
    productName: string;
    productImage: string;
    productSlug: string;
    brandName: string;
    originalPrice: number;
    proposedPrice: number;
    clientMessage: string;
  }): PriceNegotiation => {
    const newNeg: PriceNegotiation = {
      id: `neg-${Date.now()}`,
      productId: data.productId,
      productName: data.productName,
      productImage: data.productImage,
      productSlug: data.productSlug,
      brandName: data.brandName,
      originalPrice: data.originalPrice,
      proposedPrice: data.proposedPrice,
      clientMessage: data.clientMessage,
      status: 'pending',
      conciergeNotes: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setPriceNegotiations(prev => [newNeg, ...prev]);
    showToast('Price negotiation submitted', 'success');
    return newNeg;
  }, [showToast]);

  const createSourcingRequest = useCallback((data: {
    title: string;
    description: string;
    category: string;
    budget: number;
    currency?: string;
    deadline?: string;
    specifications?: string;
    priority: 'standard' | 'urgent' | 'when_available';
  }): SourcingRequest => {
    const newRequest: SourcingRequest = {
      id: `src-${Date.now()}`,
      type: 'specific_item',
      title: data.title,
      description: data.description,
      category: data.category,
      specifications: data.specifications,
      priority: data.priority,
      budget: { min: 0, max: data.budget, flexible: false },
      deadline: data.deadline,
      status: 'pending',
      conciergeNotes: [],
      foundOptions: [],
      messages: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'pending' as SourcingRequestStatus,
          note: 'Sourcing request submitted',
          updatedBy: 'system' as const,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSourcingRequests(prev => [newRequest, ...prev]);
    showToast('Sourcing request submitted', 'success');
    return newRequest;
  }, [showToast]);

  const selectSourcingOption = useCallback((requestId: string, optionId: string) => {
    setSourcingRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? {
              ...req,
              selectedOptionId: optionId,
              status: 'awaiting_approval' as SourcingRequestStatus,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...(req.timeline || []),
                {
                  id: `tl-${Date.now()}`,
                  status: 'awaiting_approval' as SourcingRequestStatus,
                  note: 'Client selected a sourcing option — awaiting final confirmation',
                  updatedBy: 'client' as const,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : req
      )
    );
    showToast('Option selected — awaiting brand confirmation', 'success');
  }, [showToast]);

  const addSourcingMessage = useCallback((requestId: string, content: string) => {
    const newMessage: SourcingMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'uhni-client',
      senderName: 'You',
      senderRole: 'client',
      content,
      createdAt: new Date().toISOString(),
    };
    setSourcingRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, messages: [...(req.messages || []), newMessage] }
          : req
      )
    );
  }, []);

  const bookAppointment = useCallback((data: {
    type: ConciergeAppointment['type'];
    title: string;
    date: string;
    time: string;
    duration: number;
    notes?: string;
    location?: ConciergeAppointment['location'];
    brand_id?: string;
  }): ConciergeAppointment => {
    const newAppt: ConciergeAppointment = {
      id: `appt-${Date.now()}`,
      type: data.type,
      title: data.title,
      date: data.date,
      time: data.time,
      duration: data.duration,
      notes: data.notes,
      location: data.location,
      brandId: data.brand_id,
      status: 'upcoming',
      conciergeId: 'isabella',
      conciergeName: 'Isabella Romano',
      createdAt: new Date().toISOString(),
    };
    setConciergeAppointments(prev => [newAppt, ...prev]);
    showToast('Appointment booked successfully', 'success');
    createConsumerAppointment({
      appointment_type: data.type,
      brand_id: data.brand_id ?? '',
      date: data.date,
      time: data.time,
      duration: String(data.duration),
      notes: data.notes,
      location: data.location,
    }).catch(() => {});
    return newAppt;
  }, [showToast]);

  const cancelAppointment = useCallback((appointmentId: string) => {
    setConciergeAppointments(prev =>
      prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a)
    );
    showToast('Appointment cancelled', 'info');
    patchConsumerAppointment(appointmentId, { status: 'cancelled' }).catch(() => {});
  }, [showToast]);

  const rescheduleAppointment = useCallback((appointmentId: string, newDate: string, newTime: string) => {
    setConciergeAppointments(prev =>
      prev.map(a => a.id === appointmentId ? { ...a, date: newDate, time: newTime, status: 'rescheduled' as const } : a)
    );
    showToast('Appointment rescheduled', 'success');
    patchConsumerAppointment(appointmentId, { date: newDate, time: newTime, status: 'rescheduled' }).catch(() => {});
  }, [showToast]);

  const addConciergeTask = useCallback((input: ConciergeTaskInput): ConciergeTask => {
    const newTask: ConciergeTask = {
      id: `task-${Date.now()}`,
      type: input.type,
      title: input.title,
      description: input.description,
      status: 'pending',
      assignedTo: 'Isabella Romano',
      priority: input.priority,
      dueDate: input.dueDate,
      notes: [],
      clientInstructions: input.clientInstructions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLocalConciergeTasks(prev => [newTask, ...prev]);
    showToast('Task created', 'success');
    createConsumerTask({
      title: input.title,
      description: input.description,
      type: input.type,
      priority: input.priority,
      due_date: input.dueDate,
      instructions: input.clientInstructions,
    }).catch(() => {});
    return newTask;
  }, [showToast]);

  const completeConciergeTask = useCallback((taskId: string) => {
    setLocalConciergeTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: 'completed' as const, updatedAt: new Date().toISOString() } : t)
    );
    showToast('Task marked as completed', 'success');
    updateConsumerTask(taskId, { status: 'completed' }).catch(() => {});
  }, [showToast]);

  const respondToCounterOffer = useCallback((negotiationId: string, action: 'accept' | 'reject') => {
    setPriceNegotiations(prev =>
      prev.map(n => {
        if (n.id !== negotiationId) return n;
        if (action === 'accept') {
          return { ...n, status: 'accepted' as NegotiationStatus };
        }
        return { ...n, status: 'declined' as NegotiationStatus };
      })
    );
    if (action === 'accept') {
      showToast('Counter offer accepted', 'success');
    } else {
      showToast('Counter offer declined', 'info');
    }
  }, [showToast]);

  return {
    concierge,
    autonomousSettings,
    sourcingRequests,
    createSourcingRequest,
    selectSourcingOption,
    addSourcingMessage,
    bespokeOrders,
    autonomousActivity,
    updateAutonomousSettings,
    createBespokeOrder,
    addMessageToBespokeOrder,
    approveBespokeDesign,
    priceNegotiations,
    createNegotiation,
    respondToCounterOffer,
    conciergeAppointments,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    localConciergeTasks,
    addConciergeTask,
    completeConciergeTask,
  };
}
