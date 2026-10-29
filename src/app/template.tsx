import { ViewTransition } from "react";

// A template remounts on every navigation, so its ViewTransition enters and exits with each route.
// The animation itself is the .page class in globals.css.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
