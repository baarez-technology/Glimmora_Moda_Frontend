import { redirect } from 'next/navigation';

export default function PrivateShoppingRedirect() {
  redirect('/uhni/events?tab=shopping');
}
