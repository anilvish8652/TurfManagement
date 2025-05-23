import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
  // The redirect function throws an error to stop rendering, so no need to return null.
}
