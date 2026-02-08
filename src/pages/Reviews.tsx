import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Filter,
  MoreHorizontal,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Flag,
  Check,
  X,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Review {
  id: string;
  product: string;
  productId: string;
  customer: string;
  email: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  helpful: number;
  notHelpful: number;
  hasResponse: boolean;
}

const mockReviews: Review[] = [
  {
    id: "1",
    product: "Premium Widget Pro",
    productId: "PRD-001",
    customer: "Maria Schmidt",
    email: "m.schmidt@email.de",
    rating: 5,
    title: "Absolut empfehlenswert!",
    content: "Bin sehr zufrieden mit dem Produkt. Die Qualität ist hervorragend und der Versand war super schnell. Würde ich jederzeit wieder kaufen!",
    date: "2024-01-18",
    status: "approved",
    helpful: 12,
    notHelpful: 1,
    hasResponse: true,
  },
  {
    id: "2",
    product: "Smart Gadget X",
    productId: "PRD-002",
    customer: "Thomas Weber",
    email: "t.weber@email.de",
    rating: 4,
    title: "Gutes Produkt mit kleinen Mängeln",
    content: "Im Großen und Ganzen zufrieden. Die Verarbeitung könnte etwas besser sein, aber für den Preis ist es ok.",
    date: "2024-01-17",
    status: "approved",
    helpful: 8,
    notHelpful: 2,
    hasResponse: false,
  },
  {
    id: "3",
    product: "Ultra Kit Bundle",
    productId: "PRD-003",
    customer: "Lisa Müller",
    email: "l.mueller@email.de",
    rating: 5,
    title: "Perfekt!",
    content: "Genau das, was ich gesucht habe. Alle Teile sind hochwertig und passen perfekt zusammen.",
    date: "2024-01-16",
    status: "pending",
    helpful: 0,
    notHelpful: 0,
    hasResponse: false,
  },
  {
    id: "4",
    product: "Basic Starter Set",
    productId: "PRD-004",
    customer: "Michael Fischer",
    email: "m.fischer@email.de",
    rating: 2,
    title: "Nicht wie erwartet",
    content: "Leider entspricht das Produkt nicht der Beschreibung. Die Farbe ist anders und die Größe stimmt auch nicht.",
    date: "2024-01-15",
    status: "pending",
    helpful: 3,
    notHelpful: 0,
    hasResponse: false,
  },
  {
    id: "5",
    product: "Pro Accessory Pack",
    productId: "PRD-005",
    customer: "Sandra Bauer",
    email: "s.bauer@email.de",
    rating: 3,
    title: "Mittelmäßig",
    content: "Nichts Besonderes. Erfüllt seinen Zweck, aber hätte mir mehr erwartet für den Preis.",
    date: "2024-01-14",
    status: "approved",
    helpful: 5,
    notHelpful: 3,
    hasResponse: true,
  },
];

const ratingDistribution = [
  { stars: 5, count: 156, percentage: 52 },
  { stars: 4, count: 78, percentage: 26 },
  { stars: 3, count: 36, percentage: 12 },
  { stars: 2, count: 18, percentage: 6 },
  { stars: 1, count: 12, percentage: 4 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${
          star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    ))}
  </div>
);

