import { Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Contact = () => {
  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent! We will get back to you soon.");
  };

  return (
    <section
      id="contact"
      className="container mx-auto px-4 py-20 scroll-mt-16 bg-gradient-to-br from-background via-accent/20 to-primary/5"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Get in Touch
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Let's start a
            conversation about your safety needs.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Form */}
          <Card className="animate-fade-in shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                Send us a message
              </CardTitle>
              <CardDescription className="text-base">
                Fill out the form below and we'll get back to you within 24
                hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    required
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your safety needs..."
                    rows={6}
                    required
                    className="text-base resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-medium"
                >
                  Send Message
                  <Mail className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;
