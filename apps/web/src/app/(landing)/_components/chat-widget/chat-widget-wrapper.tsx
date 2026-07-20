"use client";

import { ChatWidget } from "./chat-widget";

interface ChatWidgetWrapperProps {
  slug: string;
  rutEmpresa: string;
  theme: {
    primary: string;
    primaryLight: string;
    accent: string;
  };
}

export function ChatWidgetWrapper({ slug, rutEmpresa, theme }: ChatWidgetWrapperProps) {
  return (
    <ChatWidget
      slug={slug}
      rutEmpresa={rutEmpresa}
      brandPrimary={theme.primary}
      brandPrimaryLight={theme.primaryLight}
    />
  );
}
