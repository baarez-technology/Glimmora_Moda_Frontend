export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth pages have their own full-screen split layouts
  // No header/footer needed - clean authentication experience
  return <>{children}</>;
}
