import { ReactNode, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import useDebouncedValue from "../../hooks/useDebouncedValue";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  debounceMs?: number;
  /** Arbitrary filter controls (selects, toggles, etc.) rendered after search. */
  children?: ReactNode;
}

/**
 * Generic filter row: a debounced search box plus a slot for whatever
 * filter controls the calling page needs. Has no knowledge of task-specific
 * filters — those are supplied by the caller as children.
 */
export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  debounceMs = 350,
  children,
}: FilterBarProps) {
  const [localValue, setLocalValue] = useState(searchValue);
  const debouncedValue = useDebouncedValue(localValue, debounceMs);

  // Keep local input in sync if the controlled value changes externally
  // (e.g. reset from URL params).
  useEffect(() => {
    setLocalValue(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (debouncedValue !== searchValue) {
      onSearchChange(debouncedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <Box className="flex flex-wrap items-center gap-3 mb-4">
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        sx={{ minWidth: 240 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      {children}
    </Box>
  );
}

export default FilterBar;
