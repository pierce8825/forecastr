import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrainCircuit } from "lucide-react";

export function ChadAvatar() {
  return (
    <Avatar className="h-10 w-10 border-2 border-primary/20">
      <AvatarFallback className="bg-primary/10 text-primary">
        <BrainCircuit className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );
}