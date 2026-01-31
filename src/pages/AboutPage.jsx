import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
    Users,
    Target,
    Award,
    Bike,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

const AboutPage = () => {
    const values = [
        {
            icon: Target,
            title: "Our Mission",
            description:
                "To make eco-friendly transportation accessible to everyone while providing an exceptional rental experience.",
        },
        {
            icon: Users,
            title: "Our Team",
            description:
                "A passionate group of cycling enthusiasts dedicated to promoting sustainable urban mobility.",
        },
        {
            icon: Award,
            title: "Our Promise",
            description:
                "Premium quality bikes, transparent pricing, and customer service that goes the extra mile.",
        },
    ];


    const benefits = [
        "Well-maintained premium bikes",
        "Affordable hourly & daily rates",
        "Free helmets & safety gear",
        "24/7 roadside assistance",
        "Easy online booking",
        "Multiple pickup locations",
    ];

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-background to-red-500/10" />
                <div className="absolute top-10 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Bike className="h-4 w-4" />
                            About Ride On Go
                        </div>
                        <h1 className="text-5xl font-bold mb-6">
                            Revolutionizing Urban
                            <span className="block bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                                Mobility
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            We believe that sustainable transportation should be accessible,
                            affordable, and enjoyable for everyone. Since 2020, we've been on
                            a mission to transform how people move around cities.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <Card
                                    key={index}
                                    className="border-none bg-background hover:-translate-y-2 transition-all duration-300"
                                >
                                    <CardContent className="p-8 text-center">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                                        <p className="text-muted-foreground">{value.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>


            {/* Benefits Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">Why Riders Love Us</h2>
                            <p className="text-muted-foreground mb-8">
                                We're committed to providing the best bike rental experience
                                with features and benefits that set us apart.
                            </p>
                            <div className="grid gap-4">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/bikes" className="inline-block mt-8">
                                <Button size="lg">
                                    Start Riding
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                        <div className="text-center text-[150px] leading-none">
                            🚴‍♂️
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
