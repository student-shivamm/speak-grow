import { create } from "zustand";
import { getCredits, setCredits, consumeCredit as consumeCreditStorage, addCredits as addCreditsStorage, initializeCredits } from "@/lib/localStorage";
import type { SpeechRecord } from "@/lib/localStorage";

interface CreditStore {
  credits: number;
  lastAnalysis: SpeechRecord | null;
  initCredits: () => void;
  consumeCredit: () => boolean;
  addCredits: (count: number) => void;
  setLastAnalysis: (record: SpeechRecord) => void;
}

export const useCreditStore = create<CreditStore>((set) => ({
  credits: 0,
  lastAnalysis: null,

  initCredits: () => {
    const credits = initializeCredits();
    set({ credits });
  },

  consumeCredit: () => {
    const success = consumeCreditStorage();
    if (success) {
      set({ credits: getCredits() });
    }
    return success;
  },

  addCredits: (count: number) => {
    addCreditsStorage(count);
    set({ credits: getCredits() });
  },

  setLastAnalysis: (record: SpeechRecord) => {
    set({ lastAnalysis: record });
  },
}));
