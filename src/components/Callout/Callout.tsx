import React from "react";
import {
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  AlertCircle,
  Star,
  MessageSquare,
  BookOpen,
  Code,
  Settings,
  Users,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type CalloutType =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "tip"
  | "note"
  | "important"
  | "caution"
  | "example"
  | "quote"
  | "definition"
  | "code"
  | "config"
  | "community";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const calloutConfig: Record<
  CalloutType,
  {
    icon: React.ReactNode;
    className: string;
    bgColor: string;
    borderColor: string;
    titleColor: string;
  }
> = {
  info: {
    icon: <Info className="h-4 w-4" />,
    className:
      "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800/30 dark:bg-blue-950/30 dark:text-blue-100",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800/30",
    titleColor: "text-blue-900 dark:text-blue-100",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800/30 dark:bg-yellow-950/30 dark:text-yellow-100",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800/30",
    titleColor: "text-yellow-900 dark:text-yellow-100",
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    className:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-800/30 dark:bg-red-950/30 dark:text-red-100",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800/30",
    titleColor: "text-red-900 dark:text-red-100",
  },
  success: {
    icon: <CheckCircle className="h-4 w-4" />,
    className:
      "border-green-200 bg-green-50 text-green-900 dark:border-green-800/30 dark:bg-green-950/30 dark:text-green-100",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800/30",
    titleColor: "text-green-900 dark:text-green-100",
  },
  tip: {
    icon: <Lightbulb className="h-4 w-4" />,
    className:
      "border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-800/30 dark:bg-purple-950/30 dark:text-purple-100",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800/30",
    titleColor: "text-purple-900 dark:text-purple-100",
  },
  note: {
    icon: <BookOpen className="h-4 w-4" />,
    className:
      "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800/30 dark:bg-slate-950/30 dark:text-slate-100",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    borderColor: "border-slate-200 dark:border-slate-800/30",
    titleColor: "text-slate-900 dark:text-slate-100",
  },
  important: {
    icon: <Star className="h-4 w-4" />,
    className:
      "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800/30 dark:bg-orange-950/30 dark:text-orange-100",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800/30",
    titleColor: "text-orange-900 dark:text-orange-100",
  },
  caution: {
    icon: <AlertCircle className="h-4 w-4" />,
    className:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-800/30 dark:bg-red-950/30 dark:text-red-100",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800/30",
    titleColor: "text-red-900 dark:text-red-100",
  },
  example: {
    icon: <Code className="h-4 w-4" />,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/30 dark:bg-emerald-950/30 dark:text-emerald-100",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/30",
    titleColor: "text-emerald-900 dark:text-emerald-100",
  },
  quote: {
    icon: <MessageSquare className="h-4 w-4" />,
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-800/30 dark:bg-indigo-950/30 dark:text-indigo-100",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800/30",
    titleColor: "text-indigo-900 dark:text-indigo-100",
  },
  definition: {
    icon: <BookOpen className="h-4 w-4" />,
    className:
      "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800/30 dark:bg-teal-950/30 dark:text-teal-100",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-200 dark:border-teal-800/30",
    titleColor: "text-teal-900 dark:text-teal-100",
  },
  code: {
    icon: <Code className="h-4 w-4" />,
    className:
      "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800/30 dark:bg-violet-950/30 dark:text-violet-100",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800/30",
    titleColor: "text-violet-900 dark:text-violet-100",
  },
  config: {
    icon: <Settings className="h-4 w-4" />,
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-900 dark:border-cyan-800/30 dark:bg-cyan-950/30 dark:text-cyan-100",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-cyan-200 dark:border-cyan-800/30",
    titleColor: "text-cyan-900 dark:text-cyan-100",
  },
  community: {
    icon: <Users className="h-4 w-4" />,
    className:
      "border-pink-200 bg-pink-50 text-pink-900 dark:border-pink-800/30 dark:bg-pink-950/30 dark:text-pink-100",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-800/30",
    titleColor: "text-pink-900 dark:text-pink-100",
  },
};

const defaultTitles: Record<CalloutType, string> = {
  info: "Info",
  warning: "Warning",
  error: "Error",
  success: "Success",
  tip: "Tip",
  note: "Note",
  important: "Important",
  caution: "Caution",
  example: "Example",
  quote: "Quote",
  definition: "Definition",
  code: "Code",
  config: "Configuration",
  community: "Community",
};

export function Callout({
  type = "info",
  title,
  children,
  icon,
  // dismissible = false,
  // onDismiss,
  className,
}: CalloutProps): React.ReactElement {
  const config = calloutConfig[type];
  const displayTitle = title || defaultTitles[type];
  const displayIcon = icon || config.icon;

  return (
    <Alert
      className={cn(
        "my-6 shadow-sm transition-all duration-200 hover:shadow-md",
        config.className,
        className,
      )}
    >
      {displayIcon}
      <AlertTitle className="font-semibold mb-2">{displayTitle}</AlertTitle>
      <AlertDescription className="text-sm leading-relaxed [&>*:last-child]:mb-0 [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 [&>blockquote]:mb-3">
        {children}
      </AlertDescription>
    </Alert>
  );
}

// Convenience components for specific callout types
export function InfoCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="info" />
}

export function WarningCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="warning" />
}

export function ErrorCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="error" />
}

export function SuccessCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="success" />
}

export function TipCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="tip" />
}

export function NoteCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="note" />
}

export function ImportantCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="important" />
}

export function CautionCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="caution" />
}

export function ExampleCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="example" />
}

export function QuoteCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="quote" />
}

export function DefinitionCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="definition" />
}

export function CodeCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="code" />
}

export function ConfigCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="config" />
}

export function CommunityCallout(props: Omit<CalloutProps, "type">) {
  return <Callout {...props} type="community" />
}

export default Callout;
