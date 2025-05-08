import { useToast as useToastOriginal } from "../components/ui/use-toast";

// This is a simple wrapper to re-export the useToast hook from the components to make it easier to access.
// Users of this hook won't need to know the exact path to the toast component.
export const useToast = useToastOriginal;