import MainLayout from "@/components/main/MainLayout";

export default function MainRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
