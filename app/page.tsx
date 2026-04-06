import { redirect } from 'next/navigation'

// Root redirects to the admin panel.
// Will be replaced by the public catalog once feature/catalog-pages lands.
export default function RootPage() {
  redirect('/admin')
}
