import { redirect } from 'next/navigation';

export default function ConciergeTasksRedirect() {
  redirect('/uhni/concierge?tab=tasks');
}
