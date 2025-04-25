import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    "https://uvitwgwbntxknkjzrnts.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2aXR3Z3dibnR4a25ranpybnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDAzODksImV4cCI6MjA2MDM3NjM4OX0.OQN-zpnwvGtMlldGtEU1nl4IDHh6ys6vFJruERYOLcs",
  );
