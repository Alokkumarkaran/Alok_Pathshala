import Sidebar from "../components/admin/Sidebar";

export default function AdminLayout({ children }) {
  return (
    // 1. "flex" puts Sidebar and Main side-by-side on Desktop
    // 2. "h-screen" ensures the container takes full height so scrolling works inside
    // 3. "overflow-hidden" prevents double scrollbars
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar Component 
         (It is 'fixed' on mobile, but 'static' on desktop, so it sits nicely in the flex row) 
      */}
      <Sidebar />
      
      {/* Main Content Area 
          1. flex-1: Fills the remaining width automatically (No need for ml-64).
          2. overflow-y-auto: Makes ONLY the content area scrollable, not the sidebar.
          3. mt-16: Pushes content down on mobile (for the header).
          4. md:mt-0: Removes that push on desktop.
      */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0 w-full">
        {children}
      </main>
      
    </div>
  );
}