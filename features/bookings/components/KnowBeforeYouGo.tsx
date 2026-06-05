"use client";

interface KnowBeforeYouGoProps {
  boatName: string;
}

export default function KnowBeforeYouGo({ boatName }: KnowBeforeYouGoProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">A note from the crew</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Thanks for choosing{" "}
        <span className="font-medium text-foreground">{boatName}</span>. The crew
        will reach out if anything needs confirming before departure.
      </p>
    </div>
  );
}
