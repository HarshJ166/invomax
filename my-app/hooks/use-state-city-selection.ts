import { useMemo } from "react";
import { STATE_CITY_MAPPING } from "@/lib/constants";

interface UseStateCitySelectionOptions {
  selectedState: string;
}

export function useStateCitySelection({ selectedState }: UseStateCitySelectionOptions) {
  const availableCities = useMemo(() => {
    return selectedState ? STATE_CITY_MAPPING[selectedState] || [] : [];
  }, [selectedState]);

  return {
    availableCities,
  };
}

