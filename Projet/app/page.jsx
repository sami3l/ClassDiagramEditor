"use client";

import { GoDiagramCanvas } from "./Components/canvas";
import { Sidebar } from "./Components/sidebar";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,

} from "@clerk/nextjs";

export default function Home() {
  return (
    <ClerkProvider>
      <div className="min-h-screen w-full">
        {/* Display Sign-in Button when user is signed out */}
        <SignedOut>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-4">
                Welcome to UML Diagram Builder
              </h1>
              <p className="text-gray-600 mb-6">
                Please sign in to create and manage your diagrams.
              </p>
              <SignInButton>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>

        {/* Show the main app interface when user is signed in */}
        <SignedIn>
          <div className="flex min-h-screen">
            {/* Sidebar for navigation or tools */}
            <aside className="w-64 border-r bg-gray-100 flex flex-col justify-between">
              <Sidebar />
             
            </aside>

            {/* Main content area for GoJS canvas */}
            <main className="flex-1 p-4">
              <GoDiagramCanvas />
            </main>
          </div>
        </SignedIn>
      </div>
    </ClerkProvider>
  );
}
