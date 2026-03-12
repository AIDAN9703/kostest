interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
}

export function EmptyState({ emoji, title, description }: EmptyStateProps) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mb-4">
        <span className="text-3xl">{emoji}</span>
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}

