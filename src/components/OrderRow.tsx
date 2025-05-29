
import { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface OrderRowProps {
  order: Order;
}

export function OrderRow({ order }: OrderRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default">New</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case "fulfilled":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Fulfilled</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link to={`/orders/${order.id}`} className="hover:underline text-primary">
          #{order.provider_order_id}
        </Link>
      </TableCell>
      <TableCell>{formatDate(order.order_date)}</TableCell>
      <TableCell>{order.commercial_id}</TableCell>
      <TableCell className="text-right">
        {formatCurrency(order.total_amount, order.currency)}
      </TableCell>
      <TableCell>{getStatusBadge(order.status)}</TableCell>
      <TableCell>
        <Button asChild size="sm" variant="ghost">
          <Link to={`/orders/${order.id}`}>
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
