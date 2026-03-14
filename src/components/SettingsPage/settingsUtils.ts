/**
 * settingsUtils.ts
 *
 * Single source of truth for the ID scheme used by the search-to-scroll system.
 *
 * Import in:
 *   - SearchBar.tsx        (generates IDs to find)
 *   - Every settings file  (puts IDs on DOM elements)
 *   - index.tsx            (orchestrates navigation)
 *
 * Convention:
 *   toSectionId("Profile")       → "section-Profile"
 *   toSettingId("Profile Photo") → "setting-Profile-Photo"
 */

export function toSectionId(section: string): string {
  return "section-" + section.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-_]/g, "");
}

export function toSettingId(label: string): string {
  return "setting-" + label.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-_]/g, "");
}

export interface ScrollTarget {
  section: string;
  label: string;
}