export default function Reviews() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/ecommerce/reviews"],
    queryFn: () => api.get<any>("/ecommerce/reviews"),
  });
  const initialReviews = apiData?.data || mockReviews;
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "positive">("all");
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [statusFilterChecked, setStatusFilterChecked] = useState<string[]>([]);

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const positivePercentage = Math.round((positiveCount / reviews.length) * 100);
  const answeredCount = reviews.filter((r) => r.hasResponse).length;
  const answeredPercentage = Math.round((answeredCount / reviews.length) * 100);

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === "all" || review.rating === ratingFilter;
    const matchesStatus = 
      statusFilter === "all" || 
      review.status === statusFilter ||
      (statusFilter === "positive" && review.rating >= 4);
    return matchesSearch && matchesRating && matchesStatus;
  });

  const handleApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviews(prev => prev.map(r => {
      if (r.id === id) {
        toast.success(`Bewertung von ${r.customer} freigegeben`);
        return { ...r, status: "approved" as const };
      }
      return r;
    }));
  };

  const handleReject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviews(prev => prev.map(r => {
      if (r.id === id) {
        toast.success(`Bewertung von ${r.customer} abgelehnt`);
        return { ...r, status: "rejected" as const };
      }
      return r;
    }));
  };

  const handleReply = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReviewId(id);
    setReplyDialogOpen(true);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) {
      toast.error("Bitte geben Sie eine Antwort ein");
      return;
    }
    setReviews(prev => prev.map(r => {
      if (r.id === selectedReviewId) {
        return { ...r, hasResponse: true };
      }
      return r;
    }));
    const review = reviews.find(r => r.id === selectedReviewId);
    toast.success(`Antwort an ${review?.customer} gesendet`);
    setReplyDialogOpen(false);
    setReplyText("");
    setSelectedReviewId(null);
  };

  const handleFlag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.warning("Bewertung als problematisch markiert");
  };

  const handleReviewClick = (id: string) => {
    navigate(`/reviews/${id}`);
  };

  const handleStatCardClick = (filter: "all" | "pending" | "approved" | "positive") => {
    setStatusFilter(statusFilter === filter ? "all" : filter);
    setRatingFilter("all");
  };

  const handleRatingFilterClick = (stars: number) => {
    setRatingFilter(ratingFilter === stars ? "all" : stars);
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bewertungen</h1>
          <p className="text-muted-foreground">
            Kundenbewertungen moderieren und analysieren
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge 
            variant="destructive" 
            className="text-sm cursor-pointer"
            onClick={() => handleStatCardClick("pending")}
          >
            {pendingCount} ausstehend
          </Badge>
        )}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => handleStatCardClick("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Bewertung</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
              <StarRating rating={Math.round(avgRating)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Basierend auf {reviews.length} Bewertungen
            </p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "pending" ? "ring-2 ring-primary" : ""}`}
          onClick={() => handleStatCardClick("pending")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Zur Freigabe
            </p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "approved" ? "ring-2 ring-primary" : ""}`}
          onClick={() => handleStatCardClick("approved")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beantwortet</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{answeredPercentage}%</div>
            <Progress value={answeredPercentage} className="mt-2" />
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "positive" ? "ring-2 ring-primary" : ""}`}
          onClick={() => handleStatCardClick("positive")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positiv</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positivePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              4-5 Sterne
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Bewertungsverteilung</CardTitle>
          <CardDescription>Klicken Sie auf eine Bewertung, um zu filtern</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ratingDistribution.map((item) => (
              <div 
                key={item.stars} 
                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all hover:bg-muted ${ratingFilter === item.stars ? "bg-primary/10 ring-1 ring-primary" : ""}`}
                onClick={() => handleRatingFilterClick(item.stars)}
              >
                <div className="flex items-center gap-1 w-16">
                  <span>{item.stars}</span>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
                <Progress value={item.percentage} className="flex-1" />
                <span className="text-sm text-muted-foreground w-16 text-right">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>Alle</TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
              Ausstehend
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" onClick={() => setStatusFilter("approved")}>Freigegeben</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Bewertungen suchen..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Sterne</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`stars-${stars}`} 
                            checked={ratingFilter === stars}
                            onCheckedChange={() => setRatingFilter(ratingFilter === stars ? "all" : stars)}
                          />
                          <label htmlFor={`stars-${stars}`} className="text-sm cursor-pointer flex items-center gap-1">
                            {stars} <Star className="h-3 w-3 text-warning fill-warning" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {(statusFilter !== "all" || ratingFilter !== "all") && (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => { setStatusFilter("all"); setRatingFilter("all"); }}>
                      Filter zurücksetzen
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {(statusFilter !== "all" || ratingFilter !== "all") && (
              <Button variant="ghost" onClick={() => { setStatusFilter("all"); setRatingFilter("all"); }}>
                Filter zurücksetzen
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {filteredReviews.map((review) => (
            <Card 
              key={review.id} 
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => handleReviewClick(review.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {review.customer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.customer}</span>
                        <Badge className={getStatusColor(review.status)} variant="secondary">
                          {review.status === "approved" && "Freigegeben"}
                          {review.status === "pending" && "Ausstehend"}
                          {review.status === "rejected" && "Abgelehnt"}
                        </Badge>
                        {review.hasResponse && (
                          <Badge variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Beantwortet
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-muted-foreground">
                          für {review.product}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          • {new Date(review.date).toLocaleDateString("de-CH")}
                        </span>
                      </div>
                      <h4 className="font-medium mb-1">{review.title}</h4>
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ThumbsUp className="h-4 w-4" />
                          {review.helpful} hilfreich
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ThumbsDown className="h-4 w-4" />
                          {review.notHelpful}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {review.status === "pending" && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-green-600"
                          onClick={(e) => handleApprove(review.id, e)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600"
                          onClick={(e) => handleReject(review.id, e)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => handleReply(review.id, e)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => handleFlag(review.id, e)}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filteredReviews.filter(r => r.status === "pending").map((review) => (
            <Card 
              key={review.id} 
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => handleReviewClick(review.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {review.customer.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.customer}</span>
                        <Badge className={getStatusColor(review.status)} variant="secondary">Ausstehend</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-muted-foreground">für {review.product}</span>
                      </div>
                      <h4 className="font-medium mb-1">{review.title}</h4>
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-green-600" onClick={(e) => handleApprove(review.id, e)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={(e) => handleReject(review.id, e)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filteredReviews.filter(r => r.status === "approved").map((review) => (
            <Card 
              key={review.id} 
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => handleReviewClick(review.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {review.customer.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.customer}</span>
                        <Badge className={getStatusColor(review.status)} variant="secondary">Freigegeben</Badge>
                        {review.hasResponse && (
                          <Badge variant="outline"><MessageSquare className="h-3 w-3 mr-1" />Beantwortet</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-muted-foreground">für {review.product}</span>
                      </div>
                      <h4 className="font-medium mb-1">{review.title}</h4>
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={(e) => handleReply(review.id, e)}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auf Bewertung antworten</DialogTitle>
            <DialogDescription>
              {selectedReviewId && reviews.find(r => r.id === selectedReviewId) && (
                <>Antwort an {reviews.find(r => r.id === selectedReviewId)?.customer}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="Ihre Antwort eingeben..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSendReply}>
              Antwort senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
