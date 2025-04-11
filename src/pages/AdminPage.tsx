
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Search, Shield, UserX } from "lucide-react";

const AdminPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for demonstration
  const users = [
    {
      id: "user1",
      name: "John Smith",
      email: "john.smith@example.com",
      role: "merchant",
      plan: "free",
      createdAt: "2023-02-15T10:30:00Z",
      status: "active",
    },
    {
      id: "user2",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "merchant",
      plan: "pro",
      createdAt: "2023-03-10T14:45:00Z",
      status: "active",
    },
    {
      id: "user3",
      name: "David Williams",
      email: "david.williams@example.com",
      role: "merchant",
      plan: "paygo",
      createdAt: "2023-01-20T09:15:00Z",
      status: "suspended",
    },
  ];
  
  const reportedProducts = [
    {
      id: "product1",
      title: "Counterfeit Designer Handbag",
      reportedBy: "user2",
      reason: "Trademark infringement",
      status: "pending",
      createdAt: "2023-04-05T11:20:00Z",
    },
    {
      id: "product2",
      title: "Low Quality Electronics",
      reportedBy: "user1",
      reason: "Misleading product description",
      status: "resolved",
      createdAt: "2023-04-02T16:30:00Z",
    },
  ];
  
  // Filter users based on search query
  const filteredUsers = searchQuery
    ? users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;
  
  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-500">Admin</Badge>;
      case "merchant":
        return <Badge variant="secondary">Merchant</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };
  
  const getPlanBadge = (plan) => {
    switch (plan) {
      case "free":
        return <Badge variant="outline">Free</Badge>;
      case "paygo":
        return <Badge className="bg-blue-500">Pay-Go</Badge>;
      case "pro":
        return <Badge className="bg-green-500">Pro</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getReportStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      case "rejected":
        return <Badge variant="outline">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>
      
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="reports">Product Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4 pt-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <Button type="submit" size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        {getRoleBadge(user.role)}
                        {getPlanBadge(user.plan)}
                        {getStatusBadge(user.status)}
                        <div className="flex gap-2 ml-2">
                          <Button size="sm" variant="outline">View</Button>
                          {user.status === "active" ? (
                            <Button size="sm" variant="outline" className="text-red-500 border-red-500">
                              <UserX className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="text-green-500 border-green-500">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found matching your search
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reported Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportedProducts.length > 0 ? (
                  reportedProducts.map((report) => (
                    <div
                      key={report.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{report.title}</h3>
                          {report.status === "pending" && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm">Reason: {report.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          Reported: {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        {getReportStatusBadge(report.status)}
                        <div className="flex gap-2 ml-2">
                          <Button size="sm" variant="outline">View Product</Button>
                          {report.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline" className="text-red-500 border-red-500">
                                Remove Product
                              </Button>
                              <Button size="sm" variant="outline">
                                Dismiss Report
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No product reports found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
