import { redirect } from 'next/navigation';

export default function InvisibleCommerceRedirect() {
  redirect('/uhni/silent-commerce?tab=transactions');
}
