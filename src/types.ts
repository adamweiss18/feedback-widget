export type Category = "bug" | "UX" | "copy" | "feature" | "question";

export type FeedbackSubmission = {
  project_slug: string;
  submitter_name?: string | null;
  category: Category;
  content: string;
  page_url?: string;
  page_path?: string;
  viewport?: { width: number; height: number };
  user_agent?: string;
  screenshot_id?: string | null;
};

export type FeedbackResponse = {
  id: string;
  created_at: string;
  undo_token: string;
};

export type WidgetProps = {
  projectSlug: string;
  userName?: string;
  hideOnPaths?: string[];
  position?: "bottom-right" | "bottom-left";
  apiUrl?: string;
  onSubmit?: (feedback: { id: string; category: Category; content: string }) => void;
};
