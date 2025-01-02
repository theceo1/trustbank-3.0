import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function StatusPage() {
  // In a real app, this would be fetched from an API
  const systems = [
    { name: "Trading Engine", status: "operational", uptime: "99.99%" },
    { name: "Market Data", status: "operational", uptime: "99.95%" },
    { name: "User Authentication", status: "operational", uptime: "99.99%" },
    { name: "Payment Processing", status: "operational", uptime: "99.98%" },
    { name: "API Services", status: "operational", uptime: "99.97%" },
    { name: "Website", status: "operational", uptime: "99.99%" }
  ];

  const incidents = [
    {
      date: "2024-01-02",
      title: "No recent incidents",
      status: "resolved",
      description: "All systems are operating normally."
    }
  ];

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-4xl font-bold">All Systems Operational</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Current status of trustBank services
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current status of all trustBank systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {systems.map((system) => (
                <div key={system.name} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">{system.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-green-500">
                      {system.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Uptime: {system.uptime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>History of system incidents and resolutions</CardDescription>
          </CardHeader>
          <CardContent>
            {incidents.map((incident) => (
              <div key={incident.date} className="flex gap-4 py-4 border-b last:border-0">
                <AlertCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{incident.title}</span>
                    <Badge variant="outline" className="text-green-500">
                      {incident.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {incident.description}
                  </p>
                  <time className="text-sm text-muted-foreground">
                    {new Date(incident.date).toLocaleDateString()}
                  </time>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 