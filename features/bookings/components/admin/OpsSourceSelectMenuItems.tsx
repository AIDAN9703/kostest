"use client";

import {
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@/shared/components/ui/select";
import {
  OPS_SOURCE_GROUP_AGENT_HEAVY_LABEL,
  OPS_SOURCE_GROUP_KOS_LEAD_LABEL,
  OPS_SOURCE_OPTIONS_AGENT_HEAVY,
  OPS_SOURCE_OPTIONS_KOS_LEAD,
} from "@/features/bookings/constants/ops-ui-config";
import { cn } from "@/shared/lib/utils/general-utils";

const groupLabelCn =
  "px-2 py-1.5 text-[11px] font-medium leading-snug text-muted-foreground";

interface OpsSourceSelectMenuItemsProps {
  noneSentinel: string;
  /** e.g. `text-xs` for dense admin tables */
  itemClassName?: string;
}

/**
 * Shared “—” + grouped canonical sources for booking source selects.
 * Legacy / custom values are appended by the caller when needed.
 */
export function OpsSourceSelectMenuItems({
  noneSentinel,
  itemClassName,
}: OpsSourceSelectMenuItemsProps) {
  return (
    <>
      <SelectItem value={noneSentinel} className={itemClassName}>
        —
      </SelectItem>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel className={cn(groupLabelCn)}>
          {OPS_SOURCE_GROUP_AGENT_HEAVY_LABEL}
        </SelectLabel>
        {OPS_SOURCE_OPTIONS_AGENT_HEAVY.map((opt) => (
          <SelectItem key={opt} value={opt} className={itemClassName}>
            {opt}
          </SelectItem>
        ))}
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel className={cn(groupLabelCn)}>
          {OPS_SOURCE_GROUP_KOS_LEAD_LABEL}
        </SelectLabel>
        {OPS_SOURCE_OPTIONS_KOS_LEAD.map((opt) => (
          <SelectItem key={opt} value={opt} className={itemClassName}>
            {opt}
          </SelectItem>
        ))}
      </SelectGroup>
    </>
  );
}
