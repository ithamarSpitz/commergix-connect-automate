
import { Button, ButtonProps } from "@/components/ui/button";
import { Platform } from "@/types";
import { cn } from "@/lib/utils";
import { LucideIcon, Store, ShoppingBag, Truck, CreditCard } from "lucide-react";

type ConnectType = Platform | 'shipping' | 'billing';

const CONNECT_ICONS: Record<ConnectType, LucideIcon> = {
  shopify: Store,
  mirakl: ShoppingBag,
  shipping: Truck,
  billing: CreditCard,
};

interface ConnectButtonProps extends ButtonProps {
  type: ConnectType;
  isConnected?: boolean;
  onConnect: () => void;
}

export function ConnectButton({
  type,
  isConnected = false,
  onConnect,
  className,
  ...props
}: ConnectButtonProps) {
  const Icon = CONNECT_ICONS[type];
  
  const getLabel = () => {
    if (isConnected) {
      return `${type.charAt(0).toUpperCase() + type.slice(1)} Connected`;
    }
    return `Connect ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };
  
  return (
    <Button
      variant={isConnected ? "outline" : "default"}
      onClick={onConnect}
      className={cn(
        "flex items-center gap-2",
        isConnected && "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800",
        className
      )}
      disabled={isConnected}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {getLabel()}
    </Button>
  );
}
