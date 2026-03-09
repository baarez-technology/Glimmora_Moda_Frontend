import { redirect } from 'next/navigation';

export default function StoriesRedirect() {
  redirect('/uhni/heritage-archive?tab=stories');
}
