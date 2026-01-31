import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    MessageSquare,
} from "lucide-react";

const ContactPage = () => {
    const contactInfo = [
        {
            icon: MapPin,
            title: "Visit Us",
            details: ["123 Bike Street", "Pune, Maharashtra 411001"],
        },
        {
            icon: Phone,
            title: "Call Us",
            details: ["+91 98765 43210", "+91 87654 32109"],
        },
        {
            icon: Mail,
            title: "Email Us",
            details: ["info@rideongo.com", "support@rideongo.com"],
        },
        {
            icon: Clock,
            title: "Working Hours",
            details: ["Mon - Sat: 8AM - 8PM", "Sunday: 9AM - 6PM"],
        },
    ];

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="py-16 bg-gradient-to-br from-red-500/10 via-background to-red-500/5">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <MessageSquare className="h-4 w-4" />
                        Get in Touch
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        We'd Love to
                        <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                            {" "}Hear From You
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Have questions about our bikes or services? Need help with a
                        booking? Our friendly team is here to help!
                    </p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {contactInfo.map((info, index) => {
                            const Icon = info.icon;
                            return (
                                <Card
                                    key={index}
                                    className="border-none bg-muted/30 hover:-translate-y-2 transition-all duration-300"
                                >
                                    <CardContent className="p-6 text-center">
                                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <Icon className="h-7 w-7 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                                        {info.details.map((detail, i) => (
                                            <p key={i} className="text-muted-foreground text-sm">
                                                {detail}
                                            </p>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Form */}
                        <Card className="border-none shadow-2xl">
                            <CardContent className="p-8">
                                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                                <form className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">First Name</label>
                                            <Input placeholder="John" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Last Name</label>
                                            <Input placeholder="Doe" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input type="email" placeholder="john@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone</label>
                                        <Input type="tel" placeholder="+91 98765 43210" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject</label>
                                        <Input placeholder="How can we help?" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Message</label>
                                        <textarea
                                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                    </div>
                                    <Button className="w-full" size="lg">
                                        Send Message
                                        <Send className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Map Placeholder */}
                        <div className="space-y-6">
                            <div className="rounded-2xl overflow-hidden bg-muted h-[400px] flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">📍</div>
                                    <h3 className="text-xl font-semibold mb-2">Find Us Here</h3>
                                    <p className="text-muted-foreground">
                                        123 Bike Street, Pune
                                    </p>
                                    <Button variant="outline" className="mt-4">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        Get Directions
                                    </Button>
                                </div>
                            </div>

                            <Card className="border-none bg-gradient-to-r from-red-500 to-red-600 text-white">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold mb-2">Quick Support</h3>
                                    <p className="opacity-90 mb-4">
                                        Need immediate assistance? Call our 24/7 support line.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5" />
                                        <span className="text-lg font-semibold">+91 98765 43210</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
